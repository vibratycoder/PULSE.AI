"use client";

import { useState, useCallback } from "react";
import { dateKey, isToday, getWeekDates, DAY_NAMES } from "./utils";

type DosageUnit = "mcg" | "mg" | "IU" | "ml" | "g";
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Before Bed";
type SupplementForm = "Capsule" | "Tablet" | "Powder" | "Liquid" | "Gummy";

interface SupplementEntry {
  name: string;
  dosage: number;
  unit: DosageUnit;
  frequency: string;
  timing: TimeOfDay;
  form: SupplementForm;
}

interface SupplementLogEntry {
  taken: boolean;
  time: string;
}

interface SupplementLog {
  [dateKey: string]: { [supplementName: string]: SupplementLogEntry };
}

const DOSAGE_UNITS: { value: DosageUnit; label: string }[] = [
  { value: "mg", label: "mg" },
  { value: "mcg", label: "mcg" },
  { value: "g", label: "g" },
  { value: "IU", label: "IU" },
  { value: "ml", label: "ml" },
];

const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Before Bed"];

const FORM_OPTIONS: SupplementForm[] = ["Capsule", "Tablet", "Powder", "Liquid", "Gummy"];

const STORAGE_KEY = "pulseai_supplementlog";
const SUPPLEMENTS_KEY = "pulseai_supplements";

const COMMON_SUPPLEMENTS = [
  "Vitamin D3", "Fish Oil", "Magnesium", "Zinc", "Creatine",
  "Ashwagandha", "Vitamin C", "B-Complex", "CoQ10", "Probiotics",
  "Turmeric/Curcumin", "Melatonin", "Iron", "Calcium", "Collagen",
  "NAC", "Vitamin K2", "Alpha Lipoic Acid",
];

const FREQUENCY_OPTIONS = [
  "Daily", "Twice daily", "Every other day",
  "3x per week", "2x per week", "Weekly",
  "As needed",
];

function loadLog(): SupplementLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLog(log: SupplementLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function loadSupplements(): SupplementEntry[] {
  try {
    const raw = localStorage.getItem(SUPPLEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((s: SupplementEntry) => ({
      ...s,
      timing: s.timing || "Morning",
      form: s.form || "Capsule",
    }));
  } catch { return []; }
}

function saveSupplements(entries: SupplementEntry[]) {
  localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(entries));
}

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
  return true;
}

function parseDosesPerWeekNominal(freq: string): number {
  const d = freq.toLowerCase();
  if (d.includes("twice daily")) return 14;
  if (d.includes("daily")) return 7;
  if (d.includes("every other day")) return 4;
  if (d.includes("3x per week")) return 3;
  if (d.includes("2x per week")) return 2;
  if (d.includes("weekly")) return 1;
  if (d.includes("as needed")) return 0;
  return 7;
}

function countDueInWeek(freq: string, weekDates: Date[]): number {
  if (freq.toLowerCase().includes("as needed")) return 0;
  const dosesPerDay = parseDosesPerDay(freq);
  let total = 0;
  for (const d of weekDates) {
    if (isDueOnDate(freq, d)) total += Math.max(dosesPerDay, 1);
  }
  return total;
}

function parseDosesPerDay(freq: string): number {
  const d = freq.toLowerCase();
  if (d.includes("twice daily")) return 2;
  return 1;
}

function getFrequencyLabel(freq: string): string {
  const perWeek = parseDosesPerWeekNominal(freq);
  if (perWeek === 0) return "As needed";
  if (perWeek === 1) return "1x/week";
  if (perWeek === 2) return "2x/week";
  if (perWeek === 3) return "3x/week";
  if (perWeek === 4) return "Every other day";
  if (perWeek === 7) return "Daily";
  if (perWeek === 14) return "2x/day";
  return `${perWeek}x/week`;
}

const TIMING_ICONS: Record<TimeOfDay, string> = {
  "Morning": "\u2600",
  "Afternoon": "\u26C5",
  "Evening": "\uD83C\uDF19",
  "Before Bed": "\uD83D\uDCA4",
};

