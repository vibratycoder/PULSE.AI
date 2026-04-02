import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

// ─── Configuration ──────────────────────────────────────────────────────────
// Backend proxy handles OAuth 1.0a signing — we just call our own server.
const API_BASE = "http://10.94.22.11:8000";

const TOKEN_KEY = "pulseai_garmin_tokens";
const CACHE_KEY = "pulseai_garmin_cache";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GarminTokens {
  access_token: string;
  access_token_secret: string;
}

export interface GarminDailySummary {
  calendarDate: string;
  totalSteps?: number;
  totalDistanceInMeters?: number;
  activeKilocalories?: number;
  restingHeartRateInBeatsPerMinute?: number;
  averageStressLevel?: number;
  maxHeartRateInBeatsPerMinute?: number;
  minHeartRateInBeatsPerMinute?: number;
}

export interface GarminSleepSummary {
  calendarDate: string;
  durationInSeconds?: number;
  deepSleepDurationInSeconds?: number;
  lightSleepDurationInSeconds?: number;
  remSleepInSeconds?: number;
  awakeDurationInSeconds?: number;
  averageSpO2Value?: number;
  averageRespirationValue?: number;
}

export interface GarminActivity {
  summaryId: string;
  activityType?: string;
  startTimeInSeconds: number;
  durationInSeconds?: number;
  distanceInMeters?: number;
  averageHeartRateInBeatsPerMinute?: number;
  activeKilocalories?: number;
}

export interface GarminData {
  daily: GarminDailySummary | null;
  sleep: GarminSleepSummary | null;
  activities: GarminActivity[];
  lastUpdated: number;
}

// ─── Token Management ───────────────────────────────────────────────────────

export async function loadTokens(): Promise<GarminTokens | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveTokens(tokens: GarminTokens) {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, CACHE_KEY]);
}

export async function isConnected(): Promise<boolean> {
  const tokens = await loadTokens();
  return tokens !== null;
}

// ─── OAuth Flow (via backend proxy) ─────────────────────────────────────────

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({ scheme: "pulseai" });

export async function startGarminAuth(): Promise<GarminTokens> {
  // Step 1: Ask our backend to get a request token from Garmin
  const startResp = await fetch(
    `${API_BASE}/garmin/auth/start?callback_url=${encodeURIComponent(redirectUri)}`
  );
  if (!startResp.ok) {
    throw new Error(`Auth start failed: ${startResp.status}`);
  }
  const { authorize_url } = await startResp.json();

  // Step 2: Open Garmin login in browser
  const result = await WebBrowser.openAuthSessionAsync(authorize_url, redirectUri);

  if (result.type !== "success" || !result.url) {
    throw new Error("Authentication was cancelled");
  }

  // Step 3: Parse the callback URL for oauth_token & oauth_verifier
  const url = new URL(result.url);
  const oauthToken = url.searchParams.get("oauth_token") || "";
  const oauthVerifier = url.searchParams.get("oauth_verifier") || "";

  if (!oauthToken || !oauthVerifier) {
    throw new Error("Missing oauth_token or oauth_verifier in callback");
  }

  // Step 4: Exchange for access token via backend
  const exchangeResp = await fetch(
    `${API_BASE}/garmin/auth/exchange?oauth_token=${encodeURIComponent(oauthToken)}&oauth_verifier=${encodeURIComponent(oauthVerifier)}`,
    { method: "POST" }
  );
  if (!exchangeResp.ok) {
    throw new Error(`Token exchange failed: ${exchangeResp.status}`);
  }

  const tokens: GarminTokens = await exchangeResp.json();
  await saveTokens(tokens);
  return tokens;
}

// ─── Data Fetching (via backend proxy) ──────────────────────────────────────

async function garminGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const tokens = await loadTokens();
  if (!tokens) throw new Error("Not connected to Garmin");

  const qs = new URLSearchParams({
    access_token: tokens.access_token,
    access_token_secret: tokens.access_token_secret,
    ...params,
  });

  const resp = await fetch(`${API_BASE}/garmin/data/${endpoint}?${qs}`);
  if (!resp.ok) {
    if (resp.status === 401) {
      await clearTokens();
      throw new Error("Garmin session expired — please reconnect");
    }
    throw new Error(`Garmin API error: ${resp.status}`);
  }
  return resp.json();
}

export async function fetchGarminDaily(): Promise<GarminDailySummary | null> {
  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - 86400;
  const data = await garminGet<GarminDailySummary[]>("dailies", {
    uploadStartTimeInSeconds: String(yesterday),
    uploadEndTimeInSeconds: String(now),
  });
  return data?.[0] || null;
}

export async function fetchGarminSleep(): Promise<GarminSleepSummary | null> {
  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - 86400;
  const data = await garminGet<GarminSleepSummary[]>("epochs/sleep", {
    uploadStartTimeInSeconds: String(yesterday),
    uploadEndTimeInSeconds: String(now),
  });
  return data?.[0] || null;
}

export async function fetchGarminActivities(): Promise<GarminActivity[]> {
  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - 86400;
  return garminGet<GarminActivity[]>("activities", {
    uploadStartTimeInSeconds: String(yesterday),
    uploadEndTimeInSeconds: String(now),
  });
}

export async function fetchAllGarminData(): Promise<GarminData> {
  const [daily, sleep, activities] = await Promise.all([
    fetchGarminDaily().catch(() => null),
    fetchGarminSleep().catch(() => null),
    fetchGarminActivities().catch(() => []),
  ]);

  const data: GarminData = { daily, sleep, activities, lastUpdated: Date.now() };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  return data;
}

export async function loadCachedData(): Promise<GarminData | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function secondsToHM(seconds: number | undefined | null): string {
  if (!seconds) return "--";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function metersToKm(meters: number | undefined | null): string {
  if (!meters) return "--";
  return `${(meters / 1000).toFixed(2)} km`;
}

export function stressColor(level: number): string {
  if (level <= 25) return "#22c55e"; // low
  if (level <= 50) return "#3b82f6"; // medium
  if (level <= 75) return "#f59e0b"; // high
  return "#ef4444"; // very high
}
