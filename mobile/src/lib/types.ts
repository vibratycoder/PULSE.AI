export interface Citation {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  abstract: string;
}

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  flag: string;
  date_taken: string;
}

export interface Medication {
  name: string;
  dosage: string;
}

export interface Vaccine {
  name: string;
  date: string;
}

export interface HealthProfile {
  user_id: string;
  name: string;
  age: number;
  sex: string;
  height_cm: number;
  weight_kg: number;
  conditions: string[];
  medications: Medication[];
  allergies: string[];
  family_history: string[];
  lifestyle_notes: string[];
  lab_results: LabResult[];
  vaccines: Vaccine[];
  health_goals: string[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  is_emergency?: boolean;
  fileName?: string;
}

export interface LabValue {
  name: string;
  value: number;
  unit: string;
  normal_low: number;
  normal_high: number;
  flag: string;
  category: string;
}

export type MedLog = {
  [dateKey: string]: { [medName: string]: number | boolean };
};

export type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Before Bed";

export type MedTimingMap = {
  [medName: string]: TimeOfDay;
};
