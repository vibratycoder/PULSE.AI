"use client";

import { useState, useCallback } from "react";
import { dateKey, isToday, getWeekDates, DAY_NAMES } from "./utils";

type DosageUnit = "mcg" | "mg" | "IU" | "ml";
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Before Bed";

interface PeptideEntry {
  name: string;
  dosage: number;
  unit: DosageUnit;
  frequency: string;
  site: string;
  timing: TimeOfDay;
}

interface PeptideLogEntry {
  taken: boolean;
  site: string;
  time: string;
}

interface PeptideLog {
  [dateKey: string]: { [peptideName: string]: PeptideLogEntry };
}

const DOSAGE_UNITS: { value: DosageUnit; label: string }[] = [
  { value: "mcg", label: "mcg" },
  { value: "mg", label: "mg" },
  { value: "IU", label: "IU" },
  { value: "ml", label: "ml" },
];

const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Before Bed"];

const STORAGE_KEY = "pulseai_peptidelog";
const PEPTIDES_KEY = "pulseai_peptides";

const COMMON_PEPTIDES = [
  "BPC-157", "TB-500", "CJC-1295", "Ipamorelin", "GHK-Cu",
  "Selank", "Semax", "PT-141", "DSIP", "Epithalon",
  "Thymosin Alpha-1", "KPV", "LL-37", "MOTS-c", "SS-31",
];

const INJECTION_SITES = [
  "Abdomen (left)", "Abdomen (right)",
  "Thigh (left)", "Thigh (right)",
  "Deltoid (left)", "Deltoid (right)",
  "Glute (left)", "Glute (right)",
];

const FREQUENCY_OPTIONS = [
  "Daily", "Twice daily", "Every other day",
  "3x per week", "2x per week", "Weekly",
  "5 days on / 2 off", "As needed",
];

