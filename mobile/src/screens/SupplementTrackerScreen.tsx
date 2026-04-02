import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../lib/theme";
import { findSupplementInfo } from "../data/supplementData";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

interface SupplementLogEntry { taken: boolean; time: string; }
interface SupplementLog { [dateKey: string]: { [name: string]: SupplementLogEntry }; }

const DOSAGE_UNITS: DosageUnit[] = ["mg", "mcg", "g", "IU", "ml"];
const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Before Bed"];
const FORM_OPTIONS: SupplementForm[] = ["Capsule", "Tablet", "Powder", "Liquid", "Gummy"];
const FREQUENCY_OPTIONS = ["Daily", "Twice daily", "Every other day", "3x per week", "2x per week", "Weekly", "As needed"];
const COMMON_SUPPLEMENTS = [
  "Vitamin D3", "Fish Oil", "Magnesium", "Zinc", "Creatine",
  "Ashwagandha", "Vitamin C", "B-Complex", "CoQ10", "Probiotics",
  "Turmeric/Curcumin", "Melatonin", "Iron", "Calcium", "Collagen",
  "NAC", "Vitamin K2", "Alpha Lipoic Acid",
];

const TIMING_ICONS: Record<TimeOfDay, string> = { Morning: "\u2600", Afternoon: "\u26C5", Evening: "\uD83C\uDF19", "Before Bed": "\uD83D\uDCA4" };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STORAGE_KEY = "pulseai_supplementlog";
const SUPPLEMENTS_KEY = "pulseai_supplements";

function dateKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function isTodayDate(d: Date) { const t = new Date(); return d.getDate()===t.getDate()&&d.getMonth()===t.getMonth()&&d.getFullYear()===t.getFullYear(); }

function isDueOnDate(freq: string, date: Date): boolean {
  const d = freq.toLowerCase();
  if (d.includes("as needed")) return false;
  if (d.includes("daily") || d.includes("twice daily")) return true;
  if (d.includes("every other day")) { const doy = Math.floor((date.getTime()-new Date(date.getFullYear(),0,0).getTime())/86400000); return doy%2===0; }
  const dow = date.getDay();
  if (d.includes("3x per week")) return [1,3,5].includes(dow);
  if (d.includes("2x per week")) return [1,4].includes(dow);
  if (d.includes("weekly")) return dow===1;
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
  let total = 0;
  for (const d of weekDates) { if (isDueOnDate(freq, d)) total++; }
  return total;
}

function getFrequencyLabel(freq: string): string {
  const perWeek = parseDosesPerWeekNominal(freq);
  if (perWeek === 0) return "As needed";
  if (perWeek === 1) return "1x/week";
  if (perWeek === 2) return "2x/week";
  if (perWeek === 3) return "3x/week";
  if (perWeek === 4) return "EOD";
  if (perWeek === 7) return "Daily";
  if (perWeek === 14) return "2x/day";
  return `${perWeek}x/week`;
}

function getWeekDates(offset: number): Date[] {
  const today = new Date(); const start = new Date(today);
  start.setDate(today.getDate()-today.getDay()+offset*7);
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
}

