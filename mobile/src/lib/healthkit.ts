/**
 * HealthKit service layer.
 *
 * When a dev-client or production build is running on iOS, this module
 * loads @kingstinct/react-native-healthkit and provides real data.
 *
 * When running in Expo Go, on Android, on Windows, or when the native
 * package is not installed, all functions return safe empty defaults.
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  HeartData,
  ActivityData,
  BodyData,
  SleepData,
  SleepSample,
  WorkoutSample,
  HealthData,
} from "./healthkitTypes";
import { EMPTY_HEALTH_DATA } from "./healthkitTypes";

const CACHE_KEY = "pulseai_healthkit";

// ---------------------------------------------------------------------------
// Native module — only loaded in an iOS dev-client / production build.
// The require() is wrapped so that if the package isn't installed or the
// native binary isn't linked, nothing crashes.
// ---------------------------------------------------------------------------
let hk: any = null;
let initDone = false;

function getHK(): any {
  if (initDone) return hk;
  initDone = true;
  if (Platform.OS !== "ios") return null;
  try {
    // Dynamic string prevents Metro from statically resolving this module.
    // When the package isn't installed, require() throws and hk stays null.
    // When it IS installed (dev-client / production build), it loads normally.
    const pkg = "@kingstinct/" + "react-native-healthkit";
    hk = require(pkg);
  } catch {
    hk = null;
  }
  return hk;
}

// Identifier strings
const QTY = {
  heartRate: "HKQuantityTypeIdentifierHeartRate",
  hrv: "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
  restingHR: "HKQuantityTypeIdentifierRestingHeartRate",
  steps: "HKQuantityTypeIdentifierStepCount",
  distance: "HKQuantityTypeIdentifierDistanceWalkingRunning",
  activeCal: "HKQuantityTypeIdentifierActiveEnergyBurned",
  basalCal: "HKQuantityTypeIdentifierBasalEnergyBurned",
  exercise: "HKQuantityTypeIdentifierAppleExerciseTime",
  stand: "HKQuantityTypeIdentifierAppleStandTime",
  bodyMass: "HKQuantityTypeIdentifierBodyMass",
  spo2: "HKQuantityTypeIdentifierOxygenSaturation",
  respRate: "HKQuantityTypeIdentifierRespiratoryRate",
};
const CAT_SLEEP = "HKCategoryTypeIdentifierSleepAnalysis";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function checkAvailability(): Promise<boolean> {
  try {
    const m = getHK();
    return m ? m.isHealthDataAvailable() : false;
  } catch { return false; }
}

export async function requestPermissions(): Promise<boolean> {
  try {
    const m = getHK();
    if (!m) return false;
    return await m.requestAuthorization({
      toRead: [
        QTY.heartRate, QTY.hrv, QTY.restingHR,
        QTY.steps, QTY.distance, QTY.activeCal, QTY.basalCal,
        QTY.exercise, QTY.stand,
        QTY.bodyMass, QTY.spo2, QTY.respRate,
        CAT_SLEEP,
      ],
    });
  } catch { return false; }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function startOfDay(d: Date): Date { const s = new Date(d); s.setHours(0, 0, 0, 0); return s; }
function endOfDay(d: Date): Date { const e = new Date(d); e.setHours(23, 59, 59, 999); return e; }
function daysAgo(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0); return d; }
function df(from: Date, to: Date) { return { filter: { date: { startDate: from, endDate: to } } }; }

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
export async function fetchHeartData(): Promise<HeartData> {
  const m = getHK();
  if (!m) return EMPTY_HEALTH_DATA.heart;
  try {
    const now = new Date();
    const [hr, hrv, rhr] = await Promise.all([
      m.queryQuantitySamples(QTY.heartRate, { ...df(daysAgo(1), now), limit: 1, ascending: false }),
      m.queryQuantitySamples(QTY.hrv, { ...df(daysAgo(7), now), limit: 1, ascending: false }),
      m.queryQuantitySamples(QTY.restingHR, { ...df(daysAgo(7), now), limit: 1, ascending: false }),
    ]);
    return {
      heartRate: hr[0]?.quantity ?? null,
      heartRateVariability: hrv[0]?.quantity ?? null,
      restingHeartRate: rhr[0]?.quantity ?? null,
      lastUpdated: hr[0]?.startDate?.toString() ?? null,
    };
  } catch { return EMPTY_HEALTH_DATA.heart; }
}

export async function fetchActivityData(date?: Date): Promise<ActivityData> {
  const m = getHK();
  const target = date ?? new Date();
  const from = startOfDay(target);
  const to = endOfDay(target);
  const dateStr = from.toISOString().slice(0, 10);
  if (!m) return { ...EMPTY_HEALTH_DATA.activity, date: dateStr };
  try {
    const stat = async (id: string) => {
      try {
        const r = await m.queryStatisticsForQuantity(id, ["cumulativeSum"], { filter: { date: { startDate: from, endDate: to } } });
        return r?.sumQuantity?.quantity ?? 0;
      } catch { return 0; }
    };
    const [steps, dist, aCal, bCal, exer, stand] = await Promise.all([
      stat(QTY.steps), stat(QTY.distance), stat(QTY.activeCal),
      stat(QTY.basalCal), stat(QTY.exercise), stat(QTY.stand),
    ]);
    return { steps: Math.round(steps), distance: Math.round(dist), activeCalories: Math.round(aCal), basalCalories: Math.round(bCal), exerciseMinutes: Math.round(exer), standHours: Math.round(stand / 3600), date: dateStr };
  } catch { return { ...EMPTY_HEALTH_DATA.activity, date: dateStr }; }
}

export async function fetchBodyData(): Promise<BodyData> {
  const m = getHK();
  if (!m) return EMPTY_HEALTH_DATA.body;
  try {
    const now = new Date();
    const [wt, sp, rr] = await Promise.all([
      m.queryQuantitySamples(QTY.bodyMass, { ...df(daysAgo(30), now), limit: 1, ascending: false }),
      m.queryQuantitySamples(QTY.spo2, { ...df(daysAgo(7), now), limit: 1, ascending: false }),
      m.queryQuantitySamples(QTY.respRate, { ...df(daysAgo(7), now), limit: 1, ascending: false }),
    ]);
    return {
      weight: wt[0]?.quantity ?? null,
      spO2: sp[0]?.quantity != null ? Math.round(sp[0].quantity * 100) : null,
      respiratoryRate: rr[0]?.quantity ?? null,
      lastUpdated: wt[0]?.startDate?.toString() ?? null,
    };
  } catch { return EMPTY_HEALTH_DATA.body; }
}

export async function fetchSleepData(): Promise<SleepData> {
  const m = getHK();
  if (!m) return EMPTY_HEALTH_DATA.sleep;
  try {
    const now = new Date();
    const ago = daysAgo(2);
    const samples = await m.queryCategorySamples(CAT_SLEEP, { ...df(ago, now), limit: -1, ascending: false });
    const valMap: Record<number, SleepSample["value"]> = { 0: "inBed", 1: "asleep", 2: "awake", 3: "core", 4: "deep", 5: "rem" };
    const mapped: SleepSample[] = (samples ?? []).map((s: any) => ({
      startDate: String(s.startDate ?? ""), endDate: String(s.endDate ?? ""),
      value: valMap[s.value] ?? "asleep",
    }));
    const sleepOnly = mapped.filter(s => s.value !== "inBed" && s.value !== "awake");
    let totalMs = 0;
    for (const s of sleepOnly) totalMs += new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
    return { samples: mapped, totalSleepMinutes: Math.round(totalMs / 60000), lastNight: ago.toISOString().slice(0, 10) };
  } catch { return EMPTY_HEALTH_DATA.sleep; }
}

export async function fetchWorkouts(limit = 10): Promise<WorkoutSample[]> {
  const m = getHK();
  if (!m) return [];
  try {
    const workouts = await m.queryWorkoutSamples({ ...df(daysAgo(30), new Date()), limit, ascending: false });
    return (workouts ?? []).map((w: any) => ({
      workoutType: workoutName(w.workoutActivityType),
      startDate: String(w.startDate ?? ""), endDate: String(w.endDate ?? ""),
      duration: Math.round((w.duration ?? 0) / 60),
      totalEnergyBurned: Math.round(w.totalEnergyBurned?.quantity ?? 0),
      totalDistance: Math.round(w.totalDistance?.quantity ?? 0),
    }));
  } catch { return []; }
}

function workoutName(t: number | string): string {
  const n: Record<number, string> = { 37: "Running", 52: "Walking", 13: "Cycling", 46: "Swimming", 50: "Yoga", 20: "Strength Training", 35: "Rowing", 63: "HIIT", 24: "Hiking", 25: "Elliptical", 76: "Kickboxing", 27: "Stair Climbing", 62: "Core Training", 33: "Pilates", 73: "Dance", 49: "Stretching" };
  return typeof t === "number" ? n[t] ?? `Workout (${t})` : String(t);
}

// ---------------------------------------------------------------------------
// Aggregate + Cache
// ---------------------------------------------------------------------------
export async function fetchAllHealthData(): Promise<HealthData> {
  const isAvailable = await checkAvailability();
  if (!isAvailable) return { ...EMPTY_HEALTH_DATA, isAvailable: false };
  const isAuthorized = await requestPermissions();
  const [heart, activity, body, sleep, workouts] = await Promise.all([
    fetchHeartData(), fetchActivityData(), fetchBodyData(), fetchSleepData(), fetchWorkouts(),
  ]);
  const data: HealthData = { heart, activity, body, sleep, workouts, isAvailable: true, isAuthorized, lastRefresh: new Date().toISOString() };
  await cacheHealthData(data);
  return data;
}

export async function getCachedHealthData(): Promise<HealthData | null> {
  try { const r = await AsyncStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export async function cacheHealthData(data: HealthData): Promise<void> {
  try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}
