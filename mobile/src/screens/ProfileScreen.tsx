import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { colors } from "../lib/theme";
import { loadProfile, saveProfile } from "../lib/storage";
import { findAllergyInfo } from "../data/allergyData";
import { findMedicationInfo } from "../data/medicationData";
import { useAuth } from "../context/AuthContext";
import type { HealthProfile } from "../lib/types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CONDITION_SUGGESTIONS = [
  "Hypertension", "Type 2 Diabetes", "Prediabetes", "Asthma", "GERD",
  "Hypothyroidism", "High Cholesterol", "Anxiety", "Depression", "Arthritis",
  "Sleep Apnea", "Migraines", "COPD", "Anemia", "Obesity",
];

const ALLERGY_SUGGESTIONS = [
  "Penicillin", "Sulfa drugs", "Aspirin", "Ibuprofen", "Latex", "Shellfish",
  "Peanuts", "Tree nuts", "Eggs", "Dairy", "Gluten", "Soy", "Bee stings",
  "Pollen", "Dust mites",
];

const LIFESTYLE_SUGGESTIONS = [
  "Exercises 3x/week", "Sedentary job", "Vegetarian", "Vegan", "Keto diet",
  "Social drinker", "No alcohol", "Sleeps 6 hours", "Sleeps 8 hours",
  "High stress", "Meditation/yoga",
];

const GOAL_SUGGESTIONS = [
  "Lose weight", "Build muscle", "Lower blood sugar", "Lower cholesterol",
  "Improve sleep", "Reduce stress", "Eat healthier", "Manage chronic pain",
];

const MED_SUGGESTIONS = [
  "Lisinopril", "Metformin", "Atorvastatin", "Amlodipine", "Omeprazole",
  "Losartan", "Levothyroxine", "Albuterol", "Gabapentin", "Sertraline",
];

const FAMILY_SUGGESTIONS = [
  "Heart attack", "Stroke", "Type 2 Diabetes", "Breast cancer", "Colon cancer",
  "Alzheimer's", "High blood pressure", "High cholesterol",
];