function loadLog(): PeptideLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLog(log: PeptideLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function loadPeptides(): PeptideEntry[] {
  try {
    const raw = localStorage.getItem(PEPTIDES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old entries without timing
    return parsed.map((p: PeptideEntry) => ({
      ...p,
      timing: p.timing || "Morning",
    }));
  } catch { return []; }
}

function savePeptides(entries: PeptideEntry[]) {
  localStorage.setItem(PEPTIDES_KEY, JSON.stringify(entries));
}

/** Is a peptide scheduled on a given date based on its frequency? */
function isDueOnDate(freq: string, date: Date): boolean {
  const d = freq.toLowerCase();
  if (d.includes("as needed")) return false;
  if (d.includes("daily") || d.includes("twice daily")) return true;
  if (d.includes("every other day")) {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % 2 === 0;
  }
  const dow = date.getDay();
  if (d.includes("3x per week")) return [1, 3, 5].includes(dow);
  if (d.includes("2x per week")) return [1, 4].includes(dow);
  if (d.includes("weekly")) return dow === 1;
  if (d.includes("5 days on")) return dow >= 1 && dow <= 5;
  return true;
}

/** Static nominal doses per week — used only for display labels. */
function parseDosesPerWeekNominal(freq: string): number {
  const d = freq.toLowerCase();
  if (d.includes("twice daily")) return 14;
  if (d.includes("daily")) return 7;
  if (d.includes("every other day")) return 4;
  if (d.includes("3x per week")) return 3;
  if (d.includes("2x per week")) return 2;
  if (d.includes("weekly")) return 1;
  if (d.includes("5 days on")) return 5;
  if (d.includes("as needed")) return 0;
  return 7;
}

/** Dynamic doses expected for a specific week — counts actual scheduled days. */
function countDueInWeek(freq: string, weekDates: Date[]): number {
  if (freq.toLowerCase().includes("as needed")) return 0;
  const dosesPerDay = parseDosesPerDay(freq);
  let total = 0;
  for (const d of weekDates) {
    if (isDueOnDate(freq, d)) {
      total += Math.max(dosesPerDay, 1);
    }
  }
  return total;
}

/** How many doses per day (for daily checklist). */
function parseDosesPerDay(freq: string): number {
  const d = freq.toLowerCase();
  if (d.includes("twice daily")) return 2;
  if (d.includes("daily")) return 1;
  if (d.includes("5 days on")) return 1;
  // Non-daily schedules
  return 1;
}

function getFrequencyLabel(freq: string): string {
  const perWeek = parseDosesPerWeekNominal(freq);
  if (perWeek === 0) return "As needed";
  if (perWeek === 1) return "1x/week";
  if (perWeek === 2) return "2x/week";
  if (perWeek === 3) return "3x/week";
  if (perWeek === 4) return "Every other day";
  if (perWeek === 5) return "5 on / 2 off";
  if (perWeek === 7) return "Daily";
  if (perWeek === 14) return "2x/day";
  return `${perWeek}x/week`;
}

const TIMING_ICONS: Record<TimeOfDay, string> = {
  "Morning": "\u2600",    // sun
  "Afternoon": "\u26C5",  // cloud-sun
  "Evening": "\uD83C\uDF19",  // crescent
  "Before Bed": "\uD83D\uDCA4", // zzz
};

interface WeeklyPeptideAnalysis {
  name: string;
  frequency: string;
  expectedPerWeek: number;
  takenThisWeek: number;
  completionPct: number;
  status: "complete" | "on-track" | "behind" | "missed" | "as-needed" | "extra";
}

function analyzeWeekly(log: PeptideLog, peptides: PeptideEntry[], weekDates: Date[]): WeeklyPeptideAnalysis[] {
  const now = new Date();

  return peptides.map((p) => {
    // Dynamically count how many doses are actually expected this specific week
    const expectedPerWeek = countDueInWeek(p.frequency, weekDates);

    let takenThisWeek = 0;
    for (const d of weekDates) {
      if (log[dateKey(d)]?.[p.name]?.taken) takenThisWeek++;
    }

    if (expectedPerWeek === 0) {
      return { name: p.name, frequency: p.frequency, expectedPerWeek: 0, takenThisWeek, completionPct: 0, status: "as-needed" as const };
    }

    const completionPct = Math.min(100, Math.round((takenThisWeek / expectedPerWeek) * 100));

    // Count how many doses were expected so far (only elapsed/due days)
    const elapsedDue = weekDates.filter((d) => (d <= now || isToday(d)) && isDueOnDate(p.frequency, d)).length;

    let status: WeeklyPeptideAnalysis["status"];
    if (takenThisWeek > expectedPerWeek) status = "extra";
    else if (takenThisWeek >= expectedPerWeek) status = "complete";
    else if (takenThisWeek >= elapsedDue) status = "on-track";
    else if (takenThisWeek > 0) status = "behind";
    else status = "missed";

    return { name: p.name, frequency: p.frequency, expectedPerWeek, takenThisWeek, completionPct, status };
  });
}

function getAdherence(log: PeptideLog, peptides: PeptideEntry[], weekDates: Date[]): number {
  const analyses = analyzeWeekly(log, peptides, weekDates);
  const scheduled = analyses.filter((a) => a.status !== "as-needed");
  if (scheduled.length === 0) return 0;
  const totalExpected = scheduled.reduce((sum, a) => sum + a.expectedPerWeek, 0);
  const totalTaken = scheduled.reduce((sum, a) => sum + Math.min(a.takenThisWeek, a.expectedPerWeek), 0);
  return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
}

function getStreak(log: PeptideLog, peptides: PeptideEntry[]): number {
  if (peptides.length === 0) return 0;
  const scheduled = peptides.filter((p) => parseDosesPerWeekNominal(p.frequency) > 0);
  if (scheduled.length === 0) return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dk = dateKey(d);
    // Only count days where at least one peptide was due
    const dueToday = scheduled.filter((p) => isDueOnDate(p.frequency, d));
    if (dueToday.length === 0) {
      d.setDate(d.getDate() - 1);
      continue; // Skip non-scheduled days
    }
    const allTaken = dueToday.every((p) => log[dk]?.[p.name]?.taken);
    if (allTaken) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function PeptideTracker() {
  const [peptides, setPeptides] = useState<PeptideEntry[]>(() => loadPeptides());
  const [log, setLog] = useState<PeptideLog>(() => loadLog());
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newUnit, setNewUnit] = useState<DosageUnit>("mcg");
  const [newFrequency, setNewFrequency] = useState("Daily");
  const [newSite, setNewSite] = useState(INJECTION_SITES[0]);
  const [newTiming, setNewTiming] = useState<TimeOfDay>("Morning");
  const [weekOffset, setWeekOffset] = useState(0);

  const today = dateKey(new Date());
  const weekDates = getWeekDates(weekOffset);
  const streak = getStreak(log, peptides);
  const adherence = getAdherence(log, peptides, weekDates);
  const weeklyAnalysis = analyzeWeekly(log, peptides, weekDates);

  const todayDate = new Date();
  const todaysDue = peptides.filter((p) => isDueOnDate(p.frequency, todayDate));
  const todaysTaken = todaysDue.filter((p) => log[today]?.[p.name]?.taken);

  const addPeptide = () => {
    if (!newName.trim()) return;
    const entry: PeptideEntry = {
      name: newName.trim(),
      dosage: parseFloat(newDosage) || 0,
      unit: newUnit,
      frequency: newFrequency,
      site: newSite,
      timing: newTiming,
    };
    const updated = [...peptides, entry];
    setPeptides(updated);
    savePeptides(updated);
    setNewName("");
    setNewDosage("");
    setNewUnit("mcg");
    setNewFrequency("Daily");
    setNewSite(INJECTION_SITES[0]);
    setNewTiming("Morning");
    setAdding(false);
  };

  const removePeptide = (index: number) => {
    const updated = peptides.filter((_, i) => i !== index);
    setPeptides(updated);
    savePeptides(updated);
  };

  const updatePeptide = (index: number, field: Partial<PeptideEntry>) => {
    const updated = [...peptides];
    updated[index] = { ...updated[index], ...field };
    setPeptides(updated);
    savePeptides(updated);
  };

  const logDose = useCallback((day: string, peptideName: string, site: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      updated[day] = {
        ...updated[day],
        [peptideName]: {
          taken: true,
          site,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      };
      saveLog(updated);
      return updated;
    });
  }, []);

  const unlogDose = useCallback((day: string, peptideName: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (updated[day]) {
        const { [peptideName]: _, ...rest } = updated[day];
        updated[day] = rest;
      }
      saveLog(updated);
      return updated;
    });
  }, []);

  const toggleDose = useCallback((day: string, peptideName: string, site: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (updated[day]?.[peptideName]?.taken) {
        const { [peptideName]: _, ...rest } = updated[day];
        updated[day] = rest;
      } else {
        if (!updated[day]) updated[day] = {};
        updated[day] = {
          ...updated[day],
          [peptideName]: {
            taken: true,
            site,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        };
      }
      saveLog(updated);
      return updated;
    });
  }, []);

  const inputClass =
    "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors";
  const labelClass = "text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block";

  // Group today's due peptides by timing
  const groupedByTiming = TIME_OPTIONS.reduce<Record<TimeOfDay, typeof todaysDue>>((acc, t) => {
    acc[t] = todaysDue.filter((p) => p.timing === t);
    return acc;
  }, { Morning: [], Afternoon: [], Evening: [], "Before Bed": [] });

  // Empty state
  if (peptides.length === 0 && !adding) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Peptide Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your peptide protocols, timing, and injection sites</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Peptides Configured</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            Add your peptide protocols to start tracking dosages, injection sites, and adherence.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add First Peptide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Peptide Tracker</h2>
        <p className="text-xs text-slate-500 mt-0.5">Track your peptide protocols, timing, and injection sites</p>
      </div>

      {/* Stats cards — matches MedTracker layout */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-teal-400">
            {todaysTaken.length}/{todaysDue.length}
          </p>
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

      {/* Today's Schedule — grouped by timing */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Today&apos;s Schedule</h3>

        {todaysDue.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">No peptides scheduled for today.</p>
        ) : (
          <div className="space-y-4">
            {TIME_OPTIONS.map((timeSlot) => {
              const group = groupedByTiming[timeSlot];
              if (group.length === 0) return null;

              return (
                <div key={timeSlot}>
                  {/* Time slot header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{TIMING_ICONS[timeSlot]}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {timeSlot}
                    </span>
                    <div className="flex-1 h-px bg-slate-700/30" />
                  </div>

                  <div className="space-y-2">
                    {group.map((p) => {
                      const entry = log[today]?.[p.name];
                      const taken = entry?.taken ?? false;

                      return (
                        <div
                          key={p.name}
                          className={`p-3 rounded-lg border transition-all ${
                            taken
                              ? "bg-teal-500/10 border-teal-500/30"
                              : "bg-slate-800/40 border-slate-700/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className={`text-sm font-medium transition-colors ${taken ? "text-teal-300" : "text-slate-200"}`}>
                                {p.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {p.dosage > 0 ? `${p.dosage}${p.unit}` : ""} {p.frequency} &middot; {entry?.site || p.site}
                              </p>
                              {entry?.time && (
                                <p className="text-[10px] text-slate-600 mt-0.5">Logged at {entry.time}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                taken ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/50 text-slate-500"
                              }`}>
                                {taken ? "Complete" : "Pending"}
                              </span>
                            </div>
                          </div>

                          {/* Dose checkbox */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (taken) unlogDose(today, p.name);
                                else logDose(today, p.name, p.site);
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                                taken
                                  ? "bg-teal-500/20 border-teal-500/30 text-teal-400"
                                  : "bg-slate-800/60 border-slate-600/50 text-slate-300 hover:border-teal-500/40 hover:bg-teal-500/5"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                taken ? "bg-teal-500 border-teal-500" : "border-slate-500"
                              }`}>
                                {taken && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              Dose
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Daily progress</span>
            <span>{todaysDue.length > 0 ? Math.round((todaysTaken.length / todaysDue.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${todaysDue.length > 0 ? (todaysTaken.length / todaysDue.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Peptide list / management */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Your Peptides</h3>
        <div className="space-y-2 mb-4">
          {peptides.map((p, i) => (
            <div key={`${p.name}-${i}`} className="bg-slate-800/60 border border-slate-700/30 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-200">{p.name}</p>
                <button
                  onClick={() => removePeptide(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={p.dosage || ""}
                  onChange={(e) => updatePeptide(i, { dosage: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-20 bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-teal-500/50"
                />
                <select
                  value={p.unit || "mcg"}
                  onChange={(e) => updatePeptide(i, { unit: e.target.value as DosageUnit })}
                  className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                >
                  {DOSAGE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
                <select
                  value={p.frequency}
                  onChange={(e) => updatePeptide(i, { frequency: e.target.value })}
                  className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                >
                  {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select
                  value={p.timing}
                  onChange={(e) => updatePeptide(i, { timing: e.target.value as TimeOfDay })}
                  className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{TIMING_ICONS[t]} {t}</option>)}
                </select>
                <select
                  value={p.site}
                  onChange={(e) => updatePeptide(i, { site: e.target.value })}
                  className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer"
                >
                  {INJECTION_SITES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {adding ? (
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-4 space-y-3">
            {/* Quick-add word bank */}
            <div>
              <p className="text-[10px] text-slate-600 mb-2">Common peptides — click to fill</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PEPTIDES.map((name) => {
                  const exists = peptides.some((p) => p.name.toLowerCase() === name.toLowerCase());
                  return (
                    <button
                      key={name}
                      onClick={() => { if (!exists) setNewName(name); }}
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
              <label className={labelClass}>Peptide Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. BPC-157" className={inputClass} autoFocus />
            </div>
            <div>
              <label className={labelClass}>Dosage</label>
              <div className="flex gap-2">
                <input type="number" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} placeholder="e.g. 250" className={`${inputClass} flex-1`} />
                <select value={newUnit} onChange={(e) => setNewUnit(e.target.value as DosageUnit)} className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors">
                  {DOSAGE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Frequency</label>
                <select value={newFrequency} onChange={(e) => setNewFrequency(e.target.value)} className={inputClass}>
                  {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Timing</label>
                <select value={newTiming} onChange={(e) => setNewTiming(e.target.value as TimeOfDay)} className={inputClass}>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{TIMING_ICONS[t]} {t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Injection Site</label>
              <select value={newSite} onChange={(e) => setNewSite(e.target.value)} className={inputClass}>
                {INJECTION_SITES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addPeptide} className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors">
                Add Peptide
              </button>
              <button onClick={() => { setAdding(false); setNewName(""); setNewDosage(""); setNewUnit("mcg"); setNewTiming("Morning"); }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full py-2.5 border border-dashed border-slate-700/50 rounded-lg text-sm text-slate-500 hover:text-teal-400 hover:border-teal-500/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Add peptide
          </button>
        )}
      </div>

      {/* Weekly Completion — matches MedTracker */}
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
              extra:      { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    bar: "bg-red-500",   label: "Extra Dose" },
              complete:   { color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/20",   bar: "bg-teal-500",  label: "Complete" },
              "on-track": { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   bar: "bg-blue-500",  label: "On Track" },
              behind:     { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  bar: "bg-amber-500", label: "Behind" },
              missed:     { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    bar: "bg-red-500",   label: "Missed" },
              "as-needed":{ color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20",  bar: "bg-slate-500", label: "As Needed" },
            }[a.status];

            return (
              <div key={a.name} className={`${statusConfig.bg} border ${statusConfig.border} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200">{a.name}</p>
                    <span className="text-[10px] text-slate-500">{getFrequencyLabel(a.frequency)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === "as-needed" ? (
                      <span className="text-xs font-mono text-slate-300">{a.takenThisWeek}x taken</span>
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

        {/* Summary */}
        {(() => {
          const scheduled = weeklyAnalysis.filter((a) => a.status !== "as-needed");
          const complete = scheduled.filter((a) => a.status === "complete").length;
          const behind = scheduled.filter((a) => a.status === "behind" || a.status === "missed").length;
          if (scheduled.length === 0) return null;
          return (
            <div className={`mt-4 pt-3 border-t ${adherence >= 90 ? "border-teal-500/20" : adherence >= 60 ? "border-amber-500/20" : "border-red-500/20"}`}>
              <p className="text-xs text-slate-400">
                {adherence >= 90 ? (
                  <>Great job! You&apos;re on track with {complete}/{scheduled.length} peptides completed this week.</>
                ) : adherence >= 60 ? (
                  <>You&apos;re making progress. {complete}/{scheduled.length} completed, but {behind} peptide{behind !== 1 ? "s" : ""} need{behind === 1 ? "s" : ""} attention.</>
                ) : (
                  <>{behind} of {scheduled.length} peptide{scheduled.length !== 1 ? "s" : ""} {behind !== 1 ? "are" : "is"} behind schedule. Try setting a daily reminder to stay consistent.</>
                )}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Weekly Schedule Grid — matches MedTracker */}
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
            const td = isToday(d);
            return (
              <div key={dateKey(d)} className={`text-center py-1.5 rounded-lg ${td ? "bg-teal-500/20" : ""}`}>
                <p className={`text-[10px] font-bold uppercase ${td ? "text-teal-400" : "text-slate-500"}`}>
                  {DAY_NAMES[d.getDay()]}
                </p>
                <p className={`text-xs ${td ? "text-teal-300 font-semibold" : "text-slate-400"}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Peptide rows */}
        <div className="space-y-1">
          {peptides.map((p) => (
            <div key={p.name} className="grid gap-1 items-center" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
              <div className="pr-2">
                <p className="text-xs font-medium text-slate-300 truncate">{p.name}</p>
                <p className="text-[9px] text-slate-600 truncate">
                  {p.dosage > 0 ? `${p.dosage}${p.unit}` : ""} {p.timing}
                </p>
              </div>
              {weekDates.map((d) => {
                const key = dateKey(d);
                const taken = log[key]?.[p.name]?.taken ?? false;
                const isFuture = d > new Date() && !isToday(d);
                const td = isToday(d);
                const due = isDueOnDate(p.frequency, d);

                return (
                  <button
                    key={key}
                    onClick={() => !isFuture && toggleDose(key, p.name, p.site)}
                    disabled={isFuture}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      isFuture
                        ? "bg-slate-800/20 cursor-not-allowed"
                        : taken
                        ? "bg-teal-500/30 border border-teal-500/40 hover:bg-teal-500/40"
                        : !due
                        ? "bg-slate-800/10 border border-slate-800/20 cursor-default"
                        : td
                        ? "bg-slate-700/40 border border-teal-500/20 hover:bg-slate-700/60"
                        : "bg-slate-800/30 border border-slate-700/20 hover:bg-slate-700/40"
                    }`}
                    title={`${p.name} — ${taken ? "Taken" : due ? "Due" : "Not scheduled"}`}
                  >
                    {taken ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : isFuture || !due ? (
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
            <div className="w-3 h-3 rounded bg-slate-800/30 border border-slate-700/20" />
            <span className="text-[10px] text-slate-500">Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-800/10 border border-slate-800/20" />
            <span className="text-[10px] text-slate-500">Not Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-800/20" />
            <span className="text-[10px] text-slate-500">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Last 30 Days Heatmap */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Last 30 Days</h3>
        <div className="flex gap-0.5 flex-wrap">
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const key = dateKey(d);
            const scheduled = peptides.filter((p) => isDueOnDate(p.frequency, d) && parseDosesPerWeekNominal(p.frequency) > 0);
            const totalExpected = scheduled.length;
            const totalTaken = scheduled.filter((p) => log[key]?.[p.name]?.taken).length;
            const ratio = totalExpected > 0 ? totalTaken / totalExpected : 0;

            let colorClass = "bg-slate-800/40";
            if (totalExpected === 0) colorClass = "bg-slate-800/20";
            else if (ratio === 1) colorClass = "bg-teal-500";
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

      <div className="h-12" />
    </div>
  );
}
