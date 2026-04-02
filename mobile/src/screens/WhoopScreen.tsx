import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { colors } from "../lib/theme";
import {
  useWhoopAuth,
  exchangeCodeForTokens,
  fetchAllWhoopData,
  loadCachedData,
  clearTokens,
  isConnected,
  msToHours,
  formatRecoveryColor,
  formatStrainColor,
  getSportName,
  type WHOOPData,
} from "../lib/whoop";

export default function WhoopScreen() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<WHOOPData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { request, response, promptAsync } = useWhoopAuth();

  // Check connection status & load cached data on mount
  useEffect(() => {
    (async () => {
      const conn = await isConnected();
      setConnected(conn);
      if (conn) {
        const cached = await loadCachedData();
        if (cached) setData(cached);
        // Fetch fresh data
        try {
          const fresh = await fetchAllWhoopData();
          setData(fresh);
        } catch (err: any) {
          if (err.message?.includes("reconnect")) {
            setConnected(false);
          } else {
            setError(err.message);
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    if (response?.type === "success" && response.params?.code) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          await exchangeCodeForTokens(response.params.code);
          setConnected(true);
          const fresh = await fetchAllWhoopData();
          setData(fresh);
        } catch (err: any) {
          setError(err.message);
        }
        setLoading(false);
      })();
    }
  }, [response]);

  const onRefresh = useCallback(async () => {
    if (!connected) return;
    setRefreshing(true);
    setError(null);
    try {
      const fresh = await fetchAllWhoopData();
      setData(fresh);
    } catch (err: any) {
      if (err.message?.includes("reconnect")) {
        setConnected(false);
      } else {
        setError(err.message);
      }
    }
    setRefreshing(false);
  }, [connected]);

  const disconnect = () => {
    Alert.alert("Disconnect WHOOP", "Remove your WHOOP connection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          await clearTokens();
          setConnected(false);
          setData(null);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13 }}>Connecting to WHOOP...</Text>
      </View>
    );
  }

  // ─── Not Connected ─────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <ScrollView style={st.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={st.header}>
          <Text style={st.title}>WHOOP</Text>
          <Text style={st.subtitle}>Connect your WHOOP for recovery, strain, and sleep data</Text>
        </View>

        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <View style={st.whoopLogo}>
            <Text style={{ fontSize: 36 }}>⌚</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.white, marginBottom: 8 }}>Connect with WHOOP</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: "center", paddingHorizontal: 32, marginBottom: 24, lineHeight: 20 }}>
            Link your WHOOP account to sync recovery scores, HRV, sleep stages, strain data, and workout history directly into PulseAI.
          </Text>

          <TouchableOpacity
            style={st.connectBtn}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Text style={st.connectBtnText}>Connect WHOOP Account</Text>
          </TouchableOpacity>

          {error && (
            <Text style={{ color: colors.red, fontSize: 12, marginTop: 12, textAlign: "center", paddingHorizontal: 20 }}>{error}</Text>
          )}

          {/* Features list */}
          <View style={st.featureList}>
            {[
              { icon: "💚", title: "Recovery Score", desc: "Daily readiness based on HRV, RHR, and sleep" },
              { icon: "😴", title: "Sleep Analysis", desc: "Sleep stages, efficiency, and performance" },
              { icon: "🔥", title: "Strain Tracking", desc: "Daily cardiovascular load and workout strain" },
              { icon: "💓", title: "Heart Rate Data", desc: "Resting HR, HRV, and SpO2 metrics" },
              { icon: "🏋️", title: "Workout History", desc: "Activity data with HR zones and calories" },
            ].map((f, i) => (
              <View key={i} style={st.featureItem}>
                <Text style={{ fontSize: 20 }}>{f.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{f.title}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* BLE note */}
          <View style={st.noteCard}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.amber, marginBottom: 4 }}>Live Heart Rate (BLE)</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, lineHeight: 16 }}>
              Live heart rate streaming via Bluetooth requires a development build. Enable "Broadcast Heart Rate" in your WHOOP app under Settings → Device.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ─── Connected — Show Data ─────────────────────────────────────────────────
  const recovery = data?.recovery;
  const sleep = data?.sleep;
  const workouts = data?.workouts || [];
  const cycles = data?.cycles || [];
  const profile = data?.profile;
  const latestCycle = cycles[0];

  const recoveryScore = recovery?.score?.recovery_score ?? 0;
  const hrv = recovery?.score?.hrv_rmssd_milli ?? 0;
  const rhr = recovery?.score?.resting_heart_rate ?? 0;
  const spo2 = recovery?.score?.spo2_percentage;

  const sleepPerf = sleep?.score?.sleep_performance_percentage ?? 0;
  const sleepEff = sleep?.score?.sleep_efficiency_percentage ?? 0;
  const stages = sleep?.score?.stage_summary;
  const totalSleep = stages
    ? stages.total_light_sleep_time_milli + stages.total_slow_wave_sleep_time_milli + stages.total_rem_sleep_time_milli
    : 0;

  const strain = latestCycle?.score?.strain ?? 0;
  const dayCals = latestCycle?.score?.kilojoule ? Math.round(latestCycle.score.kilojoule * 0.239006) : 0;

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
    >
      <View style={st.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={st.title}>WHOOP</Text>
            <Text style={st.subtitle}>
              {profile ? `${profile.first_name} ${profile.last_name}` : "Connected"}
            </Text>
          </View>
          <TouchableOpacity onPress={disconnect} style={st.disconnectBtn}>
            <Text style={st.disconnectBtnText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={{ marginHorizontal: 16, marginTop: 8, padding: 10, backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}>
          <Text style={{ fontSize: 12, color: colors.red }}>{error}</Text>
        </View>
      )}

      {/* Recovery Card */}
      <View style={[st.card, { borderColor: formatRecoveryColor(recoveryScore) + "40" }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={st.cardTitle}>Recovery</Text>
          {recovery?.score?.user_calibrating && (
            <View style={{ backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: "700", color: colors.amber }}>CALIBRATING</Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 48, fontWeight: "800", color: formatRecoveryColor(recoveryScore) }}>{recoveryScore}%</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {recoveryScore >= 67 ? "Green — Ready to perform" : recoveryScore >= 34 ? "Yellow — Moderate readiness" : "Red — Recovery needed"}
          </Text>
        </View>
        <View style={st.metricsRow}>
          <MetricBox label="HRV" value={`${Math.round(hrv)}`} unit="ms" color="#a78bfa" />
          <MetricBox label="RHR" value={`${rhr}`} unit="bpm" color="#60a5fa" />
          {spo2 !== undefined && spo2 > 0 && (
            <MetricBox label="SpO2" value={`${Math.round(spo2)}`} unit="%" color="#34d399" />
          )}
        </View>
      </View>

      {/* Sleep Card */}
      <View style={st.card}>
        <Text style={st.cardTitle}>Sleep</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 14 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.blue }}>{sleepPerf}%</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>Performance</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.purple }}>{sleepEff}%</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>Efficiency</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.teal }}>{msToHours(totalSleep)}</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>Total Sleep</Text>
          </View>
        </View>
        {stages && (
          <View>
            <Text style={{ fontSize: 9, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Sleep Stages</Text>
            {/* Stage bar */}
            <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <View style={{ flex: stages.total_light_sleep_time_milli, backgroundColor: "#60a5fa" }} />
              <View style={{ flex: stages.total_slow_wave_sleep_time_milli, backgroundColor: "#818cf8" }} />
              <View style={{ flex: stages.total_rem_sleep_time_milli, backgroundColor: "#c084fc" }} />
              <View style={{ flex: stages.total_awake_time_milli, backgroundColor: "rgba(100,116,139,0.4)" }} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <StageLabel color="#60a5fa" label="Light" time={msToHours(stages.total_light_sleep_time_milli)} />
              <StageLabel color="#818cf8" label="Deep" time={msToHours(stages.total_slow_wave_sleep_time_milli)} />
              <StageLabel color="#c084fc" label="REM" time={msToHours(stages.total_rem_sleep_time_milli)} />
              <StageLabel color="rgba(100,116,139,0.6)" label="Awake" time={msToHours(stages.total_awake_time_milli)} />
            </View>
          </View>
        )}
        {sleep?.score?.respiratory_rate && (
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(51,65,85,0.2)" }}>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>Respiratory Rate: <Text style={{ color: colors.text, fontWeight: "600" }}>{sleep.score.respiratory_rate.toFixed(1)} breaths/min</Text></Text>
          </View>
        )}
      </View>

      {/* Strain Card */}
      <View style={st.card}>
        <Text style={st.cardTitle}>Today's Strain</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 10 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 36, fontWeight: "800", color: formatStrainColor(strain) }}>{strain.toFixed(1)}</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>Day Strain</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 36, fontWeight: "800", color: colors.amber }}>{dayCals}</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>Calories</Text>
          </View>
        </View>
        {/* Strain bar */}
        <View style={{ height: 6, backgroundColor: "rgba(30,41,59,0.8)", borderRadius: 3, overflow: "hidden" }}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: formatStrainColor(strain), width: `${Math.min((strain / 21) * 100, 100)}%` as any }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={{ fontSize: 9, color: colors.textDim }}>0</Text>
          <Text style={{ fontSize: 9, color: colors.textDim }}>Light</Text>
          <Text style={{ fontSize: 9, color: colors.textDim }}>Moderate</Text>
          <Text style={{ fontSize: 9, color: colors.textDim }}>High</Text>
          <Text style={{ fontSize: 9, color: colors.textDim }}>21</Text>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={st.card}>
        <Text style={st.cardTitle}>Recent Workouts</Text>
        {workouts.length === 0 ? (
          <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: 8 }}>No recent workouts.</Text>
        ) : (
          workouts.slice(0, 5).map((w, i) => {
            const duration = new Date(w.end).getTime() - new Date(w.start).getTime();
            const cals = Math.round(w.score.kilojoule * 0.239006);
            const date = new Date(w.start);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <View key={w.id || i} style={st.workoutItem}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{getSportName(w.sport_id)}</Text>
                    <Text style={{ fontSize: 10, color: colors.textDim }}>{dateStr}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                    {msToHours(duration)} · {cals} cal · Avg HR {w.score.average_heart_rate} · Max HR {w.score.max_heart_rate}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: formatStrainColor(w.score.strain) }}>{w.score.strain.toFixed(1)}</Text>
                  <Text style={{ fontSize: 9, color: colors.textMuted }}>strain</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Last updated */}
      {data?.lastUpdated && (
        <Text style={{ textAlign: "center", fontSize: 10, color: colors.textDim, marginTop: 12 }}>
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
    </ScrollView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricBox({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", padding: 10, backgroundColor: color + "15", borderRadius: 10, borderWidth: 1, borderColor: color + "30", marginHorizontal: 3 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color }}>{value}</Text>
      <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>{label} ({unit})</Text>
    </View>
  );
}

function StageLabel({ color, label, time }: { color: string; label: string; time: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ fontSize: 9, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 9, color: colors.textSecondary, fontWeight: "600" }}>{time}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  whoopLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(30,41,59,0.5)",
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  connectBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  connectBtnText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  featureList: {
    marginTop: 32,
    marginHorizontal: 20,
    gap: 16,
    width: "100%",
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,41,59,0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  noteCard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
    borderRadius: 10,
    padding: 12,
    width: "100%",
  },
  disconnectBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  disconnectBtnText: { fontSize: 11, fontWeight: "600", color: colors.red },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(30,41,59,0.3)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: "600", color: colors.white, marginBottom: 8 },
  metricsRow: { flexDirection: "row", gap: 6 },
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51,65,85,0.2)",
  },
});
