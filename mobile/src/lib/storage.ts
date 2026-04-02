import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "pulseai_profile";
const BLOODWORK_KEY = "pulseai_bloodwork";
const MEDLOG_KEY = "pulseai_medlog";
const MEDTIMING_KEY = "pulseai_medtiming";
const PEPTIDES_KEY = "pulseai_peptides";

export async function loadProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile: any) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadBloodwork() {
  const raw = await AsyncStorage.getItem(BLOODWORK_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : parsed?.results ?? [];
}

export async function saveBloodwork(data: any) {
  await AsyncStorage.setItem(BLOODWORK_KEY, JSON.stringify(data));
}

export async function loadMedLog() {
  const raw = await AsyncStorage.getItem(MEDLOG_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveMedLog(log: any) {
  await AsyncStorage.setItem(MEDLOG_KEY, JSON.stringify(log));
}

export async function loadMedTiming() {
  const raw = await AsyncStorage.getItem(MEDTIMING_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveMedTiming(timing: any) {
  await AsyncStorage.setItem(MEDTIMING_KEY, JSON.stringify(timing));
}

export async function loadPeptides() {
  const raw = await AsyncStorage.getItem(PEPTIDES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function savePeptides(peptides: any) {
  await AsyncStorage.setItem(PEPTIDES_KEY, JSON.stringify(peptides));
}