interface WeeklySupplementAnalysis {
  name: string;
  frequency: string;
  expectedPerWeek: number;
  takenThisWeek: number;
  completionPct: number;
  status: "complete" | "on-track" | "behind" | "missed" | "as-needed" | "extra";
}

function analyzeWeekly(log: SupplementLog, supplements: SupplementEntry[], weekDates: Date[]): WeeklySupplementAnalysis[] {
  const now = new Date();
  return supplements.map((s) => {
    const expectedPerWeek = countDueInWeek(s.frequency, weekDates);
    let takenThisWeek = 0;
    for (const d of weekDates) {
      if (log[dateKey(d)]?.[s.name]?.taken) takenThisWeek++;
    }
    if (expectedPerWeek === 0) {
      return { name: s.name, frequency: s.frequency, expectedPerWeek: 0, takenThisWeek, completionPct: 0, status: "as-needed" as const };
    }
    const completionPct = Math.min(100, Math.round((takenThisWeek / expectedPerWeek) * 100));
    const elapsedDue = weekDates.filter((d) => (d <= now || isToday(d)) && isDueOnDate(s.frequency, d)).length;
    let status: WeeklySupplementAnalysis["status"];
    if (takenThisWeek > expectedPerWeek) status = "extra";
    else if (takenThisWeek >= expectedPerWeek) status = "complete";
    else if (takenThisWeek >= elapsedDue) status = "on-track";
    else if (takenThisWeek > 0) status = "behind";
    else status = "missed";
    return { name: s.name, frequency: s.frequency, expectedPerWeek, takenThisWeek, completionPct, status };
  });
}

function getAdherence(log: SupplementLog, supplements: SupplementEntry[], weekDates: Date[]): number {
  const analyses = analyzeWeekly(log, supplements, weekDates);
  const scheduled = analyses.filter((a) => a.status !== "as-needed");
  if (scheduled.length === 0) return 0;
  const totalExpected = scheduled.reduce((sum, a) => sum + a.expectedPerWeek, 0);
  const totalTaken = scheduled.reduce((sum, a) => sum + Math.min(a.takenThisWeek, a.expectedPerWeek), 0);
  return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
}

