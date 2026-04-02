import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { colors } from "../lib/theme";
import { loadProfile, saveProfile } from "../lib/storage";
import { findVaccineInfo } from "../data/vaccineData";
import type { Vaccine } from "../lib/types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COMMON_VACCINES = [
  "COVID-19",
  "Flu (Influenza)",
  "Tdap",
  "Shingles",
  "Pneumonia",
  "Hepatitis A",
  "Hepatitis B",
  "HPV",
  "MMR",
  "Meningococcal",
  "Varicella",
  "Polio",
];

export default function VaccinesScreen() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [expandedVax, setExpandedVax] = useState<string | null>(null);

  useEffect(() => {
    loadProfile().then((p) => {
      if (p?.vaccines) setVaccines(p.vaccines);
    });
  }, []);

  const persistVaccines = (updated: Vaccine[]) => {
    setVaccines(updated);
    loadProfile().then((p) => {
      const profile = p || {};
      profile.vaccines = updated;
      saveProfile(profile);
    });
  };

  const addVaccine = () => {
    if (!newName.trim()) return;
    persistVaccines([...vaccines, { name: newName.trim(), date: newDate || "Unknown" }]);
    setNewName("");
    setNewDate("");
    setAdding(false);
  };

  const removeVaccine = (index: number) => {
    Alert.alert("Remove vaccine", `Remove ${vaccines[index].name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => persistVaccines(vaccines.filter((_, i) => i !== index)),
      },
    ]);
  };

  const quickAdd = (name: string) => {
    const exists = vaccines.some(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;
    setNewName(name);
    setAdding(true);
  };

  const toggleExpand = (vaxName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedVax(expandedVax === vaxName ? null : vaxName);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Vaccine Records</Text>
        <Text style={styles.subtitle}>Track your vaccination history</Text>
      </View>

      {/* Quick-add word bank */}
      <View style={styles.wordBank}>
        <Text style={styles.sectionTitle}>Common Vaccines</Text>
        <Text style={styles.hint}>Tap to add a vaccine record</Text>
        <View style={styles.chipRow}>
          {COMMON_VACCINES.map((vax) => {
            const isAdded = vaccines.some(
              (v) => v.name.toLowerCase() === vax.toLowerCase()
            );
            return (
              <TouchableOpacity
                key={vax}
                style={[styles.chip, isAdded && styles.chipAdded]}
                onPress={() => quickAdd(vax)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isAdded && styles.chipTextAdded,
                  ]}
                >
                  {isAdded ? `${vax} \u2713` : vax}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Add form */}
      {adding && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Vaccine name"
            placeholderTextColor={colors.textMuted}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (e.g. 2024-03-15)"
            placeholderTextColor={colors.textMuted}
            value={newDate}
            onChangeText={setNewDate}
          />
          <View style={styles.addActions}>
            <TouchableOpacity style={styles.saveButton} onPress={addVaccine}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setAdding(false);
                setNewName("");
                setNewDate("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Vaccine list */}
      {vaccines.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Your Vaccines</Text>
          {vaccines.map((vax, i) => {
            const info = findVaccineInfo(vax.name);
            const isExpanded = expandedVax === vax.name;

            return (
              <View key={`${vax.name}-${i}`} style={styles.vaxCard}>
                <TouchableOpacity
                  style={styles.vaxHeader}
                  onPress={() => info && toggleExpand(vax.name)}
                  activeOpacity={info ? 0.6 : 1}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.vaxName}>{vax.name}</Text>
                      {info && (
                        <View style={styles.infoBadge}>
                          <Text style={styles.infoBadgeText}>i</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.vaxDate}>{vax.date}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeVaccine(i)} style={{ padding: 4 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 16 }}>x</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Info dropdown */}
                {isExpanded && info && (
                  <View style={styles.infoDropdown}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>What it is</Text>
                      <Text style={styles.infoText}>{info.synopsis}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Protects against</Text>
                      <Text style={styles.infoText}>{info.protectsAgainst}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Why it matters</Text>
                      <Text style={styles.infoText}>{info.value}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        !adding && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vaccines recorded yet</Text>
          </View>
        )
      )}

      {/* Add button */}
      {!adding && (
        <TouchableOpacity
          style={styles.addVaxButton}
          onPress={() => setAdding(true)}
        >
          <Text style={styles.addVaxButtonText}>+ Add Custom Vaccine</Text>
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
  wordBank: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.teal,
    marginBottom: 4,
  },
  hint: { fontSize: 10, color: colors.textDim, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.bgInput,
  },
  chipAdded: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    borderColor: "rgba(20, 184, 166, 0.3)",
  },
  chipText: { fontSize: 11, color: colors.textSecondary },
  chipTextAdded: { color: colors.teal },
  addForm: {
    marginHorizontal: 16,
    marginTop: 12,
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
  addActions: { flexDirection: "row", gap: 8 },
  saveButton: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButtonText: { color: colors.white, fontWeight: "600", fontSize: 14 },
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
  listSection: { marginHorizontal: 16, marginTop: 16 },
  vaxCard: {
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  vaxHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  vaxName: { fontSize: 14, fontWeight: "500", color: colors.text },
  vaxDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
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
    marginTop: 10,
    paddingTop: 10,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: { fontSize: 14, color: colors.textMuted },
  addVaxButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addVaxButtonText: { color: colors.teal, fontSize: 14, fontWeight: "500" },
});