function WordBank({
  title,
  suggestions,
  items,
  onUpdate,
}: {
  title: string;
  suggestions: string[];
  items: string[];
  onUpdate: (items: string[]) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      onUpdate([...items, trimmed]);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipRow}>
        {suggestions.map((s) => {
          const isAdded = items.some(
            (i) => i.toLowerCase() === s.toLowerCase()
          );
          return (
            <TouchableOpacity
              key={s}
              style={[styles.chip, isAdded && styles.chipActive]}
              onPress={() => addItem(s)}
            >
              <Text style={[styles.chipText, isAdded && styles.chipTextActive]}>
                {isAdded ? `${s} +` : s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {items.length > 0 && (
        <View style={[styles.chipRow, { marginTop: 8 }]}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={`${item}-${i}`}
              style={styles.selectedChip}
              onPress={() => onUpdate(items.filter((_, j) => j !== i))}
            >
              <Text style={styles.selectedChipText}>{item} x</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showInput ? (
        <View style={styles.inlineInput}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={`Add ${title.toLowerCase()}`}
            placeholderTextColor={colors.textMuted}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={() => {
              if (newItem.trim()) addItem(newItem);
              setNewItem("");
            }}
          />
          <TouchableOpacity
            style={styles.miniButton}
            onPress={() => {
              if (newItem.trim()) addItem(newItem);
              setNewItem("");
              setShowInput(false);
            }}
          >
            <Text style={styles.miniButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setShowInput(true)} style={{ marginTop: 6 }}>
          <Text style={styles.addLink}>+ Add custom</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AllergyBank({
  items,
  onUpdate,
}: {
  items: string[];
  onUpdate: (items: string[]) => void;
}) {
  const [newItem, setNewItem] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [expandedAllergy, setExpandedAllergy] = useState<string | null>(null);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      onUpdate([...items, trimmed]);
    }
  };

  const toggleExpand = (name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAllergy(expandedAllergy === name ? null : name);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Allergies</Text>
      <View style={styles.chipRow}>
        {ALLERGY_SUGGESTIONS.map((s) => {
          const isAdded = items.some(
            (i) => i.toLowerCase() === s.toLowerCase()
          );
          return (
            <TouchableOpacity
              key={s}
              style={[styles.chip, isAdded && styles.chipActive]}
              onPress={() => addItem(s)}
            >
              <Text style={[styles.chipText, isAdded && styles.chipTextActive]}>
                {isAdded ? `${s} +` : s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {items.length > 0 && (
        <View style={{ marginTop: 10, gap: 6 }}>
          {items.map((item, i) => {
            const info = findAllergyInfo(item);
            const isExpanded = expandedAllergy === item;
            return (
              <View key={`${item}-${i}`} style={styles.allergyCard}>
                <TouchableOpacity
                  style={styles.allergyHeader}
                  onPress={() => info && toggleExpand(item)}
                  activeOpacity={info ? 0.6 : 1}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text style={styles.allergyName}>{item}</Text>
                    {info && (
                      <View style={styles.infoBadge}>
                        <Text style={styles.infoBadgeText}>i</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onUpdate(items.filter((_, j) => j !== i))}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>x</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                {isExpanded && info && (
                  <View style={styles.infoDropdown}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>What it is</Text>
                      <Text style={styles.infoText}>{info.synopsis}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Affects</Text>
                      <Text style={styles.infoText}>{info.affects}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Avoidance</Text>
                      <Text style={styles.infoText}>{info.avoidance}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      {showInput ? (
        <View style={styles.inlineInput}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Add allergy"
            placeholderTextColor={colors.textMuted}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={() => {
              if (newItem.trim()) addItem(newItem);
              setNewItem("");
            }}
          />
          <TouchableOpacity
            style={styles.miniButton}
            onPress={() => {
              if (newItem.trim()) addItem(newItem);
              setNewItem("");
              setShowInput(false);
            }}
          >
            <Text style={styles.miniButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setShowInput(true)} style={{ marginTop: 6 }}>
          <Text style={styles.addLink}>+ Add custom</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MedBank({
  meds,
  onUpdate,
}: {
  meds: { name: string; dosage: string }[];
  onUpdate: (meds: { name: string; dosage: string }[]) => void;
}) {
  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMed(expandedMed === name ? null : name);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medications</Text>
      <View style={styles.chipRow}>
        {MED_SUGGESTIONS.map((med) => {
          const isAdded = meds.some(
            (m) => m.name.toLowerCase() === med.toLowerCase()
          );
          return (
            <TouchableOpacity
              key={med}
              style={[styles.chip, isAdded && styles.chipActive]}
              onPress={() => {
                if (!isAdded) onUpdate([...meds, { name: med, dosage: "daily" }]);
              }}
            >
              <Text style={[styles.chipText, isAdded && styles.chipTextActive]}>
                {isAdded ? `${med} +` : med}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {meds.map((med, i) => {
        const info = findMedicationInfo(med.name);
        const isExpanded = expandedMed === med.name;
        return (
          <View key={i} style={[styles.allergyCard, { marginTop: i === 0 ? 10 : 6 }]}>
            <View style={styles.allergyHeader}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => info && toggleExpand(med.name)}
                activeOpacity={info ? 0.6 : 1}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.allergyName}>{med.name}</Text>
                  {info && (
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>i</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { width: 100, paddingVertical: 6, fontSize: 12 }]}
                value={med.dosage}
                onChangeText={(t) => {
                  const updated = [...meds];
                  updated[i] = { ...med, dosage: t };
                  onUpdate(updated);
                }}
                placeholder="Dosage"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                onPress={() => onUpdate(meds.filter((_, j) => j !== i))}
                style={{ padding: 8 }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>x</Text>
              </TouchableOpacity>
            </View>
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
          </View>
        );
      })}
      <TouchableOpacity
        onPress={() => onUpdate([...meds, { name: "", dosage: "daily" }])}
        style={{ marginTop: 6 }}
      >
        <Text style={styles.addLink}>+ Add medication</Text>
      </TouchableOpacity>
    </View>
  );
}

function calculateBmi(heightCm: number, weightKg: number) {
  if (heightCm <= 0) return 0;
  return weightKg / (heightCm / 100) ** 2;
}

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: colors.blue };
  if (bmi < 25) return { label: "Normal", color: colors.green };
  if (bmi < 30) return { label: "Overweight", color: colors.orange };
  return { label: "Obese", color: colors.red };
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [lbs, setLbs] = useState("160");
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [lifestyleNotes, setLifestyleNotes] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [meds, setMeds] = useState<{ name: string; dosage: string }[]>([]);

  useEffect(() => {
    loadProfile().then((p) => {
      if (!p) return;
      setProfile(p);
      setName(p.name || "");
      setAge(p.age?.toString() || "");
      setSex(p.sex || "male");
      const totalInches = (p.height_cm || 0) / 2.54;
      setFeet(Math.floor(totalInches / 12).toString());
      setInches(Math.round(totalInches % 12).toString());
      setLbs(Math.round((p.weight_kg || 0) * 2.205).toString());
      setConditions(p.conditions || []);
      setAllergies(p.allergies || []);
      setFamilyHistory(p.family_history || []);
      setLifestyleNotes(p.lifestyle_notes || []);
      setHealthGoals(p.health_goals || []);
      setMeds(p.medications || []);
    });
  }, []);

  const heightCm = ((parseInt(feet) || 0) * 12 + (parseInt(inches) || 0)) * 2.54;
  const weightKg = (parseInt(lbs) || 0) / 2.205;
  const bmi = calculateBmi(heightCm, weightKg);
  const bmiInfo = getBmiCategory(bmi);

  const handleSave = () => {
    const updated: HealthProfile = {
      user_id: profile?.user_id || "custom",
      name: name || "User",
      age: parseInt(age) || 0,
      sex,
      height_cm: Math.round(heightCm),
      weight_kg: Math.round(weightKg * 10) / 10,
      conditions,
      medications: meds,
      allergies,
      family_history: familyHistory,
      lifestyle_notes: lifestyleNotes,
      lab_results: profile?.lab_results || [],
      vaccines: profile?.vaccines || [],
      health_goals: healthGoals,
    };
    saveProfile(updated);
    setProfile(updated);
    Alert.alert("Saved", "Your profile has been updated.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Profile</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Sign out", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: signOut },
            ]);
          }}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* BMI display */}
      <View style={styles.bmiCard}>
        <Text style={styles.bmiLabel}>BMI</Text>
        <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>
          {bmi > 0 ? bmi.toFixed(1) : "--"}
        </Text>
        <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>
          {bmi > 0 ? bmiInfo.label : ""}
        </Text>
      </View>

      {/* Personal info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Age"
            placeholderTextColor={colors.textMuted}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
          <View style={styles.sexRow}>
            {["male", "female", "other"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.sexButton, sex === s && styles.sexButtonActive]}
                onPress={() => setSex(s)}
              >
                <Text
                  style={[
                    styles.sexButtonText,
                    sex === s && styles.sexButtonTextActive,
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ft</Text>
            <TextInput
              style={styles.input}
              value={feet}
              onChangeText={setFeet}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>in</Text>
            <TextInput
              style={styles.input}
              value={inches}
              onChangeText={setInches}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>lbs</Text>
            <TextInput
              style={styles.input}
              value={lbs}
              onChangeText={setLbs}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      <WordBank
        title="Conditions"
        suggestions={CONDITION_SUGGESTIONS}
        items={conditions}
        onUpdate={setConditions}
      />

      <AllergyBank items={allergies} onUpdate={setAllergies} />

      <WordBank
        title="Family History"
        suggestions={FAMILY_SUGGESTIONS}
        items={familyHistory}
        onUpdate={setFamilyHistory}
      />

      <MedBank meds={meds} onUpdate={setMeds} />

      <WordBank
        title="Lifestyle Notes"
        suggestions={LIFESTYLE_SUGGESTIONS}
        items={lifestyleNotes}
        onUpdate={setLifestyleNotes}
      />

      <WordBank
        title="Health Goals"
        suggestions={GOAL_SUGGESTIONS}
        items={healthGoals}
        onUpdate={setHealthGoals}
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  signOutText: { fontSize: 13, color: colors.textMuted },
  bmiCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  bmiLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bmiValue: { fontSize: 28, fontWeight: "800" },
  bmiCategory: { fontSize: 14, fontWeight: "500" },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.teal,
    marginBottom: 4,
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
  row: { flexDirection: "row", gap: 8 },
  sexRow: { flexDirection: "row", gap: 4, flex: 2 },
  sexButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.bgInput,
  },
  sexButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  sexButtonText: { fontSize: 13, color: colors.textSecondary },
  sexButtonTextActive: { color: colors.white, fontWeight: "600" },
  fieldLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.bgInput,
  },
  chipActive: {
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    borderColor: "rgba(20, 184, 166, 0.3)",
  },
  chipText: { fontSize: 11, color: colors.textSecondary },
  chipTextActive: { color: colors.teal },
  selectedChip: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedChipText: { fontSize: 11, color: colors.textSecondary },
  allergyCard: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.3)",
    borderRadius: 10,
    padding: 10,
  },
  allergyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  allergyName: { fontSize: 13, fontWeight: "500", color: colors.text },
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
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.3)",
    gap: 6,
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
  addLink: { fontSize: 13, color: colors.teal, fontWeight: "500" },
  inlineInput: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  miniButton: {
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  miniButtonText: { color: colors.white, fontWeight: "600", fontSize: 13 },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
