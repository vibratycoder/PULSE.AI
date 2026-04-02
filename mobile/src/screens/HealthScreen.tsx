import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import { colors } from "../lib/theme";
import {
  checkAvailability,
  requestPermissions,
  fetchAllHealthData,
  getCachedHealthData,
} from "../lib/healthkit";
import type { HealthData, WorkoutSample } from "../lib/healthkitTypes";
import { EMPTY_HEALTH_DATA } from "../lib/healthkitTypes";

// ── Metric Row ──────────────────────────────────────────────────────────────
function MetricRow({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number | null;
  unit: string;
  accent?: string;
}) {
  return (
    <View style={m.row}>
      <View style={m.rowLeft}>
        <Text style={m.icon}>{icon}</Text>
        <Text style={m.label}>{label}</Text>
      </View>
      <View style={m.rowRight}>
        <Text style={[m.value, accent ? { color: accent } : null]}>
          {value != null ? value : "--"}
        </Text>
        <Text style={m.unit}>{unit}</Text>
      </View>
    </View>
  );
}
const m = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowRight: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  icon: { fontSize: 16, width: 24, textAlign: "center" },
  label: { fontSize: 13, color: colors.textSecondary },
  value: { fontSize: 18, fontWeight: "700", color: colors.white, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  unit: { fontSize: 11, color: colors.textMuted },
});

