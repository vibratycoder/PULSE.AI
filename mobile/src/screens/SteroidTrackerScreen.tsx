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
import { findSteroidInfo } from "../data/steroidData";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DosageUnit = "mg" | "ml" | "IU" | "mcg";
type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Before Bed";
type Route = "IM injection" | "SubQ injection" | "Oral" | "Topical";

interface SteroidEntry {
  name: string;
  dosage: number;
  unit: DosageUnit;
  frequency: string;
  site: string;
  timing: TimeOfDay;
  cycleLength: string;
  cycleStatus: "on" | "off";
  route: Route;
}

interface SteroidLogEntry { taken: boolean; site: string; time: string; }
interface SteroidLog { [dateKey: string]: { [name: string]: SteroidLogEntry }; }

const DOSAGE_UNITS: DosageUnit[] = ["mg", "ml", "IU", "mcg"];
const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Before Bed"];
const ROUTE_OPTIONS: Route[] = ["IM injection", "SubQ injection", "Oral", "Topical"];
const CYCLE_OPTIONS = ["4 weeks", "6 weeks", "8 weeks", "10 weeks", "12 weeks", "16 weeks", "20 weeks", "Ongoing / TRT"];
const FREQUENCY_OPTIONS = ["Daily", "Twice daily", "Every other day", "3x per week", "2x per week", "Weekly", "Twice weekly", "As needed"];
const INJECTION_SITES = ["Glute (left)", "Glute (right)", "Deltoid (left)", "Deltoid (right)", "Thigh (left)", "Thigh (right)", "Ventro-glute (left)", "Ventro-glute (right)"];
const COMMON_STEROIDS = ["Testosterone Cypionate", "Testosterone Enanthate", "Nandrolone Decanoate", "Trenbolone Acetate", "Oxandrolone (Anavar)", "Stanozolol (Winstrol)", "Boldenone (EQ)", "Masteron", "Primobolan", "HGH", "Dianabol", "Anadrol"];

const TIMING_ICONS: Record<TimeOfDay, string> = { Morning: "\u2600", Afternoon: "\u26C5", Evening: "\uD83C\uDF19", "Before Bed": "\uD83D\uDCA4" };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STORAGE_KEY = "pulseai_steroidlog";
const STEROIDS_KEY = "pulseai_steroids";

function dateKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function isTodayDate(d: Date) { const t = new Date(); return d.getDate()===t.getDate()&&d.getMonth()===t.getMonth()&&d.getFullYear()===t.getFullYear(); }
function isDueOnDate(freq: string, date: Date): boolean {
  const d = freq.toLowerCase();
  if (d.includes("as needed")) return false;
  if (d.includes("daily") || d.includes("twice daily")) return true;
  if (d.includes("every other day")) { const doy = Math.floor((date.getTime()-new Date(date.getFullYear(),0,0).getTime())/86400000); return doy%2===0; }
  const dow = date.getDay();
  if (d.includes("3x per week")) return [1,3,5].includes(dow);
  if (d.includes("2x per week") || d.includes("twice weekly")) return [1,4].includes(dow);
  if (d.includes("weekly")) return dow===1;
  return true;
}

function getWeekDates(offset: number): Date[] {
  const today = new Date(); const start = new Date(today);
  start.setDate(today.getDate()-today.getDay()+offset*7);
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
}

