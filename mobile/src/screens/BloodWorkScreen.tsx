import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { parseBloodwork } from "../lib/api";
import { loadBloodwork, saveBloodwork } from "../lib/storage";
import { colors, CATEGORY_COLORS } from "../lib/theme";
import type { LabValue } from "../lib/types";

function getStatusColor(flag: string) {
  if (flag === "high") return { color: "#f87171", label: "HIGH" };
  if (flag === "low") return { color: "#fbbf24", label: "LOW" };
  return { color: "#4ade80", label: "Normal" };
}

function RangeBar({ lab }: { lab: LabValue }) {
  const { normal_low, normal_high, value } = lab;
  const range = normal_high - normal_low;
  const padding = range * 1.5;
  const chartMin = Math.max(0, normal_low - padding);
  const chartMax = normal_high + padding;
  const chartRange = chartMax - chartMin;

  const normalLeftPct = ((normal_low - chartMin) / chartRange) * 100;
  const normalWidthPct = ((normal_high - normal_low) / chartRange) * 100;
  const valuePct = Math.max(
    0,
    Math.min(100, ((value - chartMin) / chartRange) * 100)
  );

  const markerColor =
    lab.flag === "high" ? colors.red : lab.flag === "low" ? colors.amber : colors.green;

  return (
    <View style={styles.rangeBarContainer}>
      <View style={styles.rangeTrack} />
      <View
        style={[
          styles.normalZone,
          { left: `${normalLeftPct}%` as any, width: `${normalWidthPct}%` as any },
        ]}
      />
      <View
        style={[
          styles.valueMarker,
          { left: `${valuePct}%` as any, backgroundColor: markerColor },
        ]}
      >
        {lab.flag ? (
          <Text style={styles.markerText}>
            {lab.flag === "high" ? "H" : "L"}
          </Text>
        ) : null}
      </View>
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabelText, { left: `${normalLeftPct}%` as any }]}>
          {normal_low}
        </Text>
        <Text
          style={[
            styles.rangeLabelText,
            { left: `${normalLeftPct + normalWidthPct}%` as any },
          ]}
        >
          {normal_high}
        </Text>
      </View>
    </View>
  );
}

function LabCard({ lab }: { lab: LabValue }) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatusColor(lab.flag);
  const catColors = CATEGORY_COLORS[lab.category] || CATEGORY_COLORS.Other;

  const pctThrough =
    lab.normal_high > lab.normal_low
      ? ((lab.value - lab.normal_low) / (lab.normal_high - lab.normal_low)) * 100
      : 50;
  const midpoint = (lab.normal_low + lab.normal_high) / 2;
  const distFromMid = lab.value - midpoint;

  return (
    <TouchableOpacity
      style={styles.labCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.labCardHeader}>
        <View style={styles.labNameRow}>
          <View style={[styles.categoryDot, { backgroundColor: catColors.bar }]} />
          <Text style={styles.labName}>{lab.name}</Text>
        </View>
        <View style={styles.labValueRow}>
          <Text style={[styles.labValue, { color: status.color }]}>
            {lab.value} {lab.unit}
          </Text>
          <Text style={[styles.labFlag, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <RangeBar lab={lab} />
      {expanded && (
        <View style={styles.labDetails}>
          <Text style={styles.detailText}>
            Category: <Text style={{ color: catColors.text }}>{lab.category}</Text>
          </Text>
          <Text style={styles.detailText}>
            Position in range: {pctThrough.toFixed(0)}%
          </Text>
          <Text style={styles.detailText}>
            Distance from midpoint: {distFromMid > 0 ? "+" : ""}
            {distFromMid.toFixed(1)} {lab.unit}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function BloodWorkScreen() {
  const [labs, setLabs] = useState<LabValue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBloodwork().then((saved) => {
      if (saved && saved.length > 0) setLabs(saved);
    });
  }, []);

  const pickAndParse = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setLoading(true);
      try {
        const data = await parseBloodwork(file.uri, file.name);
        const results = data.results || data;
        if (Array.isArray(results) && results.length > 0) {
          setLabs(results);
          await saveBloodwork(results);
        } else {
          Alert.alert("No results", "Could not parse lab values from this PDF");
        }
      } catch {
        Alert.alert("Parse failed", "Could not analyze the bloodwork PDF");
      } finally {
        setLoading(false);
      }
    } catch {
      // cancelled
    }
  };

  const categories = labs.reduce(
    (acc, lab) => {
      const cat = lab.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(lab);
      return acc;
    },
    {} as Record<string, LabValue[]>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Blood Work</Text>
          <Text style={styles.subtitle}>Upload and analyze lab results</Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadButton, loading && { opacity: 0.6 }]}
          onPress={pickAndParse}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.uploadButtonText}>Upload PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      {labs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No bloodwork uploaded</Text>
          <Text style={styles.emptySubtitle}>
            Upload a lab report PDF to see your results analyzed with range
            visualizations
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.entries(categories)}
          keyExtractor={([cat]) => cat}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item: [category, catLabs] }) => (
            <View style={styles.categorySection}>
              <Text
                style={[
                  styles.categoryTitle,
                  {
                    color:
                      (CATEGORY_COLORS[category] || CATEGORY_COLORS.Other).text,
                  },
                ]}
              >
                {category}
              </Text>
              {catLabs.map((lab, i) => (
                <LabCard key={`${lab.name}-${i}`} lab={lab} />
              ))}
            </View>
          )}
        />
      )}
    </View>
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
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  uploadButton: {
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  uploadButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  categorySection: { paddingHorizontal: 16, marginTop: 16 },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  labCard: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  labCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  labName: { fontSize: 14, fontWeight: "500", color: colors.text },
  labValueRow: { alignItems: "flex-end" },
  labValue: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  labFlag: { fontSize: 10, fontWeight: "700" },
  rangeBarContainer: { height: 28, marginTop: 4, position: "relative" },
  rangeTrack: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 4,
  },
  normalZone: {
    position: "absolute",
    top: 6,
    height: 12,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderRadius: 6,
  },
  valueMarker: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
  },
  markerText: { fontSize: 8, fontWeight: "800", color: colors.white },
  rangeLabels: {
    position: "relative",
    height: 14,
    marginTop: 2,
  },
  rangeLabelText: {
    position: "absolute",
    fontSize: 9,
    color: colors.textDim,
  },
  labDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  detailText: { fontSize: 12, color: colors.textSecondary },
});