function getStreak(log: SupplementLog, supplements: SupplementEntry[]): number {
  if (supplements.length === 0) return 0;
  const scheduled = supplements.filter(s => parseDosesPerWeekNominal(s.frequency) > 0);
  if (scheduled.length === 0) return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dk = dateKey(d);
    const dueToday = scheduled.filter(s => isDueOnDate(s.frequency, d));
    if (dueToday.length === 0) { d.setDate(d.getDate() - 1); continue; }
    const allTaken = dueToday.every(s => log[dk]?.[s.name]?.taken);
    if (allTaken) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getAdherence(log: SupplementLog, supplements: SupplementEntry[], weekDates: Date[]): number {
  const scheduled = supplements.filter(s => parseDosesPerWeekNominal(s.frequency) > 0);
  if (scheduled.length === 0) return 0;
  let totalExpected = 0, totalTaken = 0;
  for (const s of scheduled) {
    const expected = countDueInWeek(s.frequency, weekDates);
    let taken = 0;
    for (const d of weekDates) { if (log[dateKey(d)]?.[s.name]?.taken) taken++; }
    totalExpected += expected;
    totalTaken += Math.min(taken, expected);
  }
  return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
}

export default function SupplementTrackerScreen() {
  const [supplements, setSupplements] = useState<SupplementEntry[]>([]);
  const [log, setLog] = useState<SupplementLog>({});
  const [adding, setAdding] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newUnit, setNewUnit] = useState<DosageUnit>("mg");
  const [newFreq, setNewFreq] = useState("Daily");
  const [newTiming, setNewTiming] = useState<TimeOfDay>("Morning");
  const [newForm, setNewForm] = useState<SupplementForm>("Capsule");

  const today = dateKey(new Date());
  const weekDates = getWeekDates(weekOffset);
  const todayDate = new Date();
  const todaysDue = supplements.filter(s => isDueOnDate(s.frequency, todayDate));
  const todaysTaken = todaysDue.filter(s => log[today]?.[s.name]?.taken);
  const streak = getStreak(log, supplements);
  const adherence = getAdherence(log, supplements, weekDates);

  useEffect(() => {
    AsyncStorage.getItem(SUPPLEMENTS_KEY).then(r => {
      if (r) setSupplements(JSON.parse(r).map((s: any) => ({ ...s, timing: s.timing || "Morning", form: s.form || "Capsule" })));
    });
    AsyncStorage.getItem(STORAGE_KEY).then(r => { if (r) setLog(JSON.parse(r)); });
  }, []);

  const saveSupplements = (entries: SupplementEntry[]) => { setSupplements(entries); AsyncStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(entries)); };
  const saveLogState = (l: SupplementLog) => { setLog(l); AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(l)); };

  const toggleDose = useCallback((day: string, name: string) => {
    setLog(prev => {
      const updated = { ...prev };
      if (updated[day]?.[name]?.taken) {
        const { [name]: _, ...rest } = updated[day];
        updated[day] = rest;
      } else {
        if (!updated[day]) updated[day] = {};
        updated[day] = { ...updated[day], [name]: { taken: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } };
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addSupplement = () => {
    if (!newName.trim()) return;
    saveSupplements([...supplements, { name: newName.trim(), dosage: parseFloat(newDosage) || 0, unit: newUnit, frequency: newFreq, timing: newTiming, form: newForm }]);
    setNewName(""); setNewDosage(""); setNewUnit("mg"); setNewFreq("Daily"); setNewTiming("Morning"); setNewForm("Capsule"); setAdding(false);
  };

  const removeSupplement = (i: number) => {
    Alert.alert("Remove", `Remove ${supplements[i].name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => saveSupplements(supplements.filter((_, j) => j !== i)) },
    ]);
  };

  const updateSupplement = (i: number, field: Partial<SupplementEntry>) => { const u = [...supplements]; u[i] = { ...u[i], ...field }; saveSupplements(u); };

  const toggleExpand = (name: string) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedItem(expandedItem === name ? null : name); };

  // Group today's due by timing
  const groupedByTiming = TIME_OPTIONS.reduce<Record<TimeOfDay, SupplementEntry[]>>((acc, t) => {
    acc[t] = todaysDue.filter(s => s.timing === t);
    return acc;
  }, { Morning: [], Afternoon: [], Evening: [], "Before Bed": [] });

  // Empty state
  if (supplements.length === 0 && !adding) {
    return (
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.header}>
          <Text style={s.title}>Supplement Tracker</Text>
          <Text style={s.subtitle}>Track your daily supplements, vitamins, and wellness stack</Text>
        </View>
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🧪</Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.white, marginBottom: 8 }}>No Supplements Configured</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20, textAlign: "center", paddingHorizontal: 40 }}>Add your supplements to start tracking daily intake and adherence.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => setAdding(true)}><Text style={s.primaryBtnText}>Add First Supplement</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.title}>Supplement Tracker</Text>
        <Text style={s.subtitle}>Track your daily supplements, vitamins, and wellness stack</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: "rgba(20,184,166,0.1)", borderColor: "rgba(20,184,166,0.2)" }]}>
          <Text style={[s.statVal, { color: colors.teal }]}>{todaysTaken.length}/{todaysDue.length}</Text>
          <Text style={[s.statLabel, { color: "rgba(20,184,166,0.7)" }]}>Today</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: "rgba(168,85,247,0.1)", borderColor: "rgba(168,85,247,0.2)" }]}>
          <Text style={[s.statVal, { color: colors.purple }]}>{streak}</Text>
          <Text style={[s.statLabel, { color: "rgba(168,85,247,0.7)" }]}>Day Streak</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" }]}>
          <Text style={[s.statVal, { color: colors.blue }]}>{adherence}%</Text>
          <Text style={[s.statLabel, { color: "rgba(59,130,246,0.7)" }]}>This Week</Text>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Today's Schedule</Text>
        {todaysDue.length === 0 ? (
          <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: 8 }}>No supplements scheduled for today.</Text>
        ) : (
          <View>
            {TIME_OPTIONS.map(timeSlot => {
              const group = groupedByTiming[timeSlot];
              if (group.length === 0) return null;
              return (
                <View key={timeSlot} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <Text style={{ fontSize: 13 }}>{TIMING_ICONS[timeSlot]}</Text>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginLeft: 6 }}>{timeSlot}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: "rgba(51,65,85,0.3)", marginLeft: 8 }} />
                  </View>
                  {group.map(st => {
                    const entry = log[today]?.[st.name];
                    const taken = entry?.taken ?? false;
                    return (
                      <View key={st.name} style={[s.scheduleItem, taken && { backgroundColor: "rgba(20,184,166,0.1)", borderColor: "rgba(20,184,166,0.3)" }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <View>
                            <Text style={[s.schedName, taken && { color: colors.tealLight }]}>{st.name}</Text>
                            <Text style={s.schedDetail}>{st.dosage > 0 ? `${st.dosage}${st.unit}` : ""} {st.form} · {st.frequency}</Text>
                            {entry?.time && <Text style={{ fontSize: 10, color: colors.textDim, marginTop: 2 }}>Logged at {entry.time}</Text>}
                          </View>
                          <View style={[s.statusBadge, taken ? { backgroundColor: "rgba(20,184,166,0.2)" } : { backgroundColor: "rgba(51,65,85,0.5)" }]}>
                            <Text style={[s.statusText, taken ? { color: colors.teal } : { color: colors.textMuted }]}>{taken ? "Complete" : "Pending"}</Text>
                          </View>
                        </View>
                        <TouchableOpacity style={[s.doseBtn, taken && s.doseBtnDone]} onPress={() => toggleDose(today, st.name)}>
                          <View style={[s.doseCheck, taken && s.doseCheckDone]}>{taken && <Text style={{ color: colors.white, fontSize: 10, fontWeight: "700" }}>✓</Text>}</View>
                          <Text style={[s.doseBtnText, taken && { color: colors.teal }]}>Dose</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
        {/* Progress bar */}
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>Daily progress</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>{todaysDue.length > 0 ? Math.round((todaysTaken.length / todaysDue.length) * 100) : 0}%</Text>
          </View>
          <View style={{ height: 6, backgroundColor: "rgba(30,41,59,0.8)", borderRadius: 3 }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.teal, width: `${todaysDue.length > 0 ? (todaysTaken.length / todaysDue.length) * 100 : 0}%` as any }} />
          </View>
        </View>
      </View>

      {/* Your Supplements */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Your Supplements</Text>
        {supplements.map((st, i) => {
          const info = findSupplementInfo(st.name);
          const isExpanded = expandedItem === st.name;
          return (
            <View key={`${st.name}-${i}`} style={s.itemCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => info && toggleExpand(st.name)} activeOpacity={info ? 0.6 : 1}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={s.itemName}>{st.name}</Text>
                    {info && <View style={s.infoBadge}><Text style={s.infoBadgeText}>i</Text></View>}
                  </View>
                  <Text style={s.itemDetail}>{st.dosage > 0 ? `${st.dosage}${st.unit}` : ""} {st.form} · {st.frequency}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeSupplement(i)} style={{ padding: 4 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              </View>

              {isExpanded && info && (
                <View style={s.infoDropdown}>
                  <View><Text style={s.infoLabel}>What it is</Text><Text style={s.infoText}>{info.synopsis}</Text></View>
                  <View><Text style={s.infoLabel}>What it does</Text><Text style={s.infoText}>{info.whatItDoes}</Text></View>
                  <View><Text style={s.infoLabel}>How it works</Text><Text style={s.infoText}>{info.howItWorks}</Text></View>
                </View>
              )}

              {/* Inline editors */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {TIME_OPTIONS.map(t => (
                  <TouchableOpacity key={t} style={[s.miniChip, st.timing === t && s.miniChipActive]} onPress={() => updateSupplement(i, { timing: t })}>
                    <Text style={[s.miniChipText, st.timing === t && { color: colors.teal }]}>{TIMING_ICONS[t]} {t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {FORM_OPTIONS.map(f => (
                  <TouchableOpacity key={f} style={[s.miniChip, st.form === f && s.miniChipActive]} onPress={() => updateSupplement(i, { form: f })}>
                    <Text style={[s.miniChipText, st.form === f && { color: colors.teal }]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Add form */}
        {adding ? (
          <View style={s.addForm}>
            <Text style={{ fontSize: 10, color: colors.textDim, marginBottom: 6 }}>Common supplements — tap to fill</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {COMMON_SUPPLEMENTS.map(name => {
                const exists = supplements.some(su => su.name.toLowerCase() === name.toLowerCase());
                return <TouchableOpacity key={name} style={[s.wordChip, exists && s.wordChipActive]} onPress={() => { if (!exists) setNewName(name); }}><Text style={[s.wordChipText, exists && { color: colors.teal }]}>{exists ? `${name} ✓` : name}</Text></TouchableOpacity>;
              })}
            </View>
            <TextInput style={s.input} placeholder="Supplement name" placeholderTextColor={colors.textMuted} value={newName} onChangeText={setNewName} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Dosage" placeholderTextColor={colors.textMuted} value={newDosage} onChangeText={setNewDosage} keyboardType="numeric" />
              <View style={{ flexDirection: "row", gap: 4 }}>
                {DOSAGE_UNITS.map(u => <TouchableOpacity key={u} style={[s.miniChip, newUnit === u && s.miniChipActive]} onPress={() => setNewUnit(u)}><Text style={[s.miniChipText, newUnit === u && { color: colors.teal }]}>{u}</Text></TouchableOpacity>)}
              </View>
            </View>
            <Text style={s.fieldLabel}>Form</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              {FORM_OPTIONS.map(f => <TouchableOpacity key={f} style={[s.miniChip, newForm === f && s.miniChipActive]} onPress={() => setNewForm(f)}><Text style={[s.miniChipText, newForm === f && { color: colors.teal }]}>{f}</Text></TouchableOpacity>)}
            </View>
            <Text style={s.fieldLabel}>Frequency</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              {FREQUENCY_OPTIONS.map(f => <TouchableOpacity key={f} style={[s.miniChip, newFreq === f && s.miniChipActive]} onPress={() => setNewFreq(f)}><Text style={[s.miniChipText, newFreq === f && { color: colors.teal }]}>{f}</Text></TouchableOpacity>)}
            </View>
            <Text style={s.fieldLabel}>Timing</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              {TIME_OPTIONS.map(t => <TouchableOpacity key={t} style={[s.miniChip, newTiming === t && s.miniChipActive]} onPress={() => setNewTiming(t)}><Text style={[s.miniChipText, newTiming === t && { color: colors.teal }]}>{TIMING_ICONS[t]} {t}</Text></TouchableOpacity>)}
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <TouchableOpacity style={s.primaryBtn} onPress={addSupplement}><Text style={s.primaryBtnText}>Add</Text></TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setAdding(false); setNewName(""); }}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.addBtn} onPress={() => setAdding(true)}><Text style={s.addBtnText}>+ Add supplement</Text></TouchableOpacity>
        )}
      </View>

      {/* Weekly Schedule Grid */}
      <View style={s.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Text style={s.cardTitle}>Weekly Schedule</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)}><Text style={{ color: colors.teal, fontSize: 18 }}>‹</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setWeekOffset(0)}><Text style={{ fontSize: 11, color: weekOffset === 0 ? colors.teal : colors.textMuted }}>This Week</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)}><Text style={{ color: colors.teal, fontSize: 18 }}>›</Text></TouchableOpacity>
          </View>
        </View>
        {/* Day headers */}
        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          <View style={{ width: 100 }} />
          {weekDates.map(d => { const td = isTodayDate(d); return <View key={dateKey(d)} style={{ flex: 1, alignItems: "center" }}><Text style={{ fontSize: 9, fontWeight: "700", color: td ? colors.teal : colors.textMuted }}>{DAY_NAMES[d.getDay()]}</Text><Text style={{ fontSize: 10, color: td ? colors.tealLight : colors.textSecondary }}>{d.getDate()}</Text></View>; })}
        </View>
        {supplements.map(st => (
          <View key={st.name} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <View style={{ width: 100, paddingRight: 6 }}>
              <Text style={{ fontSize: 10, color: colors.text }} numberOfLines={1}>{st.name}</Text>
              <Text style={{ fontSize: 8, color: colors.textDim }}>{st.dosage > 0 ? `${st.dosage}${st.unit}` : ""} {st.form}</Text>
            </View>
            {weekDates.map(d => {
              const k = dateKey(d); const taken = log[k]?.[st.name]?.taken ?? false; const due = isDueOnDate(st.frequency, d); const isFuture = d > new Date() && !isTodayDate(d);
              return <TouchableOpacity key={k} style={{ flex: 1, aspectRatio: 1, borderRadius: 6, margin: 1, alignItems: "center", justifyContent: "center", backgroundColor: isFuture ? "rgba(30,41,59,0.2)" : taken ? "rgba(20,184,166,0.3)" : !due ? "rgba(30,41,59,0.1)" : "rgba(30,41,59,0.3)", borderWidth: 1, borderColor: taken ? "rgba(20,184,166,0.4)" : !due ? "rgba(30,41,59,0.2)" : "rgba(51,65,85,0.2)" }} onPress={() => !isFuture && toggleDose(k, st.name)} disabled={isFuture}>
                {taken ? <Text style={{ color: colors.teal, fontSize: 10, fontWeight: "700" }}>✓</Text> : <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: due ? "rgba(100,116,139,0.6)" : "rgba(100,116,139,0.3)" }} />}
              </TouchableOpacity>;
            })}
          </View>
        ))}
        {/* Legend */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(51,65,85,0.2)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "rgba(20,184,166,0.3)", borderWidth: 1, borderColor: "rgba(20,184,166,0.4)" }} /><Text style={{ fontSize: 9, color: colors.textMuted }}>Taken</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "rgba(30,41,59,0.3)", borderWidth: 1, borderColor: "rgba(51,65,85,0.2)" }} /><Text style={{ fontSize: 9, color: colors.textMuted }}>Missed</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "rgba(30,41,59,0.1)", borderWidth: 1, borderColor: "rgba(30,41,59,0.2)" }} /><Text style={{ fontSize: 9, color: colors.textMuted }}>N/A</Text></View>
        </View>
      </View>

      {/* Last 30 Days Heatmap */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Last 30 Days</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            const key = dateKey(d);
            const scheduled = supplements.filter(su => isDueOnDate(su.frequency, d) && parseDosesPerWeekNominal(su.frequency) > 0);
            const totalExpected = scheduled.length;
            const totalTaken = scheduled.filter(su => log[key]?.[su.name]?.taken).length;
            const ratio = totalExpected > 0 ? totalTaken / totalExpected : 0;
            let bg = "rgba(30,41,59,0.4)";
            if (totalExpected === 0) bg = "rgba(30,41,59,0.2)";
            else if (ratio === 1) bg = colors.teal;
            else if (ratio >= 0.5) bg = "rgba(20,184,166,0.5)";
            else if (ratio > 0) bg = "rgba(20,184,166,0.2)";
            return <View key={key} style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: bg }} />;
          })}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "rgba(30,41,59,0.4)" }} /><Text style={{ fontSize: 8, color: colors.textDim }}>None</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "rgba(20,184,166,0.2)" }} /><Text style={{ fontSize: 8, color: colors.textDim }}>Some</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "rgba(20,184,166,0.5)" }} /><Text style={{ fontSize: 8, color: colors.textDim }}>Most</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.teal }} /><Text style={{ fontSize: 8, color: colors.textDim }}>All</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 8 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  statVal: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 10, marginTop: 2 },
  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: "rgba(30,41,59,0.3)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 },
  cardTitle: { fontSize: 13, fontWeight: "600", color: colors.white, marginBottom: 8 },
  scheduleItem: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(30,41,59,0.4)", marginBottom: 6 },
  schedName: { fontSize: 14, fontWeight: "600", color: colors.text },
  schedDetail: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  doseBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "rgba(51,65,85,0.5)", backgroundColor: "rgba(30,41,59,0.6)", alignSelf: "flex-start" },
  doseBtnDone: { backgroundColor: "rgba(20,184,166,0.2)", borderColor: "rgba(20,184,166,0.3)" },
  doseCheck: { width: 16, height: 16, borderRadius: 4, borderWidth: 2, borderColor: colors.textMuted, alignItems: "center", justifyContent: "center" },
  doseCheckDone: { backgroundColor: colors.teal, borderColor: colors.teal },
  doseBtnText: { fontSize: 11, color: colors.textSecondary },
  itemCard: { backgroundColor: "rgba(30,41,59,0.6)", borderWidth: 1, borderColor: "rgba(51,65,85,0.3)", borderRadius: 10, padding: 10, marginBottom: 6 },
  itemName: { fontSize: 14, fontWeight: "500", color: colors.text },
  itemDetail: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  infoBadge: { marginLeft: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(20,184,166,0.2)", alignItems: "center", justifyContent: "center" },
  infoBadgeText: { fontSize: 10, fontWeight: "700", color: colors.teal },
  infoDropdown: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(51,65,85,0.3)", gap: 6 },
  infoLabel: { fontSize: 9, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  infoText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  miniChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4 },
  miniChipActive: { backgroundColor: "rgba(20,184,166,0.15)", borderColor: colors.teal },
  miniChipText: { fontSize: 10, color: colors.textMuted },
  wordChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: colors.bgInput },
  wordChipActive: { backgroundColor: "rgba(20,184,166,0.15)", borderColor: "rgba(20,184,166,0.3)" },
  wordChipText: { fontSize: 10, color: colors.textSecondary },
  addForm: { backgroundColor: "rgba(30,41,59,0.6)", borderWidth: 1, borderColor: "rgba(51,65,85,0.3)", borderRadius: 10, padding: 12, gap: 8, marginTop: 6 },
  input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.text },
  fieldLabel: { fontSize: 9, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  addBtn: { marginTop: 6, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 10, borderStyle: "dashed" },
  addBtnText: { color: colors.teal, fontSize: 13, fontWeight: "500" },
  primaryBtn: { flex: 1, backgroundColor: colors.teal, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  primaryBtnText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  cancelBtnText: { color: colors.textSecondary, fontSize: 14 },
});