export default function SteroidTrackerScreen() {
  const [steroids, setSteroids] = useState<SteroidEntry[]>([]);
  const [log, setLog] = useState<SteroidLog>({});
  const [adding, setAdding] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string|null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newUnit, setNewUnit] = useState<DosageUnit>("mg");
  const [newFreq, setNewFreq] = useState("Twice weekly");
  const [newSite, setNewSite] = useState(INJECTION_SITES[0]);
  const [newTiming, setNewTiming] = useState<TimeOfDay>("Morning");
  const [newRoute, setNewRoute] = useState<Route>("IM injection");
  const [newCycle, setNewCycle] = useState("12 weeks");

  const today = dateKey(new Date());
  const weekDates = getWeekDates(weekOffset);
  const todayDate = new Date();
  const todaysDue = steroids.filter(s => s.cycleStatus === "on" && isDueOnDate(s.frequency, todayDate));
  const todaysTaken = todaysDue.filter(s => log[today]?.[s.name]?.taken);

  useEffect(() => {
    AsyncStorage.getItem(STEROIDS_KEY).then(r => { if(r) setSteroids(JSON.parse(r).map((s:any)=>({...s,timing:s.timing||"Morning",route:s.route||"IM injection",cycleLength:s.cycleLength||"12 weeks",cycleStatus:s.cycleStatus||"on"}))); });
    AsyncStorage.getItem(STORAGE_KEY).then(r => { if(r) setLog(JSON.parse(r)); });
  }, []);

  const saveSteroids = (entries: SteroidEntry[]) => { setSteroids(entries); AsyncStorage.setItem(STEROIDS_KEY, JSON.stringify(entries)); };
  const saveLogState = (l: SteroidLog) => { setLog(l); AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(l)); };

  const toggleDose = useCallback((day: string, name: string, site: string) => {
    setLog(prev => {
      const updated = {...prev};
      if(updated[day]?.[name]?.taken) { const {[name]:_,...rest}=updated[day]; updated[day]=rest; }
      else { if(!updated[day]) updated[day]={}; updated[day]={...updated[day],[name]:{taken:true,site,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}}; }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addSteroid = () => {
    if(!newName.trim()) return;
    saveSteroids([...steroids,{name:newName.trim(),dosage:parseFloat(newDosage)||0,unit:newUnit,frequency:newFreq,site:newSite,timing:newTiming,route:newRoute,cycleLength:newCycle,cycleStatus:"on"}]);
    setNewName(""); setNewDosage(""); setNewUnit("mg"); setNewFreq("Twice weekly"); setNewSite(INJECTION_SITES[0]); setNewTiming("Morning"); setNewRoute("IM injection"); setNewCycle("12 weeks"); setAdding(false);
  };

  const removeSteroid = (i: number) => {
    Alert.alert("Remove", `Remove ${steroids[i].name}?`, [
      {text:"Cancel",style:"cancel"},
      {text:"Remove",style:"destructive",onPress:()=>saveSteroids(steroids.filter((_,j)=>j!==i))}
    ]);
  };

  const updateSteroid = (i: number, field: Partial<SteroidEntry>) => { const u=[...steroids]; u[i]={...u[i],...field}; saveSteroids(u); };

  const toggleExpand = (name: string) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedItem(expandedItem===name?null:name); };

  // Empty state
  if (steroids.length === 0 && !adding) {
    return (
      <ScrollView style={s.container} contentContainerStyle={{paddingBottom:40}}>
        <View style={s.header}>
          <Text style={s.title}>Steroid Tracker</Text>
          <Text style={s.subtitle}>Track your steroid protocols, cycles, and injection sites</Text>
        </View>
        <View style={{alignItems:"center",paddingVertical:40}}>
          <Text style={{fontSize:40,marginBottom:12}}>💉</Text>
          <Text style={{fontSize:18,fontWeight:"600",color:colors.white,marginBottom:8}}>No Steroids Configured</Text>
          <Text style={{fontSize:13,color:colors.textMuted,marginBottom:20,textAlign:"center",paddingHorizontal:40}}>Add your steroid protocols to start tracking dosages, injection sites, and cycle adherence.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={()=>setAdding(true)}><Text style={s.primaryBtnText}>Add First Steroid</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{paddingBottom:40}}>
      <View style={s.header}>
        <Text style={s.title}>Steroid Tracker</Text>
        <Text style={s.subtitle}>Track your steroid protocols, cycles, and injection sites</Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard,{backgroundColor:"rgba(20,184,166,0.1)",borderColor:"rgba(20,184,166,0.2)"}]}>
          <Text style={[s.statVal,{color:colors.teal}]}>{todaysTaken.length}/{todaysDue.length}</Text>
          <Text style={[s.statLabel,{color:"rgba(20,184,166,0.7)"}]}>Today</Text>
        </View>
        <View style={[s.statCard,{backgroundColor:"rgba(168,85,247,0.1)",borderColor:"rgba(168,85,247,0.2)"}]}>
          <Text style={[s.statVal,{color:colors.purple}]}>{steroids.filter(st=>st.cycleStatus==="on").length}</Text>
          <Text style={[s.statLabel,{color:"rgba(168,85,247,0.7)"}]}>Active</Text>
        </View>
        <View style={[s.statCard,{backgroundColor:"rgba(59,130,246,0.1)",borderColor:"rgba(59,130,246,0.2)"}]}>
          <Text style={[s.statVal,{color:colors.blue}]}>{steroids.length}</Text>
          <Text style={[s.statLabel,{color:"rgba(59,130,246,0.7)"}]}>Total</Text>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Today&apos;s Schedule</Text>
        {todaysDue.length === 0 ? (
          <Text style={{fontSize:13,color:colors.textMuted,paddingVertical:8}}>No steroids scheduled for today.</Text>
        ) : (
          todaysDue.map(st => {
            const entry = log[today]?.[st.name];
            const taken = entry?.taken ?? false;
            return (
              <View key={st.name} style={[s.scheduleItem,taken&&{backgroundColor:"rgba(20,184,166,0.1)",borderColor:"rgba(20,184,166,0.3)"}]}>
                <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <View>
                    <Text style={[s.schedName,taken&&{color:colors.tealLight}]}>{st.name}</Text>
                    <Text style={s.schedDetail}>{st.dosage>0?`${st.dosage}${st.unit}`:""} {st.frequency} · {st.route}</Text>
                    {entry?.time && <Text style={{fontSize:10,color:colors.textDim,marginTop:2}}>Logged at {entry.time}</Text>}
                  </View>
                  <View style={[s.statusBadge,taken?{backgroundColor:"rgba(20,184,166,0.2)"}:{backgroundColor:"rgba(51,65,85,0.5)"}]}>
                    <Text style={[s.statusText,taken?{color:colors.teal}:{color:colors.textMuted}]}>{taken?"Complete":"Pending"}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[s.doseBtn,taken&&s.doseBtnDone]} onPress={()=>toggleDose(today,st.name,st.site)}>
                  <View style={[s.doseCheck,taken&&s.doseCheckDone]}>{taken&&<Text style={{color:colors.white,fontSize:10,fontWeight:"700"}}>✓</Text>}</View>
                  <Text style={[s.doseBtnText,taken&&{color:colors.teal}]}>Dose</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* Your Steroids */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Your Steroids</Text>
        {steroids.map((st, i) => {
          const info = findSteroidInfo(st.name);
          const isExpanded = expandedItem === st.name;
          return (
            <View key={`${st.name}-${i}`} style={s.itemCard}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <TouchableOpacity style={{flex:1}} onPress={()=>info&&toggleExpand(st.name)} activeOpacity={info?0.6:1}>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Text style={s.itemName}>{st.name}</Text>
                    {info&&<View style={s.infoBadge}><Text style={s.infoBadgeText}>i</Text></View>}
                  </View>
                  <Text style={s.itemDetail}>{st.dosage>0?`${st.dosage}${st.unit}`:""} {st.frequency} · {st.route} · {st.cycleLength}</Text>
                </TouchableOpacity>
                <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
                  <TouchableOpacity
                    style={[s.cycleBtn,st.cycleStatus==="on"?{backgroundColor:"rgba(34,197,94,0.15)",borderColor:"rgba(34,197,94,0.3)"}:{backgroundColor:"rgba(239,68,68,0.15)",borderColor:"rgba(239,68,68,0.3)"}]}
                    onPress={()=>updateSteroid(i,{cycleStatus:st.cycleStatus==="on"?"off":"on"})}
                  >
                    <Text style={{fontSize:10,fontWeight:"700",color:st.cycleStatus==="on"?colors.green:colors.red}}>{st.cycleStatus==="on"?"ON":"OFF"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>removeSteroid(i)} style={{padding:4}}>
                    <Text style={{color:colors.textMuted,fontSize:18}}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isExpanded && info && (
                <View style={s.infoDropdown}>
                  <View><Text style={s.infoLabel}>What it is</Text><Text style={s.infoText}>{info.synopsis}</Text></View>
                  <View><Text style={s.infoLabel}>Effects</Text><Text style={s.infoText}>{info.whatItDoes}</Text></View>
                  <View><Text style={s.infoLabel}>How it works</Text><Text style={s.infoText}>{info.howItWorks}</Text></View>
                </View>
              )}

              {/* Inline editors */}
              <View style={{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:6}}>
                {TIME_OPTIONS.map(t=>(
                  <TouchableOpacity key={t} style={[s.miniChip,st.timing===t&&s.miniChipActive]} onPress={()=>updateSteroid(i,{timing:t})}>
                    <Text style={[s.miniChipText,st.timing===t&&{color:colors.teal}]}>{TIMING_ICONS[t]} {t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Add form */}
        {adding ? (
          <View style={s.addForm}>
            <Text style={{fontSize:10,color:colors.textDim,marginBottom:6}}>Common steroids — tap to fill</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {COMMON_STEROIDS.map(name=>{
                const exists=steroids.some(s=>s.name.toLowerCase()===name.toLowerCase());
                return <TouchableOpacity key={name} style={[s.wordChip,exists&&s.wordChipActive]} onPress={()=>{if(!exists)setNewName(name);}}><Text style={[s.wordChipText,exists&&{color:colors.teal}]}>{exists?`${name} ✓`:name}</Text></TouchableOpacity>;
              })}
            </View>
            <TextInput style={s.input} placeholder="Steroid name" placeholderTextColor={colors.textMuted} value={newName} onChangeText={setNewName} />
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
            <Text style={s.fieldLabel}>Route</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5}}>
              {ROUTE_OPTIONS.map(r=><TouchableOpacity key={r} style={[s.miniChip,newRoute===r&&s.miniChipActive]} onPress={()=>setNewRoute(r)}><Text style={[s.miniChipText,newRoute===r&&{color:colors.teal}]}>{r}</Text></TouchableOpacity>)}
            </View>
            <Text style={s.fieldLabel}>Cycle Length</Text>
            <View style={{flexDirection:"row",flexWrap:"wrap",gap:5}}>
              {CYCLE_OPTIONS.map(c=><TouchableOpacity key={c} style={[s.miniChip,newCycle===c&&s.miniChipActive]} onPress={()=>setNewCycle(c)}><Text style={[s.miniChipText,newCycle===c&&{color:colors.teal}]}>{c}</Text></TouchableOpacity>)}
            </View>
            <View style={{flexDirection:"row",gap:8,marginTop:6}}>
              <TouchableOpacity style={s.primaryBtn} onPress={addSteroid}><Text style={s.primaryBtnText}>Add</Text></TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={()=>{setAdding(false);setNewName("");}}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.addBtn} onPress={()=>setAdding(true)}><Text style={s.addBtnText}>+ Add steroid</Text></TouchableOpacity>
        )}
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
        {steroids.filter(st=>st.cycleStatus==="on").map(st=>(
          <View key={st.name} style={{flexDirection:"row",alignItems:"center",marginBottom:4}}>
            <View style={{width:100,paddingRight:6}}><Text style={{fontSize:10,color:colors.text}} numberOfLines={1}>{st.name}</Text></View>
            {weekDates.map(d=>{
              const k=dateKey(d); const taken=log[k]?.[st.name]?.taken??false; const due=isDueOnDate(st.frequency,d); const isFuture=d>new Date()&&!isTodayDate(d);
              return <TouchableOpacity key={k} style={{flex:1,aspectRatio:1,borderRadius:6,margin:1,alignItems:"center",justifyContent:"center",backgroundColor:isFuture?"rgba(30,41,59,0.2)":taken?"rgba(20,184,166,0.3)":!due?"rgba(30,41,59,0.1)":"rgba(30,41,59,0.3)",borderWidth:1,borderColor:taken?"rgba(20,184,166,0.4)":!due?"rgba(30,41,59,0.2)":"rgba(51,65,85,0.2)"}} onPress={()=>!isFuture&&toggleDose(k,st.name,st.site)} disabled={isFuture}>
                {taken?<Text style={{color:colors.teal,fontSize:10,fontWeight:"700"}}>✓</Text>:<View style={{width:4,height:4,borderRadius:2,backgroundColor:due?"rgba(100,116,139,0.6)":"rgba(100,116,139,0.3)"}} />}
              </TouchableOpacity>;
            })}
          </View>
        ))}
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
  cycleBtn:{paddingHorizontal:10,paddingVertical:4,borderRadius:10,borderWidth:1},
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
});
