"use client";

import { useState, useCallback } from "react";
import { PeptideTracker } from "./PeptideTracker";

interface Medication {
  name: string;
  dosage: string;
}

interface MedLog {
  [dateKey: string]: { [medName: string]: number | boolean };
}

/** Get the dose count for a med on a given day (handles legacy boolean values). */
function getDoseCount(log: MedLog, day: string, medName: string): number {
  const val = log[day]?.[medName];
  if (val === true) return 1;
  if (typeof val === "number") return val;
  return 0;
}

const STORAGE_KEY = "pulseai_medlog";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Parse a dosage string to determine how many doses per week are expected. */
function parseDosesPerWeek(dosage: string): number {
  const d = dosage.toLowerCase();
  if (d.includes("3x daily") || d.includes("three times daily") || d.includes("tid")) return 21;
  if (d.includes("twice daily") || d.includes("2x daily") || d.includes("bid")) return 14;
  if (d.includes("daily") || d.includes("every day") || d.includes("once daily") || d.includes("qd")) return 7;
  if (d.includes("every other day") || d.includes("eod")) return 4;
  if (d.includes("3x weekly") || d.includes("three times a week") || d.includes("3 times a week")) return 3;
  if (d.includes("twice weekly") || d.includes("2x weekly") || d.includes("twice a week")) return 2;
  if (d.includes("weekly") || d.includes("once a week") || d.includes("once weekly")) return 1;
  if (d.includes("as needed") || d.includes("prn")) return 0; // no fixed schedule
  if (d.includes("at bedtime") || d.includes("qhs")) return 7;
  // Default: assume daily
  return 7;
}

/** How many doses per day this med expects (for daily checklist logic). */
function parseDosesPerDay(dosage: string): number {
  const d = dosage.toLowerCase();
  if (d.includes("3x daily") || d.includes("three times daily") || d.includes("tid")) return 3;
  if (d.includes("twice daily") || d.includes("2x daily") || d.includes("bid")) return 2;
  if (d.includes("weekly") || d.includes("once a week") || d.includes("once weekly")) return 0; // not every day
  if (d.includes("every other day") || d.includes("eod")) return 0;
  if (d.includes("as needed") || d.includes("prn")) return 0;
  return 1;
}

/** Get a frequency label from dosage. */
function getFrequencyLabel(dosage: string): string {
  const perWeek = parseDosesPerWeek(dosage);
  if (perWeek === 0) return "As needed";
  if (perWeek === 1) return "1x/week";
  if (perWeek === 2) return "2x/week";
  if (perWeek === 3) return "3x/week";
  if (perWeek === 4) return "Every other day";
  if (perWeek === 7) return "Daily";
  if (perWeek === 14) return "2x/day";
  if (perWeek === 21) return "3x/day";
  return `${perWeek}x/week`;
}

interface WeeklyMedAnalysis {
  name: string;
  dosage: string;
  expectedPerWeek: number;
  takenThisWeek: number;
  completionPct: number;
  status: "complete" | "on-track" | "behind" | "missed" | "as-needed" | "extra";
}

function getWeekDates(weekOffset: number): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function loadLog(): MedLog {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

function saveLog(log: MedLog) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch { /* ignore */ }
}

function getStreakCount(log: MedLog, medNames: string[]): number {
  if (medNames.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dateKey(d);
    const dayLog = log[key];
    if (!dayLog) break;
    const allTaken = medNames.every((name) => getDoseCount(log, key, name) > 0);
    if (allTaken) streak++;
    else break;
  }
  return streak;
}

