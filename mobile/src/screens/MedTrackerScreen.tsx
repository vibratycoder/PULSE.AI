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
import { colors } from "../lib/theme";
import { loadProfile, saveProfile, loadMedLog, saveMedLog, loadMedTiming, saveMedTiming } from "../lib/storage";
import {
  getWeekDates,
  formatDateKey,
  DAY_NAMES,
  getDoseCount,
  parseDosesPerDay,
  parseDosesPerWeek,
  isDueOnDate,
  countDueInWeek,
  getFrequencyLabel,
  TIMING_ICONS,
  TIME_OPTIONS,
} from "../lib/medUtils";
import { findMedicationInfo } from "../data/medicationData";
import type { Medication, MedLog, MedTimingMap } from "../lib/types";
import PeptideTrackerScreen from "./PeptideTrackerScreen";
import SteroidTrackerScreen from "./SteroidTrackerScreen";
import SupplementTrackerScreen from "./SupplementTrackerScreen";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SubTab = "medications" | "peptides" | "steroids" | "supplements";
const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "medications", label: "Medications" },
  { key: "peptides", label: "Peptides" },
  { key: "steroids", label: "Steroids" },
  { key: "supplements", label: "Supplements" },
];

export default function MedTrackerScreen() {
  const [subTab, setSubTab] = useState<SubTab>("medications");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medLog, setMedLog] = useState<MedLog>({});
  const [medTiming, setMedTiming] = useState<MedTimingMap>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("daily");
  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  const weekDates = getWeekDates(weekOffset);
  const today = formatDateKey(new Date());

  useEffect(() => {
    loadProfile().then((p) => {
      if (p?.medications) setMedications(p.medications);
    });
    loadMedLog().then((log) => setMedLog(log || {}));
    loadMedTiming().then((t) => setMedTiming(t || {}));
  }, []);

  const updateLog = useCallback(
    (day: string, medName: string, count: number) => {
      const updated = {
        ...medLog,
        [day]: { ...(medLog[day] || {}), [medName]: count },
      };
      setMedLog(updated);
      saveMedLog(updated);
    },
    [medLog]
  );

  const updateTiming = useCallback(
    (medName: string, time: string) => {
      const updated = { ...medTiming, [medName]: time as any };
      setMedTiming(updated);
      saveMedTiming(updated);
    },
    [medTiming]
  );

  const addMed = () => {
    if (!newMedName.trim()) return;
    const newMed = { name: newMedName.trim(), dosage: newMedDosage };
    const updated = [...medications, newMed];
    setMedications(updated);
    loadProfile().then((p) => {
      const profile = p || {};
      profile.medications = updated;
      saveProfile(profile);
    });
    setNewMedName("");
    setNewMedDosage("daily");
    setShowAddMed(false);
  };

  const removeMed = (index: number) => {
    Alert.alert("Remove medication", `Remove ${medications[index].name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updated = medications.filter((_, i) => i !== index);
          setMedications(updated);
          loadProfile().then((p) => {
            const profile = p || {};
            profile.medications = updated;
            saveProfile(profile);
          });
        },
      },
    ]);
  };

  const toggleExpand = (medName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMed(expandedMed === medName ? null : medName);
  };

  // Calculate streak
  let streak = 0;
  if (medications.length > 0) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
      const key = formatDateKey(d);
      const allDone = medications.every((med) => {
        if (!isDueOnDate(med.dosage, d)) return true;
        const expected = Math.max(parseDosesPerDay(med.dosage), 1);
        return getDoseCount(medLog, key, med.name) >= expected;
      });
      if (!allDone) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
  }

  const weekLabel = (() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const fmt = (d: Date) =>
      `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(start)} - ${fmt(end)}`;
  })();

  // Sub-tab rendering
  if (subTab === "steroids") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.subTabBar}>
          {SUB_TABS.map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.subTabItem, subTab === tab.key && styles.subTabItemActive]} onPress={() => setSubTab(tab.key)}>
              <Text style={[styles.subTabText, subTab === tab.key && styles.subTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SteroidTrackerScreen />
      </View>
    );
  }

  if (subTab === "supplements") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.subTabBar}>
          {SUB_TABS.map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.subTabItem, subTab === tab.key && styles.subTabItemActive]} onPress={() => setSubTab(tab.key)}>
              <Text style={[styles.subTabText, subTab === tab.key && styles.subTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SupplementTrackerScreen />
      </View>
    );
  }

  if (subTab === "peptides") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.subTabBar}>
          {SUB_TABS.map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.subTabItem, subTab === tab.key && styles.subTabItemActive]} onPress={() => setSubTab(tab.key)}>
              <Text style={[styles.subTabText, subTab === tab.key && styles.subTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <PeptideTrackerScreen />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Sub-tab bar */}
      <View style={styles.subTabBar}>
        {SUB_TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.subTabItem, subTab === tab.key && styles.subTabItemActive]} onPress={() => setSubTab(tab.key)}>
            <Text style={[styles.subTabText, subTab === tab.key && styles.subTabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Medication Tracker</Text>
        <Text style={styles.subtitle}>Track your daily medication adherence</Text>
      </View>

      {/* Streak */}
      {streak > 0 && (
        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>{streak} day streak!</Text>
        </View>
      )}

      {/* Week navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setWeekOffset((w) => w - 1)}>
          <Text style={styles.navArrow}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <TouchableOpacity
          onPress={() => setWeekOffset((w) => Math.min(w + 1, 0))}
          disabled={weekOffset >= 0}
        >
          <Text style={[styles.navArrow, weekOffset >= 0 && { opacity: 0.3 }]}>
            {">"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Med cards */}
      {medications.map((med, medIdx) => {
        const perDay = parseDosesPerDay(med.dosage);
        const perWeek = parseDosesPerWeek(med.dosage);
        const expected = countDueInWeek(med.dosage, weekDates);
        let taken = 0;
        for (const d of weekDates) {
          taken += getDoseCount(medLog, formatDateKey(d), med.name);
        }
        const pct = expected > 0 ? Math.round((taken / expected) * 100) : taken > 0 ? 100 : 0;
        const freqLabel = getFrequencyLabel(med.dosage);
        const timing = medTiming[med.name];
        const info = findMedicationInfo(med.name);
        const isExpanded = expandedMed === med.name;

        return (
          <View key={medIdx} style={styles.medCard}>
            <View style={styles.medHeader}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => info && toggleExpand(med.name)} activeOpacity={info ? 0.6 : 1}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  {info && (
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>i</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.medDosage}>
                  {med.dosage} {timing ? `| ${TIMING_ICONS[timing] || ""} ${timing}` : ""}
                </Text>
              </TouchableOpacity>
              <View style={styles.medStats}>
                <Text style={styles.medPct}>{pct}%</Text>
                <Text style={styles.medFreq}>{freqLabel}</Text>
              </View>
              <TouchableOpacity onPress={() => removeMed(medIdx)} style={{ padding: 4 }}>
                <Text style={{ color: colors.textMuted, fontSize: 18 }}>x</Text>
              </TouchableOpacity>
            </View>

            {/* Info dropdown */}
            {isExpanded && info && (
              <View style={styles.infoDropdown}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>What it is</Text>
                  <Text style={styles.infoText}>{info.synopsis}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>What it does</Text>
                  <Text style={styles.infoText}>{info.whatItDoes}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>How it works</Text>
                  <Text style={styles.infoText}>{info.howItWorks}</Text>
                </View>
              </View>
            )}

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(pct, 100)}%` as any,
                    backgroundColor:
                      pct >= 100 ? colors.green : pct >= 50 ? colors.amber : colors.red,
                  },
                ]}
              />
            </View>
            <Text style={styles.dosesSummary}>
              {taken}/{expected} doses this week
            </Text>

            {/* Daily checkboxes */}
            <View style={styles.dayRow}>
              {weekDates.map((date, dayIdx) => {
                const key = formatDateKey(date);
                const isToday = key === today;
                const due = isDueOnDate(med.dosage, date);
                const count = getDoseCount(medLog, key, med.name);
                const maxDoses = Math.max(perDay, 1);
                const isFuture = date > new Date();

                return (
                  <TouchableOpacity
                    key={dayIdx}
                    style={[
                      styles.dayCell,
                      isToday && styles.dayCellToday,
                      !due && perWeek > 0 && styles.dayCellNotDue,
                    ]}
                    onPress={() => {
                      if (isFuture) return;
                      const next = count >= maxDoses ? 0 : count + 1;
                      updateLog(key, med.name, next);
                    }}
                    disabled={isFuture}
                  >
                    <Text style={styles.dayName}>{DAY_NAMES[dayIdx]}</Text>
                    <View
                      style={[
                        styles.checkCircle,
                        count >= maxDoses && count > 0
                          ? styles.checkDone
                          : count > 0
                          ? styles.checkPartial
                          : due
                          ? styles.checkEmpty
                          : styles.checkNA,
                      ]}
                    >
                      <Text style={styles.checkText}>
                        {count >= maxDoses && count > 0
                          ? "\u2713"
                          : count > 0
                          ? `${count}`
                          : due
                          ? ""
                          : "-"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Timing selector */}
            <View style={styles.timingRow}>
              {TIME_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timingChip,
                    timing === t && styles.timingChipActive,
                  ]}
                  onPress={() => updateTiming(med.name, t)}
                >
                  <Text
                    style={[
                      styles.timingChipText,
                      timing === t && styles.timingChipTextActive,
                    ]}
                  >
                    {TIMING_ICONS[t]} {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      {/* Add medication */}
      {showAddMed ? (
        <View style={styles.addMedForm}>
          <TextInput
            style={styles.input}
            placeholder="Medication name"
            placeholderTextColor={colors.textMuted}
            value={newMedName}
            onChangeText={setNewMedName}
          />
          <View style={styles.freqRow}>
            {["daily", "twice daily", "weekly", "as needed"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.freqChip,
                  newMedDosage === f && styles.freqChipActive,
                ]}
                onPress={() => setNewMedDosage(f)}
              >
                <Text
                  style={[
                    styles.freqChipText,
                    newMedDosage === f && styles.freqChipTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.addMedActions}>
            <TouchableOpacity style={styles.addButton} onPress={addMed}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddMed(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addMedButton}
          onPress={() => setShowAddMed(true)}
        >
          <Text style={styles.addMedButtonText}>+ Add Medication</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  streakBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  streakText: { color: colors.green, fontSize: 14, fontWeight: "700" },
  weekNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navArrow: { fontSize: 20, color: colors.teal, fontWeight: "700", padding: 8 },
  weekLabel: { fontSize: 14, color: colors.text, fontWeight: "500" },
  medCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  medHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  medName: { fontSize: 15, fontWeight: "600", color: colors.teal },
  medDosage: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  medStats: { alignItems: "flex-end", marginRight: 8 },
  medPct: { fontSize: 18, fontWeight: "700", color: colors.white },
  medFreq: { fontSize: 10, color: colors.textMuted },
  infoBadge: {
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(20, 184, 166, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBadgeText: { fontSize: 10, fontWeight: "700", color: colors.teal },
  infoDropdown: {
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.3)",
    gap: 8,
  },
  infoRow: {},
  infoLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: { height: 4, borderRadius: 2 },
  dosesSummary: { fontSize: 10, color: colors.textMuted, marginBottom: 10 },
  dayRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  dayCell: { alignItems: "center", flex: 1, paddingVertical: 4 },
  dayCellToday: {
    backgroundColor: "rgba(20, 184, 166, 0.1)",
    borderRadius: 8,
  },
  dayCellNotDue: { opacity: 0.4 },
  dayName: { fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  checkDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkPartial: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderColor: colors.amber,
  },
  checkEmpty: {
    backgroundColor: "transparent",
    borderColor: colors.border,
  },
  checkNA: {
    backgroundColor: "transparent",
    borderColor: "rgba(51, 65, 85, 0.3)",
  },
  checkText: { fontSize: 12, fontWeight: "700", color: colors.white },
  timingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  timingChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timingChipActive: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    borderColor: colors.teal,
  },
  timingChipText: { fontSize: 11, color: colors.textMuted },
  timingChipTextActive: { color: colors.teal },
  addMedButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addMedButtonText: { color: colors.teal, fontSize: 14, fontWeight: "500" },
  addMedForm: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  freqRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  freqChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  freqChipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  freqChipText: { fontSize: 12, color: colors.textMuted },
  freqChipTextActive: { color: colors.white },
  addMedActions: { flexDirection: "row", gap: 8 },
  addButton: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: colors.textSecondary, fontSize: 14 },
  subTabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 4,
    backgroundColor: colors.bg,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(30,41,59,0.3)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  subTabItemActive: {
    backgroundColor: "rgba(20,184,166,0.15)",
    borderColor: colors.teal,
  },
  subTabText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
  },
  subTabTextActive: {
    color: colors.teal,
    fontWeight: "700",
  },
});
