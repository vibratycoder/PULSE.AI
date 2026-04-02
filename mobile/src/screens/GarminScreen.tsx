import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { colors } from "../lib/theme";
import {
  isConnected,
  startGarminAuth,
  fetchAllGarminData,
  loadCachedData,
  clearTokens,
  secondsToHM,
  metersToKm,
  stressColor,
  type GarminData,
} from "../lib/garmin";

// BLE heart rate — react-native-ble-plx requires a dev build.
// We try to import it and gracefully degrade if unavailable.
let BleManager: any = null;
try {
  BleManager = require("react-native-ble-plx").BleManager;
} catch {
  // Not installed or in Expo Go — BLE features disabled
}

const HR_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HR_CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb";

export default function GarminScreen() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<GarminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // BLE state
  const [bleAvailable, setBleAvailable] = useState(false);
  const [bleScanning, setBleScanning] = useState(false);
  const [bleConnected, setBleConnected] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const bleRef = useRef<any>(null);
  const bleDeviceRef = useRef<any>(null);

  // Initialize BLE manager
  useEffect(() => {
    if (!BleManager) return;
    try {
      bleRef.current = new BleManager();
      setBleAvailable(true);
    } catch {
      setBleAvailable(false);
    }
    return () => {
      bleRef.current?.destroy();
    };
  }, []);

  // Check connection & load data on mount
  useEffect(() => {
    (async () => {
      const conn = await isConnected();
      setConnected(conn);
      if (conn) {
        const cached = await loadCachedData();
        if (cached) setData(cached);
        try {
          const fresh = await fetchAllGarminData();
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

  const onRefresh = useCallback(async () => {
    if (!connected) return;
    setRefreshing(true);
    setError(null);
    try {
      const fresh = await fetchAllGarminData();
      setData(fresh);
    } catch (err: any) {
      if (err.message?.includes("reconnect")) setConnected(false);
      else setError(err.message);
    }
    setRefreshing(false);
  }, [connected]);

  const connectGarmin = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      await startGarminAuth();
      setConnected(true);
      const fresh = await fetchAllGarminData();
      setData(fresh);
    } catch (err: any) {
      setError(err.message);
    }
    setAuthLoading(false);
  };

  const disconnect = () => {
    Alert.alert("Disconnect Garmin", "Remove your Garmin connection?", [
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

  // ── BLE Functions ─────────────────────────────────────────────────────────

  const parseHeartRate = (data: string): number => {
    // data is base64 encoded
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    if (bytes.length < 2) return 0;
    const flags = bytes[0];
    return flags & 0x01 ? bytes[1] | (bytes[2] << 8) : bytes[1];
  };

  const startBleScan = () => {
    if (!bleRef.current) return;
    setBleScanning(true);
    setError(null);

    bleRef.current.startDeviceScan(
      [HR_SERVICE_UUID],
      null,
      (err: any, device: any) => {
        if (err) {
          setBleScanning(false);
          setError(`BLE scan error: ${err.message}`);
          return;
        }
        // Auto-connect to first Garmin device found
        const name = device?.name || device?.localName || "";
        if (
          name.toLowerCase().includes("garmin") ||
          name.toLowerCase().includes("forerunner") ||
          name.toLowerCase().includes("fenix") ||
          name.toLowerCase().includes("venu") ||
          name.toLowerCase().includes("vivoactive") ||
          name.toLowerCase().includes("instinct") ||
          name.toLowerCase().includes("enduro")
        ) {
          bleRef.current.stopDeviceScan();
          setBleScanning(false);
          connectBleDevice(device);
        }
      }
    );

    // Stop scanning after 15 seconds
    setTimeout(() => {
      bleRef.current?.stopDeviceScan();
      setBleScanning(false);
    }, 15000);
  };

  const connectBleDevice = async (device: any) => {
    try {
      const connected = await device.connect();
      const discovered = await connected.discoverAllServicesAndCharacteristics();
      bleDeviceRef.current = discovered;
      setBleConnected(true);
      setBleDeviceName(device.name || device.localName || "Garmin Device");

      // Subscribe to heart rate notifications
      discovered.monitorCharacteristicForService(
        HR_SERVICE_UUID,
        HR_CHAR_UUID,
        (err: any, char: any) => {
          if (err) return;
          if (char?.value) {
            const hr = parseHeartRate(char.value);
            if (hr > 0) setHeartRate(hr);
          }
        }
      );
    } catch (err: any) {
      setError(`BLE connect error: ${err.message}`);
      setBleConnected(false);
    }
  };

  const disconnectBle = async () => {
    try {
      if (bleDeviceRef.current) {
        await bleDeviceRef.current.cancelConnection();
      }
    } catch {}
    setBleConnected(false);
    setHeartRate(null);
    setBleDeviceName(null);
    bleDeviceRef.current = null;
  };

  // ── Loading State ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[st.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13 }}>
          Connecting to Garmin...
        </Text>
      </View>
    );
  }

  // ── Not Connected ─────────────────────────────────────────────────────────

  if (!connected) {
    return (
      <ScrollView style={st.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={st.header}>
          <Text style={st.title}>Garmin Connect</Text>
          <Text style={st.subtitle}>
            Sync your fitness data and stream live heart rate
          </Text>
        </View>

        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <View style={st.logo}>
            <Text style={{ fontSize: 36 }}>&#x1F3C3;</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.white, marginBottom: 8 }}>
            Connect with Garmin
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              textAlign: "center",
              paddingHorizontal: 32,
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            Link your Garmin account to sync daily stats, sleep analysis, stress
            levels, and activities directly into PulseAI.
          </Text>

          {authLoading ? (
            <ActivityIndicator size="large" color={colors.red} />
          ) : (
            <TouchableOpacity style={st.connectBtn} onPress={connectGarmin}>
              <Text style={st.connectBtnText}>Connect Garmin Account</Text>
            </TouchableOpacity>
          )}

          {error && (
            <Text
              style={{
                color: colors.red,
                fontSize: 12,
                marginTop: 12,
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              {error}
            </Text>
          )}

          {/* Features list */}
          <View style={st.featureList}>
            {[
              { icon: "\uD83D\uDEB6", title: "Daily Summary", desc: "Steps, distance, calories, and resting HR" },
              { icon: "\uD83D\uDE34", title: "Sleep Analysis", desc: "Deep, light, REM stages and SpO2" },
              { icon: "\uD83E\uDDE0", title: "Stress Level", desc: "Average daily stress score from Body Battery" },
              { icon: "\u2764\uFE0F", title: "Live Heart Rate", desc: "Real-time BLE streaming from your watch" },
              { icon: "\uD83C\uDFC3", title: "Activities", desc: "Recent runs, rides, swims, and workouts" },
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

          <View style={st.noteCard}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.amber, marginBottom: 4 }}>
              Developer Program Required
            </Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, lineHeight: 16 }}>
              The Garmin Connect API requires approval via the Garmin Developer Program
              (business accounts). BLE heart rate works independently — just enable
              "Broadcast Heart Rate" on your Garmin watch.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Connected — Show Dashboard + BLE ──────────────────────────────────────

  const daily = data?.daily;
  const sleep = data?.sleep;
  const activities = data?.activities || [];

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
      }
    >
      <View style={st.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={st.title}>Garmin</Text>
            <Text style={st.subtitle}>Connected</Text>
          </View>
          <TouchableOpacity onPress={disconnect} style={st.disconnectBtn}>
            <Text style={st.disconnectBtnText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            padding: 10,
            backgroundColor: "rgba(239,68,68,0.1)",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          <Text style={{ fontSize: 12, color: colors.red }}>{error}</Text>
        </View>
      )}

      {/* ── Live Heart Rate (BLE) ──────────────────────────────────────────── */}
      <View style={[st.card, { borderColor: "rgba(239,68,68,0.3)" }]}>
        <Text style={st.cardTitle}>Live Heart Rate</Text>
        {!bleAvailable ? (
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: colors.amber, fontWeight: "600", marginBottom: 4 }}>
              BLE Not Available
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
              Live heart rate requires a development build with react-native-ble-plx.
              Run "npx expo prebuild" then build with Xcode or Android Studio.
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 12 }}>
            {/* HR Circle */}
            <View style={st.hrCircle}>
              <Text style={{ fontSize: 20, color: colors.red }}>
                {bleConnected ? "\u2764\uFE0F" : "\uD83D\uDDA4"}
              </Text>
              <Text style={st.hrValue}>{heartRate ?? "--"}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>BPM</Text>
            </View>

            {bleConnected && bleDeviceName && (
              <Text style={{ fontSize: 11, color: colors.green, marginTop: 8 }}>
                Connected to {bleDeviceName}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              {!bleConnected ? (
                <TouchableOpacity
                  style={[st.bleBtn, bleScanning && { opacity: 0.6 }]}
                  onPress={startBleScan}
                  disabled={bleScanning}
                >
                  <Text style={st.bleBtnText}>
                    {bleScanning ? "Scanning..." : "Scan for Garmin"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[st.bleBtn, { backgroundColor: "rgba(100,116,139,0.3)" }]}
                  onPress={disconnectBle}
                >
                  <Text style={st.bleBtnText}>Disconnect BLE</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={{ fontSize: 9, color: colors.textDim, marginTop: 10, textAlign: "center" }}>
              Enable "Broadcast Heart Rate" on your Garmin watch
            </Text>
          </View>
        )}
      </View>

      {/* ── Daily Summary ──────────────────────────────────────────────────── */}
      <View style={st.card}>
        <Text style={st.cardTitle}>Today's Summary</Text>
        {daily ? (
          <View style={st.metricsGrid}>
            <MetricBox
              icon="\uD83D\uDEB6"
              label="Steps"
              value={daily.totalSteps?.toLocaleString() ?? "--"}
              color={colors.green}
            />
            <MetricBox
              icon="\u2764\uFE0F"
              label="Resting HR"
              value={daily.restingHeartRateInBeatsPerMinute ? `${daily.restingHeartRateInBeatsPerMinute} bpm` : "--"}
              color={colors.red}
            />
            <MetricBox
              icon="\uD83D\uDD25"
              label="Calories"
              value={daily.activeKilocalories ? `${daily.activeKilocalories} kcal` : "--"}
              color={colors.orange}
            />
            <MetricBox
              icon="\uD83E\uDDE0"
              label="Stress"
              value={daily.averageStressLevel ? `${daily.averageStressLevel}/100` : "--"}
              color={daily.averageStressLevel ? stressColor(daily.averageStressLevel) : colors.purple}
            />
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: 8 }}>
            No daily data available yet.
          </Text>
        )}
      </View>

      {/* ── Sleep Card ─────────────────────────────────────────────────────── */}
      <View style={st.card}>
        <Text style={st.cardTitle}>Last Sleep</Text>
        {sleep ? (
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.blue, marginBottom: 10 }}>
              Total: {secondsToHM(sleep.durationInSeconds)}
            </Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
              <SleepChip color="#818cf8" label="Deep" value={secondsToHM(sleep.deepSleepDurationInSeconds)} />
              <SleepChip color="#60a5fa" label="Light" value={secondsToHM(sleep.lightSleepDurationInSeconds)} />
              <SleepChip color="#c084fc" label="REM" value={secondsToHM(sleep.remSleepInSeconds)} />
            </View>
            <View style={{ flexDirection: "row", gap: 16 }}>
              {sleep.averageSpO2Value != null && (
                <Text style={{ fontSize: 11, color: colors.teal }}>
                  SpO2: {sleep.averageSpO2Value.toFixed(1)}%
                </Text>
              )}
              {sleep.averageRespirationValue != null && (
                <Text style={{ fontSize: 11, color: colors.cyan }}>
                  Resp: {sleep.averageRespirationValue.toFixed(1)} br/min
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: 8 }}>
            No sleep data available yet.
          </Text>
        )}
      </View>

      {/* ── Recent Activities ──────────────────────────────────────────────── */}
      {activities.length > 0 && (
        <View style={st.card}>
          <Text style={st.cardTitle}>Recent Activities</Text>
          {activities.slice(0, 5).map((act, i) => (
            <View key={act.summaryId || i} style={st.activityItem}>
              <Text style={{ fontSize: 16 }}>{activityIcon(act.activityType)}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                  {act.activityType?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Activity"}
                </Text>
                <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                  {metersToKm(act.distanceInMeters)} · {secondsToHM(act.durationInSeconds)}
                </Text>
              </View>
              {act.averageHeartRateInBeatsPerMinute && (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.red }}>
                    {act.averageHeartRateInBeatsPerMinute}
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.textMuted }}>avg bpm</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Last updated */}
      {data?.lastUpdated && (
        <Text style={{ textAlign: "center", fontSize: 10, color: colors.textDim, marginTop: 12 }}>
          Last updated:{" "}
          {new Date(data.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
    </ScrollView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function MetricBox({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={[st.metricBox, { backgroundColor: color + "15", borderColor: color + "30" }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: "700", color, marginTop: 4 }}>{value}</Text>
      <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function SleepChip({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        padding: 8,
        backgroundColor: color + "18",
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color }}>{value}</Text>
      <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function activityIcon(type: string | undefined): string {
  switch (type?.toLowerCase()) {
    case "running":
      return "\uD83C\uDFC3";
    case "cycling":
      return "\uD83D\uDEB4";
    case "swimming":
      return "\uD83C\uDFCA";
    case "walking":
      return "\uD83D\uDEB6";
    case "hiking":
      return "\u26F0\uFE0F";
    case "strength_training":
      return "\uD83C\uDFCB\uFE0F";
    case "yoga":
      return "\uD83E\uDDD8";
    default:
      return "\uD83C\uDFBD";
  }
}

// ── Styles ──────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "600", color: colors.white },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  logo: {
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
    backgroundColor: colors.red,
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricBox: {
    width: "47%",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  hrCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  hrValue: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.white,
    marginVertical: 2,
  },
  bleBtn: {
    backgroundColor: colors.red,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bleBtnText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51,65,85,0.2)",
  },
});