// ── Card Wrapper ────────────────────────────────────────────────────────────
function Card({
  title,
  accentColor,
  children,
}: {
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[s.card, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
      <Text style={[s.cardTitle, { color: accentColor }]}>{title}</Text>
      {children}
    </View>
  );
}

// ── Workout Row ─────────────────────────────────────────────────────────────
const WORKOUT_ICONS: Record<string, string> = {
  Running: "🏃", Walking: "🚶", Cycling: "🚴", Swimming: "🏊",
  Yoga: "🧘", "Strength Training": "🏋️", Rowing: "🚣", HIIT: "🔥",
  Hiking: "🥾", Elliptical: "🔄", Kickboxing: "🥊", "Stair Climbing": "🪜",
  "Core Training": "💪", Pilates: "🤸", Dance: "💃", Stretching: "🧎",
};

function WorkoutRow({ w }: { w: WorkoutSample }) {
  const icon = WORKOUT_ICONS[w.workoutType] || "🏅";
  const d = new Date(w.startDate);
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
  return (
    <View style={s.workoutRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <View>
          <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>{w.workoutType}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>{dateStr} · {w.duration} min</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        {w.totalEnergyBurned > 0 && (
          <Text style={{ fontSize: 12, color: colors.orange, fontWeight: "600" }}>
            {w.totalEnergyBurned} kcal
          </Text>
        )}
        {w.totalDistance > 0 && (
          <Text style={{ fontSize: 10, color: colors.textMuted }}>
            {(w.totalDistance / 1000).toFixed(1)} km
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Sleep Bar ───────────────────────────────────────────────────────────────
function SleepBreakdownBar({ data }: { data: HealthData["sleep"] }) {
  if (data.samples.length === 0) return null;
  const typeColors: Record<string, string> = {
    deep: "#6d28d9", core: "#8b5cf6", rem: "#06b6d4", awake: "#f59e0b", asleep: "#8b5cf6", inBed: "rgba(51,65,85,0.4)",
  };

  // Group by type and calculate total ms
  const totals: Record<string, number> = {};
  let grandTotal = 0;
  for (const s of data.samples) {
    const ms = new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
    totals[s.value] = (totals[s.value] || 0) + ms;
    grandTotal += ms;
  }

  if (grandTotal === 0) return null;

  const types = Object.entries(totals).filter(([k]) => k !== "inBed").sort((a, b) => b[1] - a[1]);

  return (
    <View style={{ marginTop: 8 }}>
      {/* Bar */}
      <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden" }}>
        {types.map(([type, ms]) => (
          <View
            key={type}
            style={{
              flex: ms / grandTotal,
              backgroundColor: typeColors[type] || colors.textDim,
            }}
          />
        ))}
      </View>
      {/* Legend */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
        {types.map(([type, ms]) => (
          <View key={type} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: typeColors[type] || colors.textDim }} />
            <Text style={{ fontSize: 9, color: colors.textMuted, textTransform: "capitalize" }}>
              {type} ({Math.round(ms / 60000)} min)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function HealthScreen() {
  const [data, setData] = useState<HealthData>(EMPTY_HEALTH_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Load cached first for instant display
      if (!isRefresh) {
        const cached = await getCachedHealthData();
        if (cached) setData(cached);
      }

      const isAvail = await checkAvailability();
      setAvailable(isAvail);

      if (isAvail) {
        const fresh = await fetchAllHealthData();
        setData(fresh);
      }
    } catch { /* ignore */ }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAuthorize = async () => {
    const ok = await requestPermissions();
    if (ok) loadData(true);
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const sleepHours = data.sleep.totalSleepMinutes > 0
    ? `${Math.floor(data.sleep.totalSleepMinutes / 60)}h ${data.sleep.totalSleepMinutes % 60}m`
    : null;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          tintColor={colors.teal}
          colors={[colors.teal]}
        />
      }
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Health</Text>
        <Text style={s.subtitle}>Apple Watch & HealthKit data</Text>
      </View>

      {/* Not available banner */}
      {available === false && (
        <View style={s.banner}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>⌚</Text>
          <Text style={s.bannerTitle}>HealthKit Not Available</Text>
          <Text style={s.bannerText}>
            {Platform.OS !== "ios"
              ? "Apple HealthKit is only available on iOS devices with the Apple Health app."
              : "HealthKit is not available on this device. Make sure you have the Health app installed."}
          </Text>
        </View>
      )}

      {/* Authorize banner */}
      {available === true && !data.isAuthorized && !loading && (
        <View style={s.banner}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🔐</Text>
          <Text style={s.bannerTitle}>Connect Apple Health</Text>
          <Text style={s.bannerText}>
            Allow PulseAI to read your health data to display heart rate, activity, sleep, and workout metrics.
          </Text>
          <TouchableOpacity style={s.authBtn} onPress={handleAuthorize}>
            <Text style={s.authBtnText}>Authorize HealthKit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && available === null && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>⏳</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Loading health data...</Text>
        </View>
      )}

      {/* ── Heart Card ─────────────────────────────────────────── */}
      {(data.heart.heartRate != null || data.heart.restingHeartRate != null || available !== false) && (
        <Card title="Heart" accentColor={colors.red}>
          <MetricRow icon="❤️" label="Heart Rate" value={data.heart.heartRate != null ? Math.round(data.heart.heartRate) : null} unit="bpm" accent={colors.red} />
          <MetricRow icon="💓" label="Resting HR" value={data.heart.restingHeartRate != null ? Math.round(data.heart.restingHeartRate) : null} unit="bpm" accent={colors.rose} />
          <MetricRow icon="📊" label="HRV (SDNN)" value={data.heart.heartRateVariability != null ? Math.round(data.heart.heartRateVariability) : null} unit="ms" accent={colors.purple} />
          {data.heart.lastUpdated && (
            <Text style={s.lastUpdated}>Last reading: {formatTime(data.heart.lastUpdated)}</Text>
          )}
        </Card>
      )}

      {/* ── Activity Card ──────────────────────────────────────── */}
      <Card title="Activity" accentColor={colors.green}>
        <MetricRow icon="👟" label="Steps" value={data.activity.steps > 0 ? data.activity.steps.toLocaleString() : null} unit="" accent={colors.green} />
        <MetricRow icon="📏" label="Distance" value={data.activity.distance > 0 ? (data.activity.distance / 1000).toFixed(1) : null} unit="km" accent={colors.teal} />
        <MetricRow icon="🔥" label="Active Calories" value={data.activity.activeCalories > 0 ? data.activity.activeCalories : null} unit="kcal" accent={colors.orange} />
        <MetricRow icon="⚡" label="Basal Calories" value={data.activity.basalCalories > 0 ? data.activity.basalCalories : null} unit="kcal" accent={colors.amber} />
        <MetricRow icon="🏃" label="Exercise" value={data.activity.exerciseMinutes > 0 ? data.activity.exerciseMinutes : null} unit="min" accent={colors.teal} />
        <MetricRow icon="🧍" label="Stand Hours" value={data.activity.standHours > 0 ? data.activity.standHours : null} unit="hrs" accent={colors.blue} />
      </Card>

      {/* ── Body Card ──────────────────────────────────────────── */}
      <Card title="Body" accentColor={colors.blue}>
        <MetricRow icon="⚖️" label="Weight" value={data.body.weight != null ? Math.round(data.body.weight * 2.205) : null} unit="lbs" accent={colors.blue} />
        <MetricRow icon="🫁" label="SpO2" value={data.body.spO2} unit="%" accent={colors.cyan} />
        <MetricRow icon="🌬️" label="Respiratory Rate" value={data.body.respiratoryRate != null ? Math.round(data.body.respiratoryRate) : null} unit="br/min" accent={colors.teal} />
      </Card>

      {/* ── Sleep Card ─────────────────────────────────────────── */}
      <Card title="Sleep" accentColor={colors.purple}>
        <MetricRow icon="😴" label="Last Night" value={sleepHours} unit="" accent={colors.purple} />
        <SleepBreakdownBar data={data.sleep} />
        {data.sleep.samples.length === 0 && data.sleep.totalSleepMinutes === 0 && (
          <Text style={{ fontSize: 12, color: colors.textMuted, paddingVertical: 4 }}>
            No sleep data recorded. Wear your Apple Watch to bed to track sleep.
          </Text>
        )}
      </Card>

      {/* ── Workouts Card ──────────────────────────────────────── */}
      <Card title="Recent Workouts" accentColor={colors.orange}>
        {data.workouts.length === 0 ? (
          <Text style={{ fontSize: 12, color: colors.textMuted, paddingVertical: 4 }}>
            No workouts recorded in the last 30 days.
          </Text>
        ) : (
          data.workouts.map((w, i) => <WorkoutRow key={`${w.startDate}-${i}`} w={w} />)
        )}
      </Card>

      {/* Last refresh */}
      {data.lastRefresh && (
        <Text style={s.refreshText}>
          Last synced: {formatTime(data.lastRefresh)}
        </Text>
      )}
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(30,41,59,0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(30,41,59,0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  bannerTitle: { fontSize: 16, fontWeight: "600", color: colors.white, marginBottom: 6 },
  bannerText: { fontSize: 12, color: colors.textMuted, textAlign: "center", lineHeight: 18, marginBottom: 12 },
  authBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  authBtnText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  lastUpdated: { fontSize: 9, color: colors.textDim, marginTop: 4 },
  refreshText: { fontSize: 10, color: colors.textDim, textAlign: "center", marginTop: 16 },
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51,65,85,0.2)",
  },
});