function getStreak(log: SupplementLog, supplements: SupplementEntry[]): number {
  if (supplements.length === 0) return 0;
  const scheduled = supplements.filter((s) => parseDosesPerWeekNominal(s.frequency) > 0);
  if (scheduled.length === 0) return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dk = dateKey(d);
    const dueToday = scheduled.filter((s) => isDueOnDate(s.frequency, d));
    if (dueToday.length === 0) { d.setDate(d.getDate() - 1); continue; }
    const allTaken = dueToday.every((s) => log[dk]?.[s.name]?.taken);
    if (allTaken) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function SupplementTracker() {
  const [supplements, setSupplements] = useState<SupplementEntry[]>(() => loadSupplements());
  const [log, setLog] = useState<SupplementLog>(() => loadLog());
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newUnit, setNewUnit] = useState<DosageUnit>("mg");
  const [newFrequency, setNewFrequency] = useState("Daily");
  const [newTiming, setNewTiming] = useState<TimeOfDay>("Morning");
  const [newForm, setNewForm] = useState<SupplementForm>("Capsule");
  const [weekOffset, setWeekOffset] = useState(0);

  const today = dateKey(new Date());
  const weekDates = getWeekDates(weekOffset);
  const streak = getStreak(log, supplements);
  const adherence = getAdherence(log, supplements, weekDates);
  const weeklyAnalysis = analyzeWeekly(log, supplements, weekDates);

  const todayDate = new Date();
  const todaysDue = supplements.filter((s) => isDueOnDate(s.frequency, todayDate));
  const todaysTaken = todaysDue.filter((s) => log[today]?.[s.name]?.taken);

  const addSupplement = () => {
    if (!newName.trim()) return;
    const entry: SupplementEntry = {
      name: newName.trim(),
      dosage: parseFloat(newDosage) || 0,
      unit: newUnit,
      frequency: newFrequency,
      timing: newTiming,
      form: newForm,
    };
    const updated = [...supplements, entry];
    setSupplements(updated);
    saveSupplements(updated);
    setNewName(""); setNewDosage(""); setNewUnit("mg"); setNewFrequency("Daily");
    setNewTiming("Morning"); setNewForm("Capsule"); setAdding(false);
  };

  const removeSupplement = (index: number) => {
    const updated = supplements.filter((_, i) => i !== index);
    setSupplements(updated);
    saveSupplements(updated);
  };

  const updateSupplement = (index: number, field: Partial<SupplementEntry>) => {
    const updated = [...supplements];
    updated[index] = { ...updated[index], ...field };
    setSupplements(updated);
    saveSupplements(updated);
  };

  const toggleDose = useCallback((day: string, name: string) => {
    setLog((prev) => {
      const updated = { ...prev };
      if (updated[day]?.[name]?.taken) {
        const { [name]: _, ...rest } = updated[day];
        updated[day] = rest;
      } else {
        if (!updated[day]) updated[day] = {};
        updated[day] = { ...updated[day], [name]: { taken: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } };
      }
      saveLog(updated);
      return updated;
    });
  }, []);

  const inputClass = "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors";
  const labelClass = "text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block";

  const groupedByTiming = TIME_OPTIONS.reduce<Record<TimeOfDay, typeof todaysDue>>((acc, t) => {
    acc[t] = todaysDue.filter((s) => s.timing === t);
    return acc;
  }, { Morning: [], Afternoon: [], Evening: [], "Before Bed": [] });

  // Empty state
  if (supplements.length === 0 && !adding) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Supplement Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track your daily supplements, vitamins, and wellness stack</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Supplements Configured</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            Add your supplements to start tracking daily intake and adherence.
          </p>
          <button onClick={() => setAdding(true)} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors">
            Add First Supplement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Supplement Tracker</h2>
        <p className="text-xs text-slate-500 mt-0.5">Track your daily supplements, vitamins, and wellness stack</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-teal-400">{todaysTaken.length}/{todaysDue.length}</p>
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

      {/* Today's Schedule */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Today&apos;s Schedule</h3>
        {todaysDue.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">No supplements scheduled for today.</p>
        ) : (
          <div className="space-y-4">
            {TIME_OPTIONS.map((timeSlot) => {
              const group = groupedByTiming[timeSlot];
              if (group.length === 0) return null;
              return (
                <div key={timeSlot}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{TIMING_ICONS[timeSlot]}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{timeSlot}</span>
                    <div className="flex-1 h-px bg-slate-700/30" />
                  </div>
                  <div className="space-y-2">
                    {group.map((s) => {
                      const entry = log[today]?.[s.name];
                      const taken = entry?.taken ?? false;
                      return (
                        <div key={s.name} className={`p-3 rounded-lg border transition-all ${taken ? "bg-teal-500/10 border-teal-500/30" : "bg-slate-800/40 border-slate-700/30"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className={`text-sm font-medium transition-colors ${taken ? "text-teal-300" : "text-slate-200"}`}>{s.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {s.dosage > 0 ? `${s.dosage}${s.unit}` : ""} {s.form} &middot; {s.frequency}
                              </p>
                              {entry?.time && <p className="text-[10px] text-slate-600 mt-0.5">Logged at {entry.time}</p>}
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${taken ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/50 text-slate-500"}`}>
                              {taken ? "Complete" : "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleDose(today, s.name)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${taken ? "bg-teal-500/20 border-teal-500/30 text-teal-400" : "bg-slate-800/60 border-slate-600/50 text-slate-300 hover:border-teal-500/40 hover:bg-teal-500/5"}`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${taken ? "bg-teal-500 border-teal-500" : "border-slate-500"}`}>
                                {taken && <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
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
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Daily progress</span>
            <span>{todaysDue.length > 0 ? Math.round((todaysTaken.length / todaysDue.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${todaysDue.length > 0 ? (todaysTaken.length / todaysDue.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Supplement list / management */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Your Supplements</h3>
        <div className="space-y-2 mb-4">
          {supplements.map((s, i) => (
            <div key={`${s.name}-${i}`} className="bg-slate-800/60 border border-slate-700/30 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-200">{s.name}</p>
                <button onClick={() => removeSupplement(i)} className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none">&times;</button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="number" value={s.dosage || ""} onChange={(e) => updateSupplement(i, { dosage: parseFloat(e.target.value) || 0 })} placeholder="0" className="w-20 bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-teal-500/50" />
                <select value={s.unit || "mg"} onChange={(e) => updateSupplement(i, { unit: e.target.value as DosageUnit })} className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer">
                  {DOSAGE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
                <select value={s.form} onChange={(e) => updateSupplement(i, { form: e.target.value as SupplementForm })} className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer">
                  {FORM_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={s.frequency} onChange={(e) => updateSupplement(i, { frequency: e.target.value })} className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer">
                  {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={s.timing} onChange={(e) => updateSupplement(i, { timing: e.target.value as TimeOfDay })} className="bg-slate-800/80 border border-slate-700/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 cursor-pointer">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{TIMING_ICONS[t]} {t}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="bg-slate-800/60 border border-slate-700/30 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-[10px] text-slate-600 mb-2">Common supplements — click to fill</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SUPPLEMENTS.map((name) => {
                  const exists = supplements.some((s) => s.name.toLowerCase() === name.toLowerCase());
                  return (
                    <button key={name} onClick={() => { if (!exists) setNewName(name); }} className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${exists ? "bg-teal-500/20 text-teal-400 border-teal-500/30" : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600"}`}>
                      {exists ? `${name} \u2713` : name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className={labelClass}>Supplement Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Vitamin D3" className={inputClass} autoFocus />
            </div>
            <div>
              <label className={labelClass}>Dosage</label>
              <div className="flex gap-2">
                <input type="number" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} placeholder="e.g. 5000" className={`${inputClass} flex-1`} />
                <select value={newUnit} onChange={(e) => setNewUnit(e.target.value as DosageUnit)} className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors">
                  {DOSAGE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Form</label>
                <select value={newForm} onChange={(e) => setNewForm(e.target.value as SupplementForm)} className={inputClass}>
                  {FORM_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
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
            <div className="flex gap-2 pt-1">
              <button onClick={addSupplement} className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors">Add Supplement</button>
              <button onClick={() => { setAdding(false); setNewName(""); setNewDosage(""); }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="w-full py-2.5 border border-dashed border-slate-700/50 rounded-lg text-sm text-slate-500 hover:text-teal-400 hover:border-teal-500/30 transition-colors flex items-center justify-center gap-1.5">
            <span className="text-base leading-none">+</span> Add supplement
          </button>
        )}
      </div>

      {/* Weekly Completion */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Weekly Completion</h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${adherence >= 90 ? "bg-teal-500/20 text-teal-400" : adherence >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
            {adherence}% overall
          </span>
        </div>
        <div className="space-y-3">
          {weeklyAnalysis.map((a) => {
            const statusConfig = {
              extra:      { color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20",   bar: "bg-red-500",   label: "Extra Dose" },
              complete:   { color: "text-teal-400",  bg: "bg-teal-500/10",  border: "border-teal-500/20",  bar: "bg-teal-500",  label: "Complete" },
              "on-track": { color: "text-blue-400",  bg: "bg-blue-500/10",  border: "border-blue-500/20",  bar: "bg-blue-500",  label: "On Track" },
              behind:     { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "bg-amber-500", label: "Behind" },
              missed:     { color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20",   bar: "bg-red-500",   label: "Missed" },
              "as-needed":{ color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", bar: "bg-slate-500", label: "As Needed" },
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
                      <span className="text-xs font-mono text-red-400">{a.takenThisWeek}/{a.expectedPerWeek} (+{a.takenThisWeek - a.expectedPerWeek} extra)</span>
                    ) : (
                      <span className="text-xs font-mono text-slate-300">{a.takenThisWeek}/{a.expectedPerWeek}</span>
                    )}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                </div>
                {a.status !== "as-needed" && (
                  <div className="h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                    <div className={`h-full ${statusConfig.bar} rounded-full transition-all duration-300`} style={{ width: `${a.completionPct}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Weekly Schedule</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="text-slate-400 hover:text-slate-200 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setWeekOffset(0)} className={`text-xs px-3 py-1 rounded-full transition-colors ${weekOffset === 0 ? "bg-teal-500 text-white" : "bg-slate-800/60 text-slate-400 hover:text-slate-200"}`}>This Week</button>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="text-slate-400 hover:text-slate-200 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
          <div />
          {weekDates.map((d) => {
            const td = isToday(d);
            return (
              <div key={dateKey(d)} className={`text-center py-1.5 rounded-lg ${td ? "bg-teal-500/20" : ""}`}>
                <p className={`text-[10px] font-bold uppercase ${td ? "text-teal-400" : "text-slate-500"}`}>{DAY_NAMES[d.getDay()]}</p>
                <p className={`text-xs ${td ? "text-teal-300 font-semibold" : "text-slate-400"}`}>{d.getDate()}</p>
              </div>
            );
          })}
        </div>
        <div className="space-y-1">
          {supplements.map((s) => (
            <div key={s.name} className="grid gap-1 items-center" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
              <div className="pr-2">
                <p className="text-xs font-medium text-slate-300 truncate">{s.name}</p>
                <p className="text-[9px] text-slate-600 truncate">{s.dosage > 0 ? `${s.dosage}${s.unit}` : ""} {s.form}</p>
              </div>
              {weekDates.map((d) => {
                const key = dateKey(d);
                const taken = log[key]?.[s.name]?.taken ?? false;
                const isFuture = d > new Date() && !isToday(d);
                const td = isToday(d);
                const due = isDueOnDate(s.frequency, d);
                return (
                  <button key={key} onClick={() => !isFuture && toggleDose(key, s.name)} disabled={isFuture} className={`aspect-square rounded-lg flex items-center justify-center transition-all ${isFuture ? "bg-slate-800/20 cursor-not-allowed" : taken ? "bg-teal-500/30 border border-teal-500/40 hover:bg-teal-500/40" : !due ? "bg-slate-800/10 border border-slate-800/20 cursor-default" : td ? "bg-slate-700/40 border border-teal-500/20 hover:bg-slate-700/60" : "bg-slate-800/30 border border-slate-700/20 hover:bg-slate-700/40"}`} title={`${s.name} — ${taken ? "Taken" : due ? "Due" : "Not scheduled"}`}>
                    {taken ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
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
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700/20">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/40" /><span className="text-[10px] text-slate-500">Taken</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-800/30 border border-slate-700/20" /><span className="text-[10px] text-slate-500">Missed</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-800/10 border border-slate-800/20" /><span className="text-[10px] text-slate-500">Not Scheduled</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-800/20" /><span className="text-[10px] text-slate-500">Upcoming</span></div>
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
            const scheduled = supplements.filter((s) => isDueOnDate(s.frequency, d) && parseDosesPerWeekNominal(s.frequency) > 0);
            const totalExpected = scheduled.length;
            const totalTaken = scheduled.filter((s) => log[key]?.[s.name]?.taken).length;
            const ratio = totalExpected > 0 ? totalTaken / totalExpected : 0;
            let colorClass = "bg-slate-800/40";
            if (totalExpected === 0) colorClass = "bg-slate-800/20";
            else if (ratio === 1) colorClass = "bg-teal-500";
            else if (ratio >= 0.5) colorClass = "bg-teal-500/50";
            else if (ratio > 0) colorClass = "bg-teal-500/20";
            return <div key={key} className={`w-4 h-4 rounded-sm ${colorClass} transition-colors`} title={`${key}: ${totalTaken}/${totalExpected} doses`} />;
          })}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-slate-800/40" /><span className="text-[9px] text-slate-600">None</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-teal-500/20" /><span className="text-[9px] text-slate-600">Some</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-teal-500/50" /><span className="text-[9px] text-slate-600">Most</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-teal-500" /><span className="text-[9px] text-slate-600">All</span></div>
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
}
