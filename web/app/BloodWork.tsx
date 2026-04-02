"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface LabValue {
  name: string;
  value: number;
  unit: string;
  normal_low: number;
  normal_high: number;
  flag: string;
  category: string;
}

interface BloodworkData {
  filename: string;
  results: LabValue[];
  raw_text: string;
}

const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  Metabolic: { bar: "bg-blue-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  Lipid: { bar: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-400" },
  CBC: { bar: "bg-rose-500", bg: "bg-rose-500/10", text: "text-rose-400" },
  Thyroid: { bar: "bg-purple-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  Liver: { bar: "bg-green-500", bg: "bg-green-500/10", text: "text-green-400" },
  Kidney: { bar: "bg-orange-500", bg: "bg-orange-500/10", text: "text-orange-400" },
  Vitamin: { bar: "bg-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  Hormone: { bar: "bg-pink-500", bg: "bg-pink-500/10", text: "text-pink-400" },
  Iron: { bar: "bg-red-500", bg: "bg-red-500/10", text: "text-red-400" },
  Inflammation: { bar: "bg-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  Other: { bar: "bg-slate-500", bg: "bg-slate-500/10", text: "text-slate-400" },
};

function getStatusColor(flag: string) {
  if (flag === "high") return { dot: "bg-red-400", text: "text-red-400", label: "HIGH" };
  if (flag === "low") return { dot: "bg-amber-400", text: "text-amber-400", label: "LOW" };
  return { dot: "bg-green-400", text: "text-green-400", label: "Normal" };
}

function RangeBar({ lab }: { lab: LabValue }) {
  const { normal_low, normal_high, value } = lab;
  const range = normal_high - normal_low;
  const padding = range * 1.5;
  const chartMin = Math.max(0, normal_low - padding);
  const chartMax = normal_high + padding;
  const chartRange = chartMax - chartMin;

  const normalLeftPct = ((normal_low - chartMin) / chartRange) * 100;
  const normalWidthPct = ((normal_high - normal_low) / chartRange) * 100;
  const valuePct = Math.max(0, Math.min(100, ((value - chartMin) / chartRange) * 100));

  const status = getStatusColor(lab.flag);

  return (
    <div className="relative h-6 w-full">
      {/* Track */}
      <div className="absolute inset-y-2 inset-x-0 bg-slate-800 rounded-full" />

      {/* Normal range zone */}
      <div
        className="absolute inset-y-1.5 bg-green-500/20 border border-green-500/30 rounded-full"
        style={{ left: `${normalLeftPct}%`, width: `${normalWidthPct}%` }}
      />

      {/* Low label */}
      <span
        className="absolute top-7 text-[9px] text-slate-600 -translate-x-1/2"
        style={{ left: `${normalLeftPct}%` }}
      >
        {normal_low}
      </span>

      {/* High label */}
      <span
        className="absolute top-7 text-[9px] text-slate-600 -translate-x-1/2"
        style={{ left: `${normalLeftPct + normalWidthPct}%` }}
      >
        {normal_high}
      </span>

      {/* Value marker */}
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full border-2 border-slate-900 shadow-lg -translate-x-1/2 flex items-center justify-center ${
          lab.flag === "high"
            ? "bg-red-500"
            : lab.flag === "low"
            ? "bg-amber-500"
            : "bg-green-500"
        }`}
        style={{ left: `${valuePct}%` }}
      >
        <span className="text-[7px] font-bold text-white">{lab.flag === "high" ? "H" : lab.flag === "low" ? "L" : ""}</span>
      </div>
    </div>
  );
}

function LabCard({ lab }: { lab: LabValue }) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatusColor(lab.flag);
  const catColors = CATEGORY_COLORS[lab.category] || CATEGORY_COLORS.Other;

  const pctOfNormal =
    lab.normal_high > 0
      ? ((lab.value - lab.normal_low) / (lab.normal_high - lab.normal_low)) * 100
      : 0;

  return (
    <div
      className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 cursor-pointer hover:border-slate-600/50 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
          <h4 className="text-sm font-semibold text-slate-200">{lab.name}</h4>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${catColors.bg} ${catColors.text}`}>
            {lab.category}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${status.text}`}>
            {lab.value}
          </span>
          <span className="text-xs text-slate-500 ml-1">{lab.unit}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span>Normal: {lab.normal_low} — {lab.normal_high} {lab.unit}</span>
        <span className={`font-semibold ${status.text}`}>{status.label}</span>
      </div>

      <RangeBar lab={lab} />

      {expanded && (() => {
        const recs = lab.flag ? getLabRecommendations(lab) : [];
        return (
          <div className="mt-6 pt-3 border-t border-slate-700/30 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">% through normal range</span>
              <span className={`font-mono ${status.text}`}>{pctOfNormal.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Distance from midpoint</span>
              <span className="text-slate-300 font-mono">
                {(lab.value - (lab.normal_low + lab.normal_high) / 2).toFixed(1)} {lab.unit}
              </span>
            </div>
            {recs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recommendations</p>
                <ul className="space-y-1.5">
                  {recs.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-teal-400 mt-0.5 shrink-0">&#8226;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
                  For informational purposes only — consult your healthcare provider before making changes.
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function SummaryCards({ results }: { results: LabValue[] }) {
  const normal = results.filter((r) => !r.flag).length;
  const high = results.filter((r) => r.flag === "high").length;
  const low = results.filter((r) => r.flag === "low").length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-green-400">{normal}</p>
        <p className="text-xs text-green-400/70">Normal</p>
      </div>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-red-400">{high}</p>
        <p className="text-xs text-red-400/70">Above Range</p>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-amber-400">{low}</p>
        <p className="text-xs text-amber-400/70">Below Range</p>
      </div>
    </div>
  );
}

function CategoryFilter({
  categories,
  active,
  onToggle,
}: {
  categories: string[];
  active: Set<string>;
  onToggle: (cat: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => {
        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
        const isActive = active.has(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              isActive
                ? `${colors.bg} ${colors.text} border-current`
                : "bg-slate-800/40 text-slate-500 border-slate-700/30 hover:text-slate-300"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

export type { LabValue };

/** Per-lab-name recommendations keyed by lowercase name substring. */
const LAB_RECOMMENDATIONS: Record<string, { high: string[]; low: string[] }> = {
  glucose: {
    high: [
      "Reduce intake of refined carbohydrates and added sugars",
      "Increase physical activity — aim for 30 min of moderate exercise daily",
      "Monitor carbohydrate portions and consider a low-glycemic diet",
      "Schedule a follow-up fasting glucose or HbA1c test",
    ],
    low: [
      "Eat regular, balanced meals to maintain steady blood sugar",
      "Include complex carbohydrates and protein with each meal",
      "Keep a quick-acting sugar source available (juice, glucose tablets)",
      "Discuss medication timing with your healthcare provider",
    ],
  },
  cholesterol: {
    high: [
      "Increase soluble fiber intake (oats, beans, lentils, flaxseed)",
      "Replace saturated fats with unsaturated fats (olive oil, nuts, avocado)",
      "Add omega-3 rich foods like salmon, mackerel, or walnuts",
      "Exercise at least 150 minutes per week at moderate intensity",
      "Consider plant sterols/stanols found in fortified foods",
    ],
    low: [
      "Ensure adequate healthy fat intake from whole foods",
      "Discuss potential underlying causes with your doctor",
    ],
  },
  ldl: {
    high: [
      "Limit saturated fat to less than 7% of daily calories",
      "Add 10–25g of soluble fiber per day (oats, barley, legumes)",
      "Include plant sterols/stanols (2g/day) from fortified foods",
      "Increase aerobic exercise to at least 30 minutes, 5 days per week",
      "Consider Mediterranean-style eating patterns",
    ],
    low: [],
  },
  hdl: {
    high: [],
    low: [
      "Increase aerobic exercise — aim for 30–60 min most days",
      "Include healthy fats: olive oil, fatty fish, nuts, and avocados",
      "Quit smoking if applicable — HDL can increase 10% after quitting",
      "Limit refined carbohydrates and trans fats",
      "Moderate alcohol intake may help (discuss with your doctor)",
    ],
  },
  triglyceride: {
    high: [
      "Reduce sugar and refined carbohydrate intake significantly",
      "Limit alcohol consumption",
      "Increase omega-3 fatty acids (fatty fish 2–3 times per week)",
      "Lose excess weight — even 5–10% weight loss can lower triglycerides",
      "Exercise regularly — at least 30 minutes of moderate activity daily",
    ],
    low: [],
  },
  hemoglobin: {
    high: [
      "Stay well hydrated — dehydration can artificially raise hemoglobin",
      "Discuss potential causes like polycythemia with your doctor",
      "Avoid smoking or exposure to carbon monoxide",
    ],
    low: [
      "Increase iron-rich foods: red meat, spinach, lentils, fortified cereals",
      "Pair iron-rich foods with vitamin C for better absorption",
      "Avoid tea or coffee with meals as they inhibit iron absorption",
      "Get tested for iron, B12, and folate deficiencies",
      "Consider iron supplementation (consult your doctor first)",
    ],
  },
  hba1c: {
    high: [
      "Work with your doctor to set a target HbA1c goal",
      "Monitor blood glucose regularly if not already doing so",
      "Follow a consistent carbohydrate-controlled meal plan",
      "Increase physical activity to improve insulin sensitivity",
      "Review medication adherence and timing with your provider",
    ],
    low: [],
  },
  tsh: {
    high: [
      "This may indicate an underactive thyroid (hypothyroidism)",
      "Schedule a follow-up thyroid panel (Free T3, Free T4)",
      "Ensure adequate iodine intake through diet",
      "Discuss thyroid hormone replacement therapy with your doctor",
    ],
    low: [
      "This may indicate an overactive thyroid (hyperthyroidism)",
      "Schedule a follow-up thyroid panel and possible imaging",
      "Monitor for symptoms: rapid heartbeat, weight loss, anxiety",
      "Avoid excess iodine and discuss treatment options",
    ],
  },
  creatinine: {
    high: [
      "Stay well hydrated — drink adequate water throughout the day",
      "Limit high-protein meals temporarily before retesting",
      "Monitor blood pressure and keep it within normal range",
      "Reduce NSAID use (ibuprofen, naproxen) which can affect kidneys",
      "Follow up with a kidney function panel (GFR, BUN)",
    ],
    low: [
      "Ensure adequate protein intake in your diet",
      "Discuss with your doctor — low creatinine can reflect low muscle mass",
    ],
  },
  wbc: {
    high: [
      "High WBC can indicate infection, inflammation, or stress",
      "Rest and allow your body to recover if you are fighting an illness",
      "Follow up with your doctor to identify the underlying cause",
      "Reduce stress through relaxation techniques and adequate sleep",
    ],
    low: [
      "Avoid exposure to sick individuals — your immune system may be weakened",
      "Ensure adequate nutrition, especially vitamins B12, folate, and zinc",
      "Get adequate sleep (7–9 hours) to support immune function",
      "Discuss potential causes and follow-up testing with your doctor",
    ],
  },
  platelet: {
    high: [
      "Stay hydrated and maintain an active lifestyle",
      "Follow up to rule out underlying inflammatory conditions",
      "Discuss with your doctor — may need monitoring over time",
    ],
    low: [
      "Avoid activities with high risk of bruising or bleeding",
      "Limit alcohol intake which can suppress platelet production",
      "Eat foods rich in folate, B12, and iron to support production",
      "Report unusual bruising or bleeding to your doctor promptly",
    ],
  },
  rbc: {
    high: [
      "Stay well hydrated — dehydration can concentrate red blood cells",
      "Avoid smoking and limit high-altitude exposure if possible",
      "Follow up with your doctor to check for underlying conditions",
    ],
    low: [
      "Increase iron-rich foods: lean meats, beans, dark leafy greens",
      "Ensure adequate B12 and folate intake",
      "Discuss supplementation and further testing with your doctor",
    ],
  },
  alt: {
    high: [
      "Limit alcohol consumption to protect liver health",
      "Maintain a healthy weight — excess weight strains the liver",
      "Review all medications and supplements with your doctor for liver impact",
      "Increase antioxidant-rich foods: berries, leafy greens, green tea",
      "Follow up with a comprehensive liver panel",
    ],
    low: [],
  },
  ast: {
    high: [
      "Reduce alcohol intake and avoid unnecessary medications",
      "Exercise moderately — intense exercise can temporarily raise AST",
      "Maintain a balanced diet with adequate protein",
      "Follow up with additional liver function tests",
    ],
    low: [],
  },
  vitamin_d: {
    high: [
      "Reduce vitamin D supplementation if currently taking high doses",
      "Discuss appropriate dosage with your healthcare provider",
    ],
    low: [
      "Get 15–20 minutes of sunlight exposure daily when possible",
      "Consider vitamin D3 supplementation (1000–2000 IU/day typical)",
      "Include vitamin D rich foods: fatty fish, fortified milk, egg yolks",
      "Retest after 3 months of supplementation to check levels",
    ],
  },
  iron: {
    high: [
      "Limit red meat and iron-fortified foods temporarily",
      "Avoid vitamin C supplements with meals (enhances iron absorption)",
      "Get tested for hemochromatosis if persistently elevated",
      "Donate blood if eligible — this helps reduce iron stores",
    ],
    low: [
      "Eat more iron-rich foods: red meat, poultry, fish, lentils, spinach",
      "Pair iron sources with vitamin C (citrus, bell peppers) for better absorption",
      "Avoid drinking tea or coffee with meals",
      "Consider iron supplementation — consult your doctor for dosage",
      "Cook with cast iron cookware to increase dietary iron",
    ],
  },
};

/** Fallback recommendations when no specific match is found. */
const FALLBACK_RECOMMENDATIONS: { high: string[]; low: string[] } = {
  high: [
    "Schedule a follow-up test to confirm this result",
    "Discuss lifestyle modifications with your healthcare provider",
    "Review your current medications for potential interactions",
    "Maintain a balanced diet and regular exercise routine",
  ],
  low: [
    "Schedule a follow-up test to confirm this result",
    "Review your diet to ensure adequate nutrient intake",
    "Discuss potential supplementation with your doctor",
    "Get adequate rest and manage stress levels",
  ],
};

function getLabRecommendations(lab: LabValue): string[] {
  const name = lab.name.toLowerCase().replace(/[_\-\s]+/g, " ");
  const direction = lab.flag as "high" | "low";
  if (!direction) return [];

  for (const [key, recs] of Object.entries(LAB_RECOMMENDATIONS)) {
    if (name.includes(key.replace(/_/g, " "))) {
      if (recs[direction] && recs[direction].length > 0) return recs[direction];
    }
  }
  return FALLBACK_RECOMMENDATIONS[direction];
}

const STORAGE_KEY = "pulseai_bloodwork";

function loadSavedBloodwork(): BloodworkData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as BloodworkData;
  } catch { /* ignore corrupt data */ }
  return null;
}

function saveBloodwork(data: BloodworkData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage full — silently fail */ }
}

export function BloodWorkTab({ onResults }: { onResults?: (results: LabValue[]) => void }) {
  const [data, setData] = useState<BloodworkData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [filterView, setFilterView] = useState<"all" | "abnormal">("all");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved data on mount
  useEffect(() => {
    const saved = loadSavedBloodwork();
    if (saved) {
      setData(saved);
      onResults?.(saved.results);
      const cats = new Set(saved.results.map((r) => r.category));
      setActiveCategories(cats);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/bloodwork/parse", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const parsed: BloodworkData = await res.json();
      setData(parsed);
      saveBloodwork(parsed);
      onResults?.(parsed.results);

      // Initialize all categories as active
      const cats = new Set(parsed.results.map((r) => r.category));
      setActiveCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse bloodwork");
    } finally {
      setLoading(false);
    }
  }, [onResults]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  // Filtered results
  const filtered = data
    ? data.results.filter((r) => {
        if (filterView === "abnormal" && !r.flag) return false;
        if (activeCategories.size > 0 && !activeCategories.has(r.category)) return false;
        return true;
      })
    : [];

  const allCategories = data
    ? [...new Set(data.results.map((r) => r.category))].sort()
    : [];

  // Empty state — upload prompt
  if (!data && !loading) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={onInputChange}
            className="hidden"
          />

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Blood Work Analysis
            </h2>
            <p className="text-slate-400 text-sm">
              Upload your lab results PDF to see every value charted against normal ranges
            </p>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragging
                ? "border-teal-400 bg-teal-900/20"
                : "border-slate-700/50 hover:border-slate-600 bg-slate-800/20"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="text-slate-300 mb-1">
              Drop your bloodwork PDF here or <span className="text-teal-400 font-medium">browse files</span>
            </p>
            <p className="text-xs text-slate-600">PDF or TXT up to 10 MB</p>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center mt-4">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Parsing your lab results...</p>
          <p className="text-slate-600 text-xs mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Blood Work Results</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {data!.filename} &middot; {data!.results.length} values parsed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setData(null); setError(""); localStorage.removeItem(STORAGE_KEY); }}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Upload new
            </button>
          </div>
        </div>

        {/* Summary */}
        <SummaryCards results={data!.results} />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setFilterView("all")}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filterView === "all"
                ? "bg-teal-500 text-white"
                : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({data!.results.length})
          </button>
          <button
            onClick={() => setFilterView("abnormal")}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filterView === "abnormal"
                ? "bg-red-500/80 text-white"
                : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
            }`}
          >
            Abnormal ({data!.results.filter((r) => r.flag).length})
          </button>
        </div>

        <CategoryFilter
          categories={allCategories}
          active={activeCategories}
          onToggle={toggleCategory}
        />

        {/* Lab cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((lab) => (
            <LabCard key={lab.name} lab={lab} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-12">
            No results match current filters.
          </p>
        )}

        {/* Bottom spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}
