import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

// ─── WHOOP OAuth Configuration ───────────────────────────────────────────────
// Register your app at https://developer.whoop.com
// Set redirect URI to your Expo auth proxy or custom scheme
// Then fill in your Client ID and Client Secret below:
const WHOOP_CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const WHOOP_CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE";

const AUTH_ENDPOINT = "https://api.prod.whoop.com/oauth/oauth2/auth";
const TOKEN_ENDPOINT = "https://api.prod.whoop.com/oauth/oauth2/token";
const API_BASE = "https://api.prod.whoop.com/developer/v1";

const SCOPES = [
  "read:recovery",
  "read:sleep",
  "read:workout",
  "read:profile",
  "read:body_measurement",
  "read:cycles",
];

// Storage keys
const TOKEN_KEY = "pulseai_whoop_tokens";
const CACHE_KEY = "pulseai_whoop_cache";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WHOOPTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix ms
}

export interface WHOOPProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface WHOOPRecovery {
  score: {
    recovery_score: number;
    hrv_rmssd_milli: number;
    resting_heart_rate: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
    user_calibrating: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface WHOOPSleep {
  score: {
    sleep_performance_percentage: number;
    sleep_efficiency_percentage: number;
    sleep_consistency_percentage: number;
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      total_no_data_time_milli: number;
    };
    respiratory_rate?: number;
  };
  start: string;
  end: string;
}

export interface WHOOPWorkout {
  id: number;
  sport_id: number;
  start: string;
  end: string;
  score: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    distance_meter?: number;
    zone_duration?: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  };
}

export interface WHOOPCycle {
  id: number;
  start: string;
  end?: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

export interface WHOOPData {
  profile: WHOOPProfile | null;
  recovery: WHOOPRecovery | null;
  sleep: WHOOPSleep | null;
  workouts: WHOOPWorkout[];
  cycles: WHOOPCycle[];
  lastUpdated: number;
}

// ─── WHOOP Sport ID mapping ──────────────────────────────────────────────────

const SPORT_NAMES: Record<number, string> = {
  [-1]: "Activity",
  0: "Running",
  1: "Cycling",
  16: "Baseball",
  17: "Basketball",
  18: "Rowing",
  19: "Fencing",
  20: "Field Hockey",
  21: "Football",
  22: "Golf",
  24: "Ice Hockey",
  25: "Lacrosse",
  27: "Rugby",
  28: "Sailing",
  29: "Skiing",
  30: "Soccer",
  31: "Softball",
  32: "Squash",
  33: "Swimming",
  34: "Tennis",
  35: "Track & Field",
  36: "Volleyball",
  37: "Water Polo",
  38: "Wrestling",
  39: "Boxing",
  42: "Dance",
  43: "Pilates",
  44: "Yoga",
  45: "Weightlifting",
  47: "Cross Country Skiing",
  48: "Functional Fitness",
  49: "Duathlon",
  51: "Gymnastics",
  52: "HIIT",
  53: "Martial Arts",
  55: "Meditation",
  56: "Other",
  57: "Spin",
  59: "Triathlon",
  60: "Walking",
  63: "Surfing",
  64: "Elliptical",
  65: "Stairmaster",
  66: "Snowboarding",
  70: "Pickleball",
  71: "Padel",
  73: "Hyrox",
};

export function getSportName(sportId: number): string {
  return SPORT_NAMES[sportId] || "Activity";
}

// ─── Token Management ────────────────────────────────────────────────────────

export async function loadTokens(): Promise<WHOOPTokens | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveTokens(tokens: WHOOPTokens) {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, CACHE_KEY]);
}

export async function isConnected(): Promise<boolean> {
  const tokens = await loadTokens();
  return tokens !== null;
}

// ─── OAuth Flow ──────────────────────────────────────────────────────────────

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({ scheme: "pulseai" });

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: AUTH_ENDPOINT,
  tokenEndpoint: TOKEN_ENDPOINT,
};

export function useWhoopAuth() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: WHOOP_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  return { request, response, promptAsync };
}

export async function exchangeCodeForTokens(code: string): Promise<WHOOPTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: WHOOP_CLIENT_ID,
    client_secret: WHOOP_CLIENT_SECRET,
    redirect_uri: redirectUri,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const tokens: WHOOPTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await saveTokens(tokens);
  return tokens;
}

async function refreshAccessToken(): Promise<WHOOPTokens> {
  const current = await loadTokens();
  if (!current?.refresh_token) throw new Error("No refresh token available");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: current.refresh_token,
    client_id: WHOOP_CLIENT_ID,
    client_secret: WHOOP_CLIENT_SECRET,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    await clearTokens();
    throw new Error("Refresh failed — please reconnect");
  }

  const data = await res.json();
  const tokens: WHOOPTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await saveTokens(tokens);
  return tokens;
}

async function getValidToken(): Promise<string> {
  let tokens = await loadTokens();
  if (!tokens) throw new Error("Not connected to WHOOP");

  // Refresh if expiring within 5 minutes
  if (Date.now() > tokens.expires_at - 5 * 60 * 1000) {
    tokens = await refreshAccessToken();
  }

  return tokens.access_token;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

async function whoopGet<T>(path: string): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    // Token expired mid-flight — try one refresh
    const newTokens = await refreshAccessToken();
    const retry = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${newTokens.access_token}` },
    });
    if (!retry.ok) throw new Error(`WHOOP API error: ${retry.status}`);
    return retry.json();
  }

  if (!res.ok) throw new Error(`WHOOP API error: ${res.status}`);
  return res.json();
}

export async function fetchProfile(): Promise<WHOOPProfile> {
  return whoopGet<WHOOPProfile>("/user/profile/basic");
}

export async function fetchRecovery(): Promise<WHOOPRecovery | null> {
  const data = await whoopGet<{ records: WHOOPRecovery[] }>("/recovery?limit=1");
  return data.records?.[0] || null;
}

export async function fetchSleep(): Promise<WHOOPSleep | null> {
  const data = await whoopGet<{ records: WHOOPSleep[] }>("/activity/sleep?limit=1");
  return data.records?.[0] || null;
}

export async function fetchWorkouts(): Promise<WHOOPWorkout[]> {
  const data = await whoopGet<{ records: WHOOPWorkout[] }>("/activity/workout?limit=10");
  return data.records || [];
}

export async function fetchCycles(): Promise<WHOOPCycle[]> {
  const data = await whoopGet<{ records: WHOOPCycle[] }>("/cycle?limit=7");
  return data.records || [];
}

// ─── Fetch All Data ──────────────────────────────────────────────────────────

export async function fetchAllWhoopData(): Promise<WHOOPData> {
  const [profile, recovery, sleep, workouts, cycles] = await Promise.all([
    fetchProfile().catch(() => null),
    fetchRecovery().catch(() => null),
    fetchSleep().catch(() => null),
    fetchWorkouts().catch(() => []),
    fetchCycles().catch(() => []),
  ]);

  const data: WHOOPData = { profile, recovery, sleep, workouts, cycles, lastUpdated: Date.now() };

  // Cache for offline access
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));

  return data;
}

export async function loadCachedData(): Promise<WHOOPData | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function msToHours(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function formatRecoveryColor(score: number): string {
  if (score >= 67) return "#22c55e"; // green
  if (score >= 34) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function formatStrainColor(strain: number): string {
  if (strain >= 18) return "#ef4444"; // overreaching
  if (strain >= 14) return "#f59e0b"; // high
  if (strain >= 10) return "#3b82f6"; // moderate
  return "#22c55e"; // light
}
