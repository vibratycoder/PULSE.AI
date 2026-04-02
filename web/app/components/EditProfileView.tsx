"use client";

import { useState } from "react";
import type { HealthProfile } from "../types";
import { WordBankSection } from "./WordBankSection";

export function EditProfileView({
  profile,
  onSave,
  onCancel,
}: {
  profile: HealthProfile | null;
  onSave: (profile: HealthProfile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [sex, setSex] = useState(profile?.sex || "male");
  const [feet, setFeet] = useState(() => {
    if (!profile) return "5";
    const totalInches = profile.height_cm / 2.54;
    return Math.floor(totalInches / 12).toString();
  });
  const [inches, setInches] = useState(() => {
    if (!profile) return "9";
    const totalInches = profile.height_cm / 2.54;
    return Math.round(totalInches % 12).toString();
  });
  const [lbs, setLbs] = useState(() => {
    if (!profile) return "160";
    return Math.round(profile.weight_kg * 2.205).toString();
  });
  const [conditions, setConditions] = useState(profile?.conditions?.join(", ") || "");
  const [allergies, setAllergies] = useState(profile?.allergies?.join(", ") || "");
  const [familyHistory, setFamilyHistory] = useState(profile?.family_history?.join(", ") || "");
  const [lifestyleNotes, setLifestyleNotes] = useState(profile?.lifestyle_notes?.join(", ") || "");
  const [healthGoals, setHealthGoals] = useState(profile?.health_goals?.join(", ") || "");
  const [meds, setMeds] = useState<{ name: string; amount: string; unit: string; frequency: string }[]>(
    profile?.medications?.map((m) => {
      const match = m.dosage.match(/^([\d.]+)\s*(mg|ml|g|mcg|IU)\s*(.*)/i);
      return {
        name: m.name,
        amount: match ? match[1] : "",
        unit: match ? match[2].toLowerCase() : "mg",
        frequency: match ? match[3] : m.dosage,
      };
    }) || []
  );
  const handleSave = () => {
    const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
    const heightCm = totalInches * 2.54;
    const weightKg = (parseInt(lbs) || 0) / 2.205;

    const medications = meds
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        dosage: m.amount ? `${m.amount}${m.unit} ${m.frequency}`.trim() : m.frequency,
      }));

    const updated: HealthProfile = {
      user_id: profile?.user_id || "custom",
      name: name || "User",
      age: parseInt(age) || 0,
      sex,
      height_cm: Math.round(heightCm),
      weight_kg: Math.round(weightKg * 10) / 10,
      conditions: conditions.split(",").map((s) => s.trim()).filter(Boolean),
      medications,
      allergies: allergies.split(",").map((s) => s.trim()).filter(Boolean),
      family_history: familyHistory.split(",").map((s) => s.trim()).filter(Boolean),
      lifestyle_notes: lifestyleNotes.split(",").map((s) => s.trim()).filter(Boolean),
      lab_results: profile?.lab_results || [],
      vaccines: profile?.vaccines || [],
      health_goals: healthGoals.split(",").map((s) => s.trim()).filter(Boolean),
    };
    onSave(updated);
  };

  const inputClass = "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors";
  const labelClass = "text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block";

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Health Profile</h2>
            <p className="text-xs text-slate-500 mt-1">Update your information to get personalized health insights</p>
          </div>
          <button
            onClick={onCancel}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-teal-400">Personal Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Sex</label>
              <div className="flex gap-2">
                {["male", "female", "other"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSex(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sex === s
                        ? "bg-teal-500 text-white"
                        : "bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-200"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Height (ft)</label>
                <input
                  type="number"
                  value={feet}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setFeet(Math.max(0, Math.min(8, val)).toString());
                  }}
                  min={0}
                  max={8}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Height (in)</label>
                <input
                  type="number"
                  value={inches}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const ft = parseInt(feet) || 0;
                    if (val > 11) {
                      setFeet(Math.min(8, ft + 1).toString());
                      setInches("0");
                    } else if (val < 0 && ft > 0) {
                      setFeet((ft - 1).toString());
                      setInches("11");
                    } else {
                      setInches(Math.max(0, Math.min(11, val)).toString());
                    }
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Weight (lbs)</label>
                <input
                  type="number"
                  value={lbs}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setLbs(Math.max(0, Math.min(999, val)).toString());
                  }}
                  min={0}
                  max={999}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Conditions */}
          <WordBankSection
            title="Conditions"
            suggestions={["Hypertension", "Type 2 Diabetes", "Prediabetes", "Asthma", "GERD", "Hypothyroidism", "High Cholesterol", "Anxiety", "Depression", "Arthritis", "Sleep Apnea", "Migraines", "COPD", "Anemia", "Obesity"]}
            items={conditions.split(",").map((s) => s.trim()).filter(Boolean)}
            onUpdate={(items) => setConditions(items.join(", "))}
            addLabel="Add new condition"
            placeholder="e.g. Fibromyalgia"
          />

          {/* Allergies */}
          <WordBankSection
            title="Allergies"
            suggestions={["Penicillin", "Sulfa drugs", "Aspirin", "Ibuprofen", "Latex", "Shellfish", "Peanuts", "Tree nuts", "Eggs", "Dairy", "Gluten", "Soy", "Bee stings", "Pollen", "Dust mites"]}
            items={allergies.split(",").map((s) => s.trim()).filter(Boolean)}
            onUpdate={(items) => setAllergies(items.join(", "))}
            addLabel="Add new allergy"
            placeholder="e.g. Codeine"
          />

          {/* Family History */}
          <WordBankSection
            title="Family History"
            suggestions={["Heart attack", "Stroke", "Type 2 Diabetes", "Breast cancer", "Colon cancer", "Lung cancer", "Alzheimer's", "High blood pressure", "High cholesterol", "Osteoporosis", "Autoimmune disease", "Mental illness", "Kidney disease"]}
            items={familyHistory.split(",").map((s) => s.trim()).filter(Boolean)}
            onUpdate={(items) => setFamilyHistory(items.join(", "))}
            addLabel="Add new family history"
            placeholder="e.g. Parkinson's (grandfather)"
          />

          {/* Medications */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-teal-400">Medications</h3>

            {/* Word bank */}
            <div>
              <p className="text-[10px] text-slate-600 mb-2">Common medications — click to add</p>
              <div className="flex flex-wrap gap-1.5">
                {["Lisinopril", "Metformin", "Atorvastatin", "Amlodipine", "Omeprazole", "Losartan", "Levothyroxine", "Albuterol", "Gabapentin", "Sertraline", "Metoprolol", "Ibuprofen"].map((med) => {
                  const isAdded = meds.some((m) => m.name.toLowerCase() === med.toLowerCase());
                  return (
                    <button
                      key={med}
                      onClick={() => {
                        if (!isAdded) {
                          setMeds([...meds, { name: med, amount: "", unit: "mg", frequency: "daily" }]);
                        }
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        isAdded
                          ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                          : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600"
                      }`}
                    >
                      {isAdded ? `${med} +` : med}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medication rows */}
            {meds.length > 0 && (
              <div className="space-y-2">
                {meds.map((med, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 rounded-lg p-2.5">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i] = { ...med, name: e.target.value };
                        setMeds(updated);
                      }}
                      placeholder="Name"
                      className="flex-1 min-w-0 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={med.amount}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i] = { ...med, amount: e.target.value };
                        setMeds(updated);
                      }}
                      placeholder="0"
                      className="w-16 bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-sm text-slate-200 text-center focus:outline-none focus:border-teal-500/50"
                    />
                    <select
                      value={med.unit}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i] = { ...med, unit: e.target.value };
                        setMeds(updated);
                      }}
                      className="bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
                    >
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="mcg">mcg</option>
                      <option value="IU">IU</option>
                    </select>
                    <select
                      value={med.frequency}
                      onChange={(e) => {
                        const updated = [...meds];
                        updated[i] = { ...med, frequency: e.target.value };
                        setMeds(updated);
                      }}
                      className="bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
                    >
                      <option value="daily">daily</option>
                      <option value="twice daily">twice daily</option>
                      <option value="3x daily">3x daily</option>
                      <option value="weekly">weekly</option>
                      <option value="as needed">as needed</option>
                      <option value="at bedtime">at bedtime</option>
                    </select>
                    <button
                      onClick={() => setMeds(meds.filter((_, j) => j !== i))}
                      className="text-slate-500 hover:text-red-400 transition-colors shrink-0 p-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new medication button */}
            <button
              onClick={() => setMeds([...meds, { name: "", amount: "", unit: "mg", frequency: "daily" }])}
              className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              <span className="text-base leading-none">+</span> Add new medication
            </button>
          </div>

          {/* Lifestyle Notes */}
          <WordBankSection
            title="Lifestyle Notes"
            suggestions={["Exercises 3x/week", "Sedentary job", "Vegetarian", "Vegan", "Keto diet", "Smokes", "Former smoker", "Social drinker", "No alcohol", "Sleeps 6 hours", "Sleeps 8 hours", "High stress", "Meditation/yoga", "Night shift worker"]}
            items={lifestyleNotes.split(",").map((s) => s.trim()).filter(Boolean)}
            onUpdate={(items) => setLifestyleNotes(items.join(", "))}
            addLabel="Add new lifestyle note"
            placeholder="e.g. Walks 10k steps daily"
          />

          {/* Health Goals */}
          <WordBankSection
            title="Health Goals"
            suggestions={["Lose weight", "Build muscle", "Reduce cardiovascular risk", "Lower blood sugar", "Lower cholesterol", "Improve sleep", "Reduce stress", "Quit smoking", "Eat healthier", "Run a 5K", "Manage chronic pain", "Improve mental health"]}
            items={healthGoals.split(",").map((s) => s.trim()).filter(Boolean)}
            onUpdate={(items) => setHealthGoals(items.join(", "))}
            addLabel="Add new goal"
            placeholder="e.g. Lower blood pressure naturally"
          />

          {/* Save button */}
          <div className="flex gap-3 pt-2 pb-8">
            <button
              onClick={handleSave}
              className="flex-1 bg-teal-500 hover:bg-teal-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Save Profile
            </button>
            <button
              onClick={onCancel}
              className="px-6 bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
