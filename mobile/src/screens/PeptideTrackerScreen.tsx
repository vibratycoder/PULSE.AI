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
import { findPeptideInfo } from "../data/peptideData";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

interface PeptideLogEntry { taken: boolean; site: string; time: string; }
interface PeptideLog { [dateKey: string]: { [name: string]: PeptideLogEntry }; }

const DOSAGE_UNITS: DosageUnit[] = ["mcg", "mg", "IU", "ml"];
const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Before Bed"];
const FREQUENCY_OPTIONS = ["Daily", "Twice daily", "Every other day", "3x per week", "2x per week", "Weekly", "5 days on / 2 off", "As needed"];
const INJECTION_SITES = ["Abdomen (left)", "Abdomen (right)", "Thigh (left)", "Thigh (right)", "Deltoid (left)", "Deltoid (right)", "Glute (left)", "Glute (right)"];
const COMMON_PEPTIDES = ["BPC-157", "TB-500", "CJC-1295", "Ipamorelin", "GHK-Cu", "Selank", "Semax", "PT-141", "DSIP", "Epithalon", "Thymosin Alpha-1", "KPV", "LL-37", "MOTS-c", "SS-31"];

const TIMING_ICONS: Record<TimeOfDay, string> = { Morning: "\u2600", Afternoon: "\u26C5", Evening: "\uD83C\uDF19", "Before Bed": "\uD83D\uDCA4" };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STORAGE_KEY = "pulseai_peptidelog";
const PEPTIDES_KEY = "pulseai_peptides";

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
  if (d.includes("5 days on")) return dow>=1&&dow<=5;
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
  if (d.includes("5 days on")) return 5;
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
  const pw = parseDosesPerWeekNominal(freq);
  if (pw === 0) return "As needed";
  if (pw === 1) return "1x/week";
  if (pw === 2) return "2x/week";
  if (pw === 3) return "3x/week";
  if (pw === 4) return "EOD";
  if (pw === 5) return "5on/2off";
  if (pw === 7) return "Daily";
  if (pw === 14) return "2x/day";
  return `${pw}x/week`;
}

function getWeekDates(offset: number): Date[] {
  const today = new Date(); const start = new Date(today);
  start.setDate(today.getDate()-today.getDay()+offset*7);
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
}

function getStreak(log: PeptideLog, peptides: PeptideEntry[]): number {
  const scheduled = peptides.filter(p => parseDosesPerWeekNominal(p.frequency) > 0);
  if (scheduled.length === 0) return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dk = dateKey(d);
    const dueToday = scheduled.filter(p => isDueOnDate(p.frequency, d));
    if (dueToday.length === 0) { d.setDate(d.getDate()-1); continue; }
    const allTaken = dueToday.every(p => log[dk]?.[p.name]?.taken);
    if (allTaken) streak++;
    else break;
    d.setDate(d.getDate()-1);
  }
  return streak;
}

function getAdherence(log: PeptideLog, peptides: PeptideEntry[], weekDates: Date[]): number {
  const scheduled = peptides.filter(p => parseDosesPerWeekNominal(p.frequency) > 0);
  if (scheduled.length === 0) return 0;
  let totalExpected = 0, totalTaken = 0;
  for (const p of scheduled) {
    const expected = countDueInWeek(p.frequency, weekDates);
    let taken = 0;
    for (const d of weekDates) { if (log[dateKey(d)]?.[p.name]?.taken) taken++; }
    totalExpected += expected;
    totalTaken += Math.min(taken, expected);
  }
  return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
}

type WeeklyStatus = "complete" | "on-track" | "behind" | "missed" | "as-needed" | "extra";
interface WeeklyAnalysis { name: string; frequency: string; expected: number; taken: number; pct: number; status: WeeklyStatus; }