function analyzeWeeklyMeds(log: MedLog, medications: Medication[], weekDates: Date[]): WeeklyMedAnalysis[] {
  const now = new Date();
  const elapsedDays = weekDates.filter((d) => d <= now || isToday(d)).length;

  return medications.map((med) => {
    const expectedPerWeek = parseDosesPerWeek(med.dosage);

    if (expectedPerWeek === 0) {
      let takenThisWeek = 0;
      for (const d of weekDates) {
        takenThisWeek += getDoseCount(log, dateKey(d), med.name);
      }
      return { name: med.name, dosage: med.dosage, expectedPerWeek: 0, takenThisWeek, completionPct: 0, status: "as-needed" as const };
    }

    // Count total doses taken this week
    let takenThisWeek = 0;
    for (const d of weekDates) {
      takenThisWeek += getDoseCount(log, dateKey(d), med.name);
    }

    const completionPct = expectedPerWeek > 0 ? Math.min(100, Math.round((takenThisWeek / expectedPerWeek) * 100)) : 0;

    // Determine status based on pace
    const expectedSoFar = Math.round((expectedPerWeek / 7) * elapsedDays);
    let status: WeeklyMedAnalysis["status"];
    if (takenThisWeek > expectedPerWeek) {
      status = "extra";
    } else if (takenThisWeek >= expectedPerWeek) {
      status = "complete";
    } else if (takenThisWeek >= expectedSoFar) {
      status = "on-track";
    } else if (takenThisWeek > 0) {
      status = "behind";
    } else {
      status = "missed";
    }

    return { name: med.name, dosage: med.dosage, expectedPerWeek, takenThisWeek, completionPct, status };
  });
}

function getWeeklyAdherence(log: MedLog, medications: Medication[], weekDates: Date[]): number {
  const analyses = analyzeWeeklyMeds(log, medications, weekDates);
  const scheduled = analyses.filter((a) => a.status !== "as-needed");
  if (scheduled.length === 0) return 0;
  const totalExpected = scheduled.reduce((sum, a) => sum + a.expectedPerWeek, 0);
  const totalTaken = scheduled.reduce((sum, a) => sum + Math.min(a.takenThisWeek, a.expectedPerWeek), 0);
  return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
}

const COMMON_MEDICATIONS = [
  "Lisinopril", "Metformin", "Atorvastatin", "Amlodipine", "Omeprazole",
  "Losartan", "Levothyroxine", "Albuterol", "Gabapentin", "Sertraline",
  "Metoprolol", "Ibuprofen", "Prednisone", "Acetaminophen", "Aspirin",
];

const DOSAGE_UNITS = ["mg", "mcg", "ml", "g", "IU"];

const FREQUENCY_OPTIONS_MED = [
  "daily", "twice daily", "3x daily", "every other day",
  "weekly", "twice weekly", "3x weekly", "as needed", "at bedtime",
];

