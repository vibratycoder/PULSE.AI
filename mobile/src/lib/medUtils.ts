export function parseDosesPerWeek(dosage: string): number {
  const d = dosage.toLowerCase();
  if (d.includes("3x daily") || d.includes("three times daily") || d.includes("tid")) return 21;
  if (d.includes("twice daily") || d.includes("2x daily") || d.includes("bid")) return 14;
  if (d.includes("daily") || d.includes("every day") || d.includes("once daily") || d.includes("qd")) return 7;
  if (d.includes("every other day") || d.includes("eod")) return 4;
  if (d.includes("3x weekly") || d.includes("three times a week") || d.includes("3 times a week")) return 3;
  if (d.includes("twice weekly") || d.includes("2x weekly") || d.includes("twice a week")) return 2;
  if (d.includes("weekly") || d.includes("once a week") || d.includes("once weekly")) return 1;
  if (d.includes("as needed") || d.includes("prn")) return 0;
  if (d.includes("at bedtime") || d.includes("qhs")) return 7;
  return 7;
}

export function parseDosesPerDay(dosage: string): number {
  const d = dosage.toLowerCase();
  if (d.includes("3x daily") || d.includes("three times daily") || d.includes("tid")) return 3;
  if (d.includes("twice daily") || d.includes("2x daily") || d.includes("bid")) return 2;
  if (d.includes("weekly") || d.includes("once a week") || d.includes("once weekly")) return 0;
  if (d.includes("every other day") || d.includes("eod")) return 0;
  if (d.includes("as needed") || d.includes("prn")) return 0;
  return 1;
}

export function isDueOnDate(dosage: string, date: Date): boolean {
  const d = dosage.toLowerCase();
  if (d.includes("as needed") || d.includes("prn")) return false;
  if (d.includes("daily") || d.includes("bid") || d.includes("tid") || d.includes("qd") || d.includes("every day") || d.includes("at bedtime") || d.includes("qhs")) return true;
  if (d.includes("every other day") || d.includes("eod")) {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % 2 === 0;
  }
  const dow = date.getDay();
  if (d.includes("3x weekly") || d.includes("three times a week") || d.includes("3 times a week")) return [1, 3, 5].includes(dow);
  if (d.includes("twice weekly") || d.includes("2x weekly") || d.includes("twice a week")) return [1, 4].includes(dow);
  if (d.includes("weekly") || d.includes("once a week") || d.includes("once weekly")) return dow === 1;
  return true;
}

export function countDueInWeek(dosage: string, weekDates: Date[]): number {
  if (parseDosesPerWeek(dosage) === 0) return 0;
  const perDay = Math.max(parseDosesPerDay(dosage), 1);
  let total = 0;
  for (const d of weekDates) {
    if (isDueOnDate(dosage, d)) total += perDay;
  }
  return total;
}

export function getFrequencyLabel(dosage: string): string {
  const perWeek = parseDosesPerWeek(dosage);
  if (perWeek === 0) return "As needed";
  if (perWeek === 1) return "1x/week";
  if (perWeek === 2) return "2x/week";
  if (perWeek === 3) return "3x/week";
  if (perWeek === 4) return "Every other day";
  if (perWeek === 7) return "Daily";
  if (perWeek === 14) return "2x/day";
  if (perWeek === 21) return "3x/day";
  return `${perWeek}x/week`;
}

export function getDoseCount(log: any, day: string, medName: string): number {
  const val = log[day]?.[medName];
  if (val === true) return 1;
  if (typeof val === "number") return val;
  return 0;
}

export function getWeekDates(weekOffset: number): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dow + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const TIMING_ICONS: Record<string, string> = {
  Morning: "\u2600\uFE0F",
  Afternoon: "\u26C5",
  Evening: "\uD83C\uDF19",
  "Before Bed": "\uD83D\uDCA4",
};

export const TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Before Bed"] as const;