function analyzeWeekly(log: PeptideLog, peptides: PeptideEntry[], weekDates: Date[]): WeeklyAnalysis[] {
  const now = new Date();
  return peptides.map(p => {
    const expected = countDueInWeek(p.frequency, weekDates);
    let taken = 0;
    for (const d of weekDates) { if (log[dateKey(d)]?.[p.name]?.taken) taken++; }
    if (expected === 0) return { name: p.name, frequency: p.frequency, expected: 0, taken, pct: 0, status: "as-needed" as const };
    const pct = Math.min(100, Math.round((taken / expected) * 100));
    const elapsedDue = weekDates.filter(d => (d <= now || isTodayDate(d)) && isDueOnDate(p.frequency, d)).length;
    let status: WeeklyStatus;
    if (taken > expected) status = "extra";
    else if (taken >= expected) status = "complete";
    else if (taken >= elapsedDue) status = "on-track";
    else if (taken > 0) status = "behind";
    else status = "missed";
    return { name: p.name, frequency: p.frequency, expected, taken, pct, status };
  });
}

export default function PeptideTrackerScreen() {
  const [peptides, setPeptides] = useState<PeptideEntry[]>([]);
  const [log, setLog] = useState<PeptideLog>({});
  const [adding, setAdding] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string|null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newUnit, setNewUnit] = useState<DosageUnit>("mcg");
  const [newFreq, setNewFreq] = useState("Daily");
  const [newSite, setNewSite] = useState(INJECTION_SITES[0]);
  const [newTiming, setNewTiming] = useState<TimeOfDay>("Morning");

  const today = dateKey(new Date());
  const weekDates = getWeekDates(weekOffset);
  const todayDate = new Date();
  const todaysDue = peptides.filter(p => isDueOnDate(p.frequency, todayDate));
  const todaysTaken = todaysDue.filter(p => log[today]?.[p.name]?.taken);
  const streak = getStreak(log, peptides);
  const adherence = getAdherence(log, peptides, weekDates);
  const weeklyAnalysis = analyzeWeekly(log, peptides, weekDates);

  useEffect(() => {
    AsyncStorage.getItem(PEPTIDES_KEY).then(r => { if(r) setPeptides(JSON.parse(r).map((p:any)=>({...p,timing:p.timing||"Morning",site:p.site||INJECTION_SITES[0]}))); });
    AsyncStorage.getItem(STORAGE_KEY).then(r => { if(r) setLog(JSON.parse(r)); });
  }, []);

  const savePeptides = (entries: PeptideEntry[]) => { setPeptides(entries); AsyncStorage.setItem(PEPTIDES_KEY, JSON.stringify(entries)); };
  const saveLogState = (l: PeptideLog) => { setLog(l); AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(l)); };

  const toggleDose = useCallback((day: string, name: string, site: string) => {
    setLog(prev => {
      const updated = {...prev};
      if(updated[day]?.[name]?.taken) { const {[name]:_,...rest}=updated[day]; updated[day]=rest; }
      else { if(!updated[day]) updated[day]={}; updated[day]={...updated[day],[name]:{taken:true,site,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}}; }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addPeptide = () => {
    if(!newName.trim()) return;
    savePeptides([...peptides,{name:newName.trim(),dosage:parseFloat(newDosage)||0,unit:newUnit,frequency:newFreq,site:newSite,timing:newTiming}]);
    setNewName(""); setNewDosage(""); setNewUnit("mcg"); setNewFreq("Daily"); setNewSite(INJECTION_SITES[0]); setNewTiming("Morning"); setAdding(false);
  };

  const removePeptide = (i: number) => {
    Alert.alert("Remove", `Remove ${peptides[i].name}?`, [
      {text:"Cancel",style:"cancel"},
      {text:"Remove",style:"destructive",onPress:()=>savePeptides(peptides.filter((_,j)=>j!==i))}
    ]);
  };

  const updatePeptide = (i: number, field: Partial<PeptideEntry>) => { const u=[...peptides]; u[i]={...u[i],...field}; savePeptides(u); };

  const toggleExpand = (name: string) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedItem(expandedItem===name?null:name); };

  // Group today's due by timing
  const groupedByTiming = TIME_OPTIONS.reduce<Record<TimeOfDay, PeptideEntry[]>>((acc, t) => {
    acc[t] = todaysDue.filter(p => p.timing === t);
    return acc;
  }, { Morning: [], Afternoon: [], Evening: [], "Before Bed": [] });

  // Empty state
  if (peptides.length === 0 && !adding) {
    return (
      <ScrollView style={s.container} contentContainerStyle={{paddingBottom:40}}>
        <View style={s.header}>
          <Text style={s.title}>Peptide Tracker</Text>
          <Text style={s.subtitle}>Track your peptide protocols, timing, and injection sites</Text>
        </View>
        <View style={{alignItems:"center",paddingVertical:40}}>
          <Text style={{fontSize:40,marginBottom:12}}>💉</Text>
          <Text style={{fontSize:18,fontWeight:"600",color:colors.white,marginBottom:8}}>No Peptides Configured</Text>
          <Text style={{fontSize:13,color:colors.textMuted,marginBottom:20,textAlign:"center",paddingHorizontal:40}}>Add your peptide protocols to start tracking dosages, injection sites, and adherence.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={()=>setAdding(true)}><Text style={s.primaryBtnText}>Add First Peptide</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const statusColors: Record<WeeklyStatus, { bg: string; border: string; text: string; bar: string; label: string }> = {
    extra:       { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: colors.red, bar: colors.red, label: "Extra Dose" },
    complete:    { bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.2)", text: colors.teal, bar: colors.teal, label: "Complete" },
    "on-track":  { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: colors.blue, bar: colors.blue, label: "On Track" },
    behind:      { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", text: colors.amber, bar: colors.amber, label: "Behind" },
    missed:      { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: colors.red, bar: colors.red, label: "Missed" },
    "as-needed": { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", text: colors.textMuted, bar: colors.textMuted, label: "As Needed" },
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{paddingBottom:40}}>
      <View style={s.header}>
        <Text style={s.title}>Peptide Tracker</Text>
        <Text style={s.subtitle}>Track your peptide protocols, timing, and injection sites</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard,{backgroundColor:"rgba(20,184,166,0.1)",borderColor:"rgba(20,184,166,0.2)"}]}>
          <Text style={[s.statVal,{color:colors.teal}]}>{todaysTaken.length}/{todaysDue.length}</Text>
          <Text style={[s.statLabel,{color:"rgba(20,184,166,0.7)"}]}>Today</Text>
        </View>
        <View style={[s.statCard,{backgroundColor:"rgba(168,85,247,0.1)",borderColor:"rgba(168,85,247,0.2)"}]}>
          <Text style={[s.statVal,{color:colors.purple}]}>{streak}</Text>
          <Text style={[s.statLabel,{color:"rgba(168,85,247,0.7)"}]}>Day Streak</Text>
        </View>
        <View style={[s.statCard,{backgroundColor:"rgba(59,130,246,0.1)",borderColor:"rgba(59,130,246,0.2)"}]}>
          <Text style={[s.statVal,{color:colors.blue}]}>{adherence}%</Text>
          <Text style={[s.statLabel,{color:"rgba(59,130,246,0.7)"}]}>This Week</Text>
        </View>
      </View>

      {/* Today's Schedule — grouped by timing */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Today&apos;s Schedule</Text>
        {todaysDue.length === 0 ? (
          <Text style={{fontSize:13,color:colors.textMuted,paddingVertical:8}}>No peptides scheduled for today.</Text>
        ) : (
          <>
            {TIME_OPTIONS.map(timeSlot => {
              const group = groupedByTiming[timeSlot];
              if (group.length === 0) return null;
              return (
                <View key={timeSlot} style={{marginBottom:10}}>
                  {/* Time slot header */}
                  <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:6}}>
                    <Text style={{fontSize:13}}>{TIMING_ICONS[timeSlot]}</Text>
                    <Text style={{fontSize:9,fontWeight:"700",color:colors.textMuted,textTransform:"uppercase",letterSpacing:1}}>{timeSlot}</Text>
                    <View style={{flex:1,height:1,backgroundColor:"rgba(51,65,85,0.3)"}} />
                  </View>
                  {group.map(p => {
                    const entry = log[today]?.[p.name];
                    const taken = entry?.taken ?? false;
                    return (
                      <View key={p.name} style={[s.scheduleItem,taken&&{backgroundColor:"rgba(20,184,166,0.1)",borderColor:"rgba(20,184,166,0.3)"}]}>
                        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <View>
                            <Text style={[s.schedName,taken&&{color:colors.tealLight}]}>{p.name}</Text>
                            <Text style={s.schedDetail}>{p.dosage>0?`${p.dosage}${p.unit}`:""} {p.frequency} · {entry?.site || p.site}</Text>
                            {entry?.time && <Text style={{fontSize:10,color:colors.textDim,marginTop:2}}>Logged at {entry.time}</Text>}
                          </View>
                          <View style={[s.statusBadge,taken?{backgroundColor:"rgba(20,184,166,0.2)"}:{backgroundColor:"rgba(51,65,85,0.5)"}]}>
                            <Text style={[s.statusText,taken?{color:colors.teal}:{color:colors.textMuted}]}>{taken?"Complete":"Pending"}</Text>
                          </View>
                        </View>
                        <TouchableOpacity style={[s.doseBtn,taken&&s.doseBtnDone]} onPress={()=>toggleDose(today,p.name,p.site)}>
                          <View style={[s.doseCheck,taken&&s.doseCheckDone]}>{taken&&<Text style={{color:colors.white,fontSize:10,fontWeight:"700"}}>✓</Text>}</View>
                          <Text style={[s.doseBtnText,taken&&{color:colors.teal}]}>Dose</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })}
            {/* Daily progress bar */}
            <View style={{marginTop:4}}>
              <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:4}}>
                <Text style={{fontSize:10,color:colors.textMuted}}>Daily progress</Text>
                <Text style={{fontSize:10,color:colors.textMuted}}>{todaysDue.length>0?Math.round((todaysTaken.length/todaysDue.length)*100):0}%</Text>
              </View>
              <View style={{height:6,backgroundColor:"rgba(30,41,59,0.8)",borderRadius:3,overflow:"hidden"}}>
                <View style={{height:6,borderRadius:3,backgroundColor:colors.teal,width:`${todaysDue.length>0?(todaysTaken.length/todaysDue.length)*100:0}%` as any}} />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Your Peptides */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Your Peptides</Text>
        {peptides.map((p, i) => {
          const info = findPeptideInfo(p.name);
          const isExpanded = expandedItem === p.name;
          return (
            <View key={`${p.name}-${i}`} style={s.itemCard}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <TouchableOpacity style={{flex:1}} onPress={()=>info&&toggleExpand(p.name)} activeOpacity={info?0.6:1}>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Text style={s.itemName}>{p.name}</Text>
                    {info&&<View style={s.infoBadge}><Text style={s.infoBadgeText}>i</Text></View>}
                  </View>
                  <Text style={s.itemDetail}>{p.dosage>0?`${p.dosage}${p.unit}`:""} {p.frequency} · {p.site}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>removePeptide(i)} style={{padding:4}}>
                  <Text style={{color:colors.textMuted,fontSize:18}}>×</Text>
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
              <View style={{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:6}}>
                {TIME_OPTIONS.map(t=>(
                  <TouchableOpacity key={t} style={[s.miniChip,p.timing===t&&s.miniChipActive]} onPress={()=>updatePeptide(i,{timing:t})}>
                    <Text style={[s.miniChipText,p.timing===t&&{color:colors.teal}]}>{TIMING_ICONS[t]} {t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:6}}>
                {INJECTION_SITES.map(site=>(
                  <TouchableOpacity key={site} style={[s.miniChip,p.site===site&&s.miniChipActive]} onPress={()=>updatePeptide(i,{site})}>
                    <Text style={[s.miniChipText,p.site===site&&{color:colors.teal}]}>{site}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Add form */}
        {adding ? (
          <View style={s.addForm}>
            <Text style={{fontSize:10,color:colors.textDim,marginBottom:6}}>Common peptides — tap to fill</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {COMMON_PEPTIDES.map(name=>{
                const exists=peptides.some(p=>p.name.toLowerCase()===name.toLowerCase());
                return <TouchableOpacity key={name} style={[s.wordChip,exists&&s.wordChipActive]} onPress={()=>{if(!exists)setNewName(name);}}><Text style={[s.wordChipText,exists&&{color:colors.teal}]}>{exists?`${name} ✓`:name}</Text></TouchableOpacity>;
              })}
            </View>
            <TextInput style={s.input} placeholder="Peptide name" placeholderTextColor={colors.textMuted} value={newName} onChangeText={setNewName} />
            <View style={{flexDirection:"row",gap:8}}>
              <TextInput style={[s.input,{flex:1}]} placeholder="Dosage" placeholderTextColor={colors.textMuted} value={newDosage} onChangeText={setNewDosage} keyboardType="numeric" />
              <View style={{flexDirection:"row",gap:4}}>
                {DOSAGE_UNITS.map(u=><TouchableOpacity key={u} style={[s.miniChip,newUnit===u&&s.miniChipActive]} onPress={()=>setNewUnit(u)}><Text style={[s.miniChipText,newUnit===u&&{color:colors.teal}]}>{u}</Text></TouchableOpacity>)}
              </View>
            </View>
            <Text style={s.fieldLabel}>Frequency</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5}}>
              {FREQUENCY_OPTIONS.map(f=><TouchableOpacity key={f} style={[s.miniChip,newFreq===f&&s.miniChipActive]} onPress={()=>setNewFreq(f)}><Text style={[s.miniChipText,newFreq===f&&{color:colors.teal}]}>{f}</Text></TouchableOpacity>)}
            </View>
            <Text style={s.fieldLabel}>Timing</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5}}>
              {TIME_OPTIONS.map(t=><TouchableOpacity key={t} style={[s.miniChip,newTiming===t&&s.miniChipActive]} onPress={()=>setNewTiming(t)}><Text style={[s.miniChipText,newTiming===t&&{color:colors.teal}]}>{TIMING_ICONS[t]} {t}</Text></TouchableOpacity>)}
            </View>
            <Text style={s.fieldLabel}>Injection Site</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5}}>
              {INJECTION_SITES.map(site=><TouchableOpacity key={site} style={[s.miniChip,newSite===site&&s.miniChipActive]} onPress={()=>setNewSite(site)}><Text style={[s.miniChipText,newSite===site&&{color:colors.teal}]}>{site}</Text></TouchableOpacity>)}
            </View>
            <View style={{flexDirection:"row",gap:8,marginTop:6}}>
              <TouchableOpacity style={s.primaryBtn} onPress={addPeptide}><Text style={s.primaryBtnText}>Add</Text></TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={()=>{setAdding(false);setNewName("");}}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.addBtn} onPress={()=>setAdding(true)}><Text style={s.addBtnText}>+ Add peptide</Text></TouchableOpacity>
        )}
      </View>

      {/* Weekly Completion */}
      <View style={s.card}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <Text style={s.cardTitle}>Weekly Completion</Text>
          <View style={[s.adherenceBadge,{backgroundColor:adherence>=90?"rgba(20,184,166,0.2)":adherence>=60?"rgba(245,158,11,0.2)":"rgba(239,68,68,0.2)"}]}>
            <Text style={{fontSize:10,fontWeight:"700",color:adherence>=90?colors.teal:adherence>=60?colors.amber:colors.red}}>{adherence}% overall</Text>
          </View>
        </View>
        {weeklyAnalysis.map(a => {
          const sc = statusColors[a.status];
          return (
            <View key={a.name} style={[s.weeklyItem,{backgroundColor:sc.bg,borderColor:sc.border}]}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
                  <Text style={{fontSize:13,fontWeight:"500",color:colors.text}}>{a.name}</Text>
                  <Text style={{fontSize:9,color:colors.textMuted}}>{getFrequencyLabel(a.frequency)}</Text>
                </View>
                <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
                  {a.status==="as-needed" ? (
                    <Text style={{fontSize:11,fontFamily:Platform.OS==="ios"?"Menlo":"monospace",color:colors.text}}>{a.taken}x taken</Text>
                  ) : a.status==="extra" ? (
                    <Text style={{fontSize:11,fontFamily:Platform.OS==="ios"?"Menlo":"monospace",color:colors.red}}>{a.taken}/{a.expected} (+{a.taken-a.expected})</Text>
                  ) : (
                    <Text style={{fontSize:11,fontFamily:Platform.OS==="ios"?"Menlo":"monospace",color:colors.text}}>{a.taken}/{a.expected}</Text>
                  )}
                  <View style={[s.statusChip,{backgroundColor:sc.bg}]}>
                    <Text style={{fontSize:8,fontWeight:"700",color:sc.text,textTransform:"uppercase"}}>{sc.label}</Text>
                  </View>
                </View>
              </View>
              {a.status !== "as-needed" && (
                <View style={{height:5,backgroundColor:"rgba(30,41,59,0.6)",borderRadius:3,overflow:"hidden"}}>
                  <View style={{height:5,borderRadius:3,backgroundColor:sc.bar,width:`${a.pct}%` as any}} />
                </View>
              )}
            </View>
          );
        })}
        {/* Summary */}
        {(() => {
          const scheduled = weeklyAnalysis.filter(a => a.status !== "as-needed");
          const complete = scheduled.filter(a => a.status === "complete").length;
          const behind = scheduled.filter(a => a.status === "behind" || a.status === "missed").length;
          if (scheduled.length === 0) return null;
          return (
            <View style={{marginTop:10,paddingTop:8,borderTopWidth:1,borderTopColor:adherence>=90?"rgba(20,184,166,0.2)":adherence>=60?"rgba(245,158,11,0.2)":"rgba(239,68,68,0.2)"}}>
              <Text style={{fontSize:11,color:colors.textSecondary}}>
                {adherence>=90 ? `Great job! ${complete}/${scheduled.length} peptides completed this week.`
                  : adherence>=60 ? `Making progress. ${complete}/${scheduled.length} completed, ${behind} need${behind===1?"s":""} attention.`
                  : `${behind} of ${scheduled.length} peptide${scheduled.length!==1?"s":""} behind schedule. Try setting a daily reminder.`}
              </Text>
            </View>
          );
        })()}
      </View>

      {/* Weekly Grid */}
      <View style={s.card}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <Text style={s.cardTitle}>Weekly Schedule</Text>
          <View style={{flexDirection:"row",alignItems:"center",gap:8}}>
            <TouchableOpacity onPress={()=>setWeekOffset(w=>w-1)}><Text style={{color:colors.teal,fontSize:18}}>‹</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setWeekOffset(0)}><Text style={{fontSize:11,color:weekOffset===0?colors.teal:colors.textMuted}}>This Week</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>setWeekOffset(w=>w+1)}><Text style={{color:colors.teal,fontSize:18}}>›</Text></TouchableOpacity>
          </View>
        </View>
        {/* Day headers */}
        <View style={{flexDirection:"row",marginBottom:6}}>
          <View style={{width:100}} />
          {weekDates.map(d=>{const td=isTodayDate(d);return <View key={dateKey(d)} style={{flex:1,alignItems:"center"}}><Text style={{fontSize:9,fontWeight:"700",color:td?colors.teal:colors.textMuted}}>{DAY_NAMES[d.getDay()]}</Text><Text style={{fontSize:10,color:td?colors.tealLight:colors.textSecondary}}>{d.getDate()}</Text></View>;})}
        </View>
        {peptides.map(p=>(
          <View key={p.name} style={{flexDirection:"row",alignItems:"center",marginBottom:4}}>
            <View style={{width:100,paddingRight:6}}>
              <Text style={{fontSize:10,color:colors.text}} numberOfLines={1}>{p.name}</Text>
              <Text style={{fontSize:8,color:colors.textDim}} numberOfLines={1}>{p.dosage>0?`${p.dosage}${p.unit}`:""} {p.timing}</Text>
            </View>
            {weekDates.map(d=>{
              const k=dateKey(d); const taken=log[k]?.[p.name]?.taken??false; const due=isDueOnDate(p.frequency,d); const isFuture=d>new Date()&&!isTodayDate(d);
              return <TouchableOpacity key={k} style={{flex:1,aspectRatio:1,borderRadius:6,margin:1,alignItems:"center",justifyContent:"center",backgroundColor:isFuture?"rgba(30,41,59,0.2)":taken?"rgba(20,184,166,0.3)":!due?"rgba(30,41,59,0.1)":"rgba(30,41,59,0.3)",borderWidth:1,borderColor:taken?"rgba(20,184,166,0.4)":!due?"rgba(30,41,59,0.2)":"rgba(51,65,85,0.2)"}} onPress={()=>!isFuture&&toggleDose(k,p.name,p.site)} disabled={isFuture}>
                {taken?<Text style={{color:colors.teal,fontSize:10,fontWeight:"700"}}>✓</Text>:<View style={{width:4,height:4,borderRadius:2,backgroundColor:due?"rgba(100,116,139,0.6)":"rgba(100,116,139,0.3)"}} />}
              </TouchableOpacity>;
            })}
          </View>
        ))}
      </View>

      {/* Last 30 Days Heatmap */}
      <View style={s.card}>
        <Text style={[s.cardTitle,{marginBottom:10}]}>Last 30 Days</Text>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:3}}>
          {Array.from({length:30},(_,i)=>{
            const d=new Date(); d.setDate(d.getDate()-(29-i));
            const k=dateKey(d);
            const scheduled=peptides.filter(p=>isDueOnDate(p.frequency,d)&&parseDosesPerWeekNominal(p.frequency)>0);
            const totalExpected=scheduled.length;
            const totalTaken=scheduled.filter(p=>log[k]?.[p.name]?.taken).length;
            const ratio=totalExpected>0?totalTaken/totalExpected:0;
            let bg="rgba(30,41,59,0.4)";
            if(totalExpected===0) bg="rgba(30,41,59,0.2)";
            else if(ratio===1) bg=colors.teal;
            else if(ratio>=0.5) bg="rgba(20,184,166,0.5)";
            else if(ratio>0) bg="rgba(20,184,166,0.2)";
            return <View key={k} style={{width:14,height:14,borderRadius:3,backgroundColor:bg}} />;
          })}
        </View>
        <View style={{flexDirection:"row",gap:12,marginTop:8}}>
          <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
            <View style={{width:10,height:10,borderRadius:2,backgroundColor:"rgba(30,41,59,0.4)"}} />
            <Text style={{fontSize:9,color:colors.textDim}}>None</Text>
          </View>
          <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
            <View style={{width:10,height:10,borderRadius:2,backgroundColor:"rgba(20,184,166,0.2)"}} />
            <Text style={{fontSize:9,color:colors.textDim}}>Some</Text>
          </View>
          <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
            <View style={{width:10,height:10,borderRadius:2,backgroundColor:"rgba(20,184,166,0.5)"}} />
            <Text style={{fontSize:9,color:colors.textDim}}>Most</Text>
          </View>
          <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
            <View style={{width:10,height:10,borderRadius:2,backgroundColor:colors.teal}} />
            <Text style={{fontSize:9,color:colors.textDim}}>All</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.bg},
  header:{paddingHorizontal:20,paddingTop:16,paddingBottom:8},
  title:{fontSize:20,fontWeight:"600",color:colors.white},
  subtitle:{fontSize:11,color:colors.textMuted,marginTop:2},
  statsRow:{flexDirection:"row",gap:8,paddingHorizontal:16,marginTop:8},
  statCard:{flex:1,borderWidth:1,borderRadius:12,padding:12,alignItems:"center"},
  statVal:{fontSize:22,fontWeight:"700"},
  statLabel:{fontSize:10,marginTop:2},
  card:{marginHorizontal:16,marginTop:12,backgroundColor:"rgba(30,41,59,0.3)",borderWidth:1,borderColor:colors.border,borderRadius:14,padding:14},
  cardTitle:{fontSize:13,fontWeight:"600",color:colors.white,marginBottom:8},
  scheduleItem:{padding:10,borderRadius:10,borderWidth:1,borderColor:colors.border,backgroundColor:"rgba(30,41,59,0.4)",marginBottom:6},
  schedName:{fontSize:14,fontWeight:"600",color:colors.text},
  schedDetail:{fontSize:10,color:colors.textMuted,marginTop:2},
  statusBadge:{paddingHorizontal:8,paddingVertical:3,borderRadius:6},
  statusText:{fontSize:9,fontWeight:"700",textTransform:"uppercase"},
  doseBtn:{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:10,paddingVertical:6,borderRadius:8,borderWidth:1,borderColor:"rgba(51,65,85,0.5)",backgroundColor:"rgba(30,41,59,0.6)",alignSelf:"flex-start"},
  doseBtnDone:{backgroundColor:"rgba(20,184,166,0.2)",borderColor:"rgba(20,184,166,0.3)"},
  doseCheck:{width:16,height:16,borderRadius:4,borderWidth:2,borderColor:colors.textMuted,alignItems:"center",justifyContent:"center"},
  doseCheckDone:{backgroundColor:colors.teal,borderColor:colors.teal},
  doseBtnText:{fontSize:11,color:colors.textSecondary},
  itemCard:{backgroundColor:"rgba(30,41,59,0.6)",borderWidth:1,borderColor:"rgba(51,65,85,0.3)",borderRadius:10,padding:10,marginBottom:6},
  itemName:{fontSize:14,fontWeight:"500",color:colors.text},
  itemDetail:{fontSize:10,color:colors.textMuted,marginTop:2},
  infoBadge:{marginLeft:6,width:16,height:16,borderRadius:8,backgroundColor:"rgba(20,184,166,0.2)",alignItems:"center",justifyContent:"center"},
  infoBadgeText:{fontSize:10,fontWeight:"700",color:colors.teal},
  infoDropdown:{marginTop:8,paddingTop:8,borderTopWidth:1,borderTopColor:"rgba(51,65,85,0.3)",gap:6},
  infoLabel:{fontSize:9,fontWeight:"700",color:colors.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:2},
  infoText:{fontSize:12,color:colors.textSecondary,lineHeight:18},
  miniChip:{borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:9,paddingVertical:4},
  miniChipActive:{backgroundColor:"rgba(20,184,166,0.15)",borderColor:colors.teal},
  miniChipText:{fontSize:10,color:colors.textMuted},
  wordChip:{borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:9,paddingVertical:4,backgroundColor:colors.bgInput},
  wordChipActive:{backgroundColor:"rgba(20,184,166,0.15)",borderColor:"rgba(20,184,166,0.3)"},
  wordChipText:{fontSize:10,color:colors.textSecondary},
  addForm:{backgroundColor:"rgba(30,41,59,0.6)",borderWidth:1,borderColor:"rgba(51,65,85,0.3)",borderRadius:10,padding:12,gap:8,marginTop:6},
  input:{backgroundColor:colors.bgInput,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:14,paddingVertical:10,fontSize:14,color:colors.text},
  fieldLabel:{fontSize:9,fontWeight:"700",color:colors.textMuted,textTransform:"uppercase",letterSpacing:1,marginTop:4},
  addBtn:{marginTop:6,paddingVertical:10,alignItems:"center",borderWidth:1,borderColor:colors.border,borderRadius:10,borderStyle:"dashed"},
  addBtnText:{color:colors.teal,fontSize:13,fontWeight:"500"},
  primaryBtn:{flex:1,backgroundColor:colors.teal,borderRadius:10,paddingVertical:10,alignItems:"center"},
  primaryBtnText:{color:colors.white,fontWeight:"600",fontSize:14},
  cancelBtn:{flex:1,backgroundColor:colors.bgInput,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingVertical:10,alignItems:"center"},
  cancelBtnText:{color:colors.textSecondary,fontSize:14},
  adherenceBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:12},
  weeklyItem:{borderWidth:1,borderRadius:10,padding:10,marginBottom:6},
  statusChip:{paddingHorizontal:6,paddingVertical:2,borderRadius:4},
});
