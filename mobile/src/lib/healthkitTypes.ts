export interface HeartData {
  heartRate: number | null;
  heartRateVariability: number | null;
  restingHeartRate: number | null;
  lastUpdated: string | null;
}

export interface ActivityData {
  steps: number;
  distance: number;
  activeCalories: number;
  basalCalories: number;
  exerciseMinutes: number;
  standHours: number;
  date: string;
}

export interface BodyData {
  weight: number | null;
  spO2: number | null;
  respiratoryRate: number | null;
  lastUpdated: string | null;
}

export interface SleepSample {
  startDate: string;
  endDate: string;
  value: "asleep" | "inBed" | "awake" | "core" | "deep" | "rem";
}

export interface SleepData {
  samples: SleepSample[];
  totalSleepMinutes: number;
  lastNight: string;
}

export interface WorkoutSample {
  workoutType: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalEnergyBurned: number;
  totalDistance: number;
}

export interface HealthData {
  heart: HeartData;
  activity: ActivityData;
  body: BodyData;
  sleep: SleepData;
  workouts: WorkoutSample[];
  isAvailable: boolean;
  isAuthorized: boolean;
  lastRefresh: string | null;
}

export const EMPTY_HEALTH_DATA: HealthData = {
  heart: { heartRate: null, heartRateVariability: null, restingHeartRate: null, lastUpdated: null },
  activity: { steps: 0, distance: 0, activeCalories: 0, basalCalories: 0, exerciseMinutes: 0, standHours: 0, date: "" },
  body: { weight: null, spO2: null, respiratoryRate: null, lastUpdated: null },
  sleep: { samples: [], totalSleepMinutes: 0, lastNight: "" },
  workouts: [],
  isAvailable: false,
  isAuthorized: false,
  lastRefresh: null,
};