export function MedTrackerTab({ medications, onUpdateMedications }: { medications: Medication[]; onUpdateMedications?: (meds: Medication[]) => void }) {
  const [subTab, setSubTab] = useState<"medications" | "peptides">("medications");
  const [log, setLog] = useState<MedLog>(() => loadLog());
  const [weekOffset, setWeekOffset] = useState(0);
  const [addingMed, setAddingMed] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedAmount, setNewMedAmount] = useState("");
  const [newMedUnit, setNewMedUnit] = useState("mg");
  const [newMedFrequency, setNewMedFrequency] = useState("daily");

  const weekDates = getWeekDates(weekOffset);
  const medNames = medications.map((m) => m.name);
  const todayKey = dateKey(new Date());
  const todayLog = log[todayKey] || {};
  const streak = getStreakCount(log, medNames);
  const adherence = getWeeklyAdherence(log, medications, weekDates);
  const weeklyAnalysis = analyzeWeeklyMeds(log, medications, weekDates);

  /** Add one dose for a med on a given day. */
  const addDose = useCallback((day: string, medName: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      const current = getDoseCount(updated, day, medName);
      updated[day] = { ...updated[day], [medName]: current + 1 };
      saveLog(updated);
      return updated;
    });
  }, []);

  /** Remove one dose for a med on a given day. */
  const removeDose = useCallback((day: string, medName: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (!updated[day]) return prev;
      const current = getDoseCount(updated, day, medName);
      if (current <= 0) return prev;
      updated[day] = { ...updated[day], [medName]: current - 1 };
      saveLog(updated);
      return updated;
    });
  }, []);

  /** Toggle for weekly grid cells (single-dose toggle). */
  const toggleMed = useCallback((day: string, medName: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      const current = getDoseCount(updated, day, medName);
      updated[day] = { ...updated[day], [medName]: current > 0 ? 0 : 1 };
      saveLog(updated);
      return updated;
    });
  }, []);

  const addMedication = () => {
    if (!newMedName.trim() || !onUpdateMedications) return;
    const dosage = newMedAmount ? `${newMedAmount}${newMedUnit} ${newMedFrequency}` : newMedFrequency;
    const updated = [...medications, { name: newMedName.trim(), dosage }];
    onUpdateMedications(updated);
    setNewMedName("");
    setNewMedAmount("");
    setNewMedUnit("mg");
    setNewMedFrequency("daily");
    setAddingMed(false);
  };

  const removeMedication = (index: number) => {
    if (!onUpdateMedications) return;
    onUpdateMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: Partial<Medication>) => {
    if (!onUpdateMedications) return;
    const updated = [...medications];
    updated[index] = { ...updated[index], ...field };
    onUpdateMedications(updated);
  };

  const todayDoses = medications.map((m) => ({
    med: m,
    dosesPerDay: parseDosesPerDay(m.dosage),
    taken: getDoseCount(log, todayKey, m.name),
  }));
  const todayTaken = todayDoses.reduce((sum, d) => sum + Math.min(d.taken, Math.max(d.dosesPerDay, 1)), 0);
  const todayTotal = todayDoses.reduce((sum, d) => sum + Math.max(d.dosesPerDay, 1), 0);

  // Sub-tab bar component
  const subTabBar = (
    <div className="flex items-center gap-1 mb-6">
      {(["medications", "peptides"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setSubTab(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            subTab === tab
              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
              : "text-slate-400 hover:text-slate-200 border border-transparent"
          }`}
        >
          {tab === "medications" ? "Medications" : "Peptide Tracker"}
        </button>
      ))}
    </div>
  );

  // Peptide sub-tab
  if (subTab === "peptides") {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {subTabBar}
          <PeptideTracker />
        </div>
      </div>
    );
  }

  // No medications configured
  if (medications.length === 0 && !addingMed) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {subTabBar}
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">No Medications</h2>
            <p className="text-sm text-slate-400 mb-6">
              Add your medications to start tracking adherence.
            </p>
            {onUpdateMedications && (
              <button
                onClick={() => setAddingMed(true)}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add First Medication
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {subTabBar}
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Medication Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your daily medications and build healthy habits</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-400">{todayTaken}/{todayTotal}</p>
            <p className="text-xs text-teal-400/70">Today</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{streak}</p>
            <p className="text-xs text-purple-400/70">Day Streak</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{adherence}%</p>
            <p className="text-xs text-blue-400/70">This Week</p>
          </div>
        </div>

        {/* Today's checklist */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Today&apos;s Medications</h3>
          <div className="space-y-2">
            {todayDoses.map(({ med, dosesPerDay, taken }) => {
              const required = Math.max(dosesPerDay, 1);
              const allDone = taken >= required;

              return (
                <div
                  key={med.name}
                  className={`p-3 rounded-lg border transition-all ${
                    allDone
                      ? "bg-teal-500/10 border-teal-500/30"
                      : "bg-slate-800/40 border-slate-700/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {/* Med info */}
                    <div>
                      <p className={`text-sm font-medium transition-colors ${allDone ? "text-teal-300" : "text-slate-200"}`}>
                        {med.name.charAt(0).toUpperCase() + med.name.slice(1)}
                      </p>
                      <p className="text-[11px] text-slate-500">{med.dosage}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{taken}/{required}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        allDone ? "bg-teal-500/20 text-teal-400" : taken > 0 ? "bg-amber-500/20 text-amber-400" : "bg-slate-700/50 text-slate-500"
                      }`}>
                        {allDone ? "Complete" : taken > 0 ? "In Progress" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Dose checkboxes */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: required }, (_, i) => {
                      const checked = i < taken;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (checked && i === taken - 1) {
                              // Uncheck the last checked dose
                              removeDose(todayKey, med.name);
                            } else if (!checked && i === taken) {
                              // Check the next unchecked dose
                              addDose(todayKey, med.name);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                            checked
                              ? "bg-teal-500/20 border-teal-500/30 text-teal-400"
                              : i === taken
                              ? "bg-slate-800/60 border-slate-600/50 text-slate-300 hover:border-teal-500/40 hover:bg-teal-500/5"
                              : "bg-slate-800/30 border-slate-700/20 text-slate-600 cursor-default"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            checked ? "bg-teal-500 border-teal-500" : i === taken ? "border-slate-500" : "border-slate-700"
                          }`}>
                            {checked && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          Dose {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Daily progress</span>
              <span>{todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${todayTotal > 0 ? (todayTaken / todayTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly completion analysis */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Weekly Completion</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              adherence >= 90 ? "bg-teal-500/20 text-teal-400"
              : adherence >= 60 ? "bg-amber-500/20 text-amber-400"
              : "bg-red-500/20 text-red-400"
            }`}>
              {adherence}% overall
            </span>
          </div>

          <div className="space-y-3">
            {weeklyAnalysis.map((a) => {
              const statusConfig = {
                extra:     { color: "text-red-400",    bg: "bg-red-500/10",   border: "border-red-500/20",   bar: "bg-red-500",    label: "Extra Dose" },
                complete:  { color: "text-teal-400",   bg: "bg-teal-500/10",  border: "border-teal-500/20",  bar: "bg-teal-500",   label: "Complete" },
                "on-track":{ color: "text-blue-400",   bg: "bg-blue-500/10",  border: "border-blue-500/20",  bar: "bg-blue-500",   label: "On Track" },
                behind:    { color: "text-amber-400",  bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "bg-amber-500",  label: "Behind" },
                missed:    { color: "text-red-400",    bg: "bg-red-500/10",   border: "border-red-500/20",   bar: "bg-red-500",    label: "Missed" },
                "as-needed":{ color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", bar: "bg-slate-500",  label: "As Needed" },
              }[a.status];

              return (
                <div key={a.name} className={`${statusConfig.bg} border ${statusConfig.border} rounded-lg p-3`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200">
                        {a.name.charAt(0).toUpperCase() + a.name.slice(1)}
                      </p>
                      <span className="text-[10px] text-slate-500">{getFrequencyLabel(a.dosage)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.status === "as-needed" ? (
                        <span className="text-xs font-mono text-slate-300">
                          {a.takenThisWeek}x taken
                        </span>
                      ) : a.status === "extra" ? (
                        <span className="text-xs font-mono text-red-400">
                          {a.takenThisWeek}/{a.expectedPerWeek} (+{a.takenThisWeek - a.expectedPerWeek} extra)
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-300">
                          {a.takenThisWeek}/{a.expectedPerWeek}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {a.status !== "as-needed" && (
                    <div className="h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusConfig.bar} rounded-full transition-all duration-300`}
                        style={{ width: `${a.completionPct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary text */}
          {(() => {
            const scheduled = weeklyAnalysis.filter((a) => a.status !== "as-needed");
            const complete = scheduled.filter((a) => a.status === "complete").length;
            const behind = scheduled.filter((a) => a.status === "behind" || a.status === "missed").length;

            if (scheduled.length === 0) return null;

            return (
              <div className={`mt-4 pt-3 border-t ${adherence >= 90 ? "border-teal-500/20" : adherence >= 60 ? "border-amber-500/20" : "border-red-500/20"}`}>
                <p className="text-xs text-slate-400">
                  {adherence >= 90 ? (
                    <>Great job! You&apos;re on track with {complete}/{scheduled.length} medications completed this week.</>
                  ) : adherence >= 60 ? (
                    <>You&apos;re making progress. {complete}/{scheduled.length} completed, but {behind} medication{behind !== 1 ? "s" : ""} need{behind === 1 ? "s" : ""} attention.</>
                  ) : (
                    <>{behind} of {scheduled.length} medication{scheduled.length !== 1 ? "s" : ""} {behind !== 1 ? "are" : "is"} behind schedule. Try setting a daily reminder to stay consistent.</>
                  )}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Weekly schedule */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Weekly Schedule</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  weekOffset === 0
                    ? "bg-teal-500 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Week date header */}
          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
            <div />
            {weekDates.map((d) => {
              const today = isToday(d);
              return (
                <div key={dateKey(d)} className={`text-center py-1.5 rounded-lg ${today ? "bg-teal-500/20" : ""}`}>
                  <p className={`text-[10px] font-bold uppercase ${today ? "text-teal-400" : "text-slate-500"}`}>
                    {DAY_NAMES[d.getDay()]}
                  </p>
                  <p className={`text-xs ${today ? "text-teal-300 font-semibold" : "text-slate-400"}`}>
                    {d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Medication rows */}
          <div className="space-y-1">
            {medications.map((med) => (
              <div key={med.name} className="grid gap-1 items-center" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
                <div className="pr-2">
                  <p className="text-xs font-medium text-slate-300 truncate">{med.name.charAt(0).toUpperCase() + med.name.slice(1)}</p>
                  <p className="text-[9px] text-slate-600 truncate">{med.dosage}</p>
                </div>
                {weekDates.map((d) => {
                  const key = dateKey(d);
                  const count = getDoseCount(log, key, med.name);
                  const isFuture = d > new Date() && !isToday(d);
                  const today = isToday(d);
                  const perDay = parseDosesPerDay(med.dosage);
                  const required = Math.max(perDay, 1);
                  const allDone = count >= required;
                  const extra = count > required;

                  return (
                    <button
                      key={key}
                      onClick={() => !isFuture && toggleMed(key, med.name)}
                      disabled={isFuture}
                      className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                        isFuture
                          ? "bg-slate-800/20 cursor-not-allowed"
                          : extra
                          ? "bg-red-500/20 border border-red-500/40 hover:bg-red-500/30"
                          : allDone
                          ? "bg-teal-500/30 border border-teal-500/40 hover:bg-teal-500/40"
                          : count > 0
                          ? "bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30"
                          : today
                          ? "bg-slate-700/40 border border-teal-500/20 hover:bg-slate-700/60"
                          : "bg-slate-800/30 border border-slate-700/20 hover:bg-slate-700/40"
                      }`}
                      title={extra ? `${count}/${required} doses — EXTRA` : `${count}/${required} doses`}
                    >
                      {extra ? (
                        <span className="text-[9px] font-bold text-red-400">+{count - required}</span>
                      ) : allDone ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : count > 0 ? (
                        <span className="text-[9px] font-bold text-amber-400">{count}</span>
                      ) : isFuture ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700/20">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/40" />
              <span className="text-[10px] text-slate-500">Taken</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
              <span className="text-[10px] text-slate-500">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40" />
              <span className="text-[10px] text-slate-500">Extra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-800/30 border border-slate-700/20" />
              <span className="text-[10px] text-slate-500">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-800/20" />
              <span className="text-[10px] text-slate-500">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Monthly overview */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Last 30 Days</h3>
          <div className="flex gap-0.5 flex-wrap">
            {Array.from({ length: 30 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              const key = dateKey(d);
              let totalExpected = 0;
              let totalTaken = 0;
              for (const med of medications) {
                const perDay = parseDosesPerDay(med.dosage);
                const required = Math.max(perDay, 1);
                totalExpected += required;
                totalTaken += Math.min(getDoseCount(log, key, med.name), required);
              }
              const ratio = totalExpected > 0 ? totalTaken / totalExpected : 0;

              let colorClass = "bg-slate-800/40";
              if (ratio === 1) colorClass = "bg-teal-500";
              else if (ratio >= 0.5) colorClass = "bg-teal-500/50";
              else if (ratio > 0) colorClass = "bg-teal-500/20";

              return (
                <div
                  key={key}
                  className={`w-4 h-4 rounded-sm ${colorClass} transition-colors`}
                  title={`${key}: ${totalTaken}/${totalExpected} doses`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-800/40" />
              <span className="text-[9px] text-slate-600">None</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-teal-500/20" />
              <span className="text-[9px] text-slate-600">Some</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-teal-500/50" />
              <span className="text-[9px] text-slate-600">Most</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-teal-500" />
              <span className="text-[9px] text-slate-600">All</span>
            </div>
          </div>
        </div>

        {/* Your Medications — management section */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Your Medications</h3>
          {medications.length > 0 && (
            <div className="space-y-2 mb-4">
              {medications.map((m, i) => {
                const match = m.dosage.match(/^([\d.]+)\s*(mg|mcg|ml|g|IU)\s*(.*)/i);
                const amount = match ? match[1] : "";
                const unit = match ? match[2].toLowerCase() : "mg";
                const freq = match ? match[3].trim() : m.dosage;
                return (
                  <div key={`${m.name}-${i}`} className="bg-slate-800/60 border border-slate-700/30 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-200">{m.name}</p>
                      {onUpdateMedications && (
                        <button
                          onClick={() => removeMedication(i)}
                          className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                    {onUpdateMedications ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const newDosage = e.target.value ? `${e.target.value}${unit} ${freq}` : freq;
                            updateMedication(i, { dosage: newDosage });
                          }}
                          placeholder="0"
                          className="w-20 bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-teal-500/50"
                        />
                        <select
                          value={unit}
                          onChange={(e) => {
                            const newDosage = amount ? `${amount}${e.target.value} ${freq}` : `${e.target.value} ${freq}`;
                            updateMedication(i, { dosage: newDosage });
                          }}
                          className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                        >
                          {DOSAGE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <select
                          value={freq || "daily"}
                          onChange={(e) => {
                            const newDosage = amount ? `${amount}${unit} ${e.target.value}` : e.target.value;
                            updateMedication(i, { dosage: newDosage });
                          }}
                          className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                        >
                          {FREQUENCY_OPTIONS_MED.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">{m.dosage}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add form */}
          {onUpdateMedications && addingMed ? (
            <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-4 space-y-3">
              {/* Word bank */}
              <div>
                <p className="text-[10px] text-slate-600 mb-2">Common medications — click to fill</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_MEDICATIONS.map((name) => {
                    const exists = medications.some((m) => m.name.toLowerCase() === name.toLowerCase());
                    return (
                      <button
                        key={name}
                        onClick={() => { if (!exists) setNewMedName(name); }}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          exists
                            ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                            : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600"
                        }`}
                      >
                        {exists ? `${name} \u2713` : name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Medication Name</label>
                <input type="text" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder="e.g. Lisinopril" className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors" autoFocus />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Dosage</label>
                <div className="flex gap-2">
                  <input type="number" value={newMedAmount} onChange={(e) => setNewMedAmount(e.target.value)} placeholder="e.g. 10" className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors" />
                  <select value={newMedUnit} onChange={(e) => setNewMedUnit(e.target.value)} className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors">
                    {DOSAGE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Frequency</label>
                <select value={newMedFrequency} onChange={(e) => setNewMedFrequency(e.target.value)} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors">
                  {FREQUENCY_OPTIONS_MED.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addMedication} className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors">
                  Add Medication
                </button>
                <button onClick={() => { setAddingMed(false); setNewMedName(""); setNewMedAmount(""); setNewMedUnit("mg"); setNewMedFrequency("daily"); }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : onUpdateMedications ? (
            <button
              onClick={() => setAddingMed(true)}
              className="w-full py-2.5 border border-dashed border-slate-700/50 rounded-lg text-sm text-slate-500 hover:text-teal-400 hover:border-teal-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-base leading-none">+</span> Add medication
            </button>
          ) : null}
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}
