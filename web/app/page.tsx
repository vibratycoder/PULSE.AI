"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BmiCalculator } from "./BMI";
import { BloodWorkTab, LabValue } from "./BloodWork";
import { FileUpload, AttachedFileChip } from "./FileUpload";
import { MedTrackerTab } from "./MedTracker";
import { VaccinesTab } from "./VaccinesTab";
import { useAuth } from "./auth-context";
import { findAllergyInfo, AllergyInfo } from "./allergyData";
import { findVaccineInfo, VaccineInfo } from "./vaccineData";
import { findMedicationInfo, MedicationInfo } from "./medicationData";
import { findPeptideInfo, PeptideInfo } from "./peptideData";

interface Citation {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  abstract: string;
}

interface LabResult {
  name: string;
  value: string;
  unit: string;
  flag: string;
  date_taken: string;
}

interface Medication {
  name: string;
  dosage: string;
}

interface Vaccine {
  name: string;
  date: string;
}

interface HealthProfile {
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

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  is_emergency?: boolean;
  fileName?: string;
}

function CitationCard({
  citation,
  index,
}: {
  citation: Citation;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="citation-card bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <span className="bg-teal-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200 leading-tight">
            {citation.title}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {citation.journal} ({citation.year}) &middot; PMID:{" "}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {citation.pmid}
            </a>
          </p>
          {expanded && citation.abstract && (
            <p className="text-xs text-slate-300 mt-2 leading-relaxed border-t border-slate-700 pt-2">
              {citation.abstract}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function findCbcLabs(labs: LabValue[] | undefined) {
  if (!labs || labs.length === 0) return [];
  const targets = [
    { aliases: ["white blood cell", "wbc"], display: "WBC" },
    { aliases: ["red blood cell", "rbc"], display: "RBC" },
    { aliases: ["platelet", "plt"], display: "Platelets" },
    { aliases: ["hemoglobin", "hgb", "hb"], display: "Hemoglobin" },
  ];
  const found: { display: string; lab: LabValue }[] = [];
  for (const t of targets) {
    const match = labs.find((l) =>
      t.aliases.some((a) => l.name.toLowerCase().includes(a))
    );
    if (match) found.push({ display: t.display, lab: match });
  }
  return found;
}

type InfoPopup =
  | { type: "allergy"; data: AllergyInfo }
  | { type: "vaccine"; data: VaccineInfo }
  | { type: "medication"; data: MedicationInfo }
  | { type: "peptide"; data: PeptideInfo };

function InfoModal({ popup, onClose }: { popup: InfoPopup; onClose: () => void }) {
  const isAllergy = popup.type === "allergy";

  let title = "";
  let sections: { label: string; text: string }[] = [];

  if (popup.type === "allergy") {
    title = popup.data.name;
    sections = [
      { label: "What it is", text: popup.data.synopsis },
      { label: "What it affects", text: popup.data.affects },
      { label: "How to avoid", text: popup.data.avoidance },
    ];
  } else if (popup.type === "vaccine") {
    title = popup.data.name;
    sections = [
      { label: "What it is", text: popup.data.synopsis },
      { label: "Protects against", text: popup.data.protectsAgainst },
      { label: "Why it matters", text: popup.data.value },
    ];
  } else if (popup.type === "medication") {
    title = popup.data.name;
    sections = [
      { label: "What it is", text: popup.data.synopsis },
      { label: "What it does", text: popup.data.whatItDoes },
      { label: "How it works", text: popup.data.howItWorks },
    ];
  } else {
    title = popup.data.name;
    sections = [
      { label: "What it is", text: popup.data.synopsis },
      { label: "What it does", text: popup.data.whatItDoes },
      { label: "How it works", text: popup.data.howItWorks },
    ];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#111d30] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/60 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isAllergy ? "text-red-400/70" : "text-teal-400/70"}`}>
              {popup.type}
            </p>
            <h3 className={`text-lg font-bold ${isAllergy ? "text-red-300" : "text-teal-300"}`}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xl leading-none p-1 -mr-1 -mt-1"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4 text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
          {sections.map((s) => (
            <div key={s.label}>
              <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-1">{s.label}</p>
              <p className="text-slate-300">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthProfileSidebar({ profile, bloodworkLabs, onInfoClick }: { profile: HealthProfile | null; bloodworkLabs: LabValue[]; onInfoClick: (popup: InfoPopup) => void }) {
  const [sidebarPeptides, setSidebarPeptides] = useState<{ name: string; dosage: string; frequency: string }[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pulseai_peptides");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSidebarPeptides(
          parsed.map((p: { name: string; dosage?: number; unit?: string; frequency?: string }) => ({
            name: p.name,
            dosage: p.dosage ? `${p.dosage}${p.unit || "mcg"}` : "",
            frequency: p.frequency || "",
          }))
        );
      }
    } catch { /* ignore */ }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pulseai_peptides" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSidebarPeptides(
            parsed.map((p: { name: string; dosage?: number; unit?: string; frequency?: string }) => ({
              name: p.name,
              dosage: p.dosage ? `${p.dosage}${p.unit || "mcg"}` : "",
              frequency: p.frequency || "",
            }))
          );
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!profile || !profile.name) return null;

  const cbcLabs = findCbcLabs(bloodworkLabs);
  const abnormalCount = bloodworkLabs.length > 0
    ? bloodworkLabs.filter((l) => l.flag).length
    : profile.lab_results.filter((l) => l.flag).length;

  return (
    <div className="w-72 bg-[#0a1628] border-r border-slate-800/50 hidden lg:flex flex-col">
      {/* Profile header — sticky */}
      <div className="sticky top-0 z-10 bg-[#0a1628] px-4 pt-5 pb-4 border-b border-slate-800/50">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-1">
          Pulse.ai knows your health
        </p>
        <h2 className="text-lg font-bold text-white">{profile.name}</h2>
        <p className="text-xs text-slate-400">
          {profile.age} y/o &middot; {profile.sex}
        </p>
        <p className="text-xs text-slate-500">
          {Math.floor(profile.height_cm / 30.48)}ft {Math.round((profile.height_cm / 2.54) % 12)}in &middot; {Math.round(profile.weight_kg * 2.205)}lbs
        </p>

        {/* Stat boxes */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-slate-800/60 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{profile.conditions.length}</p>
            <p className="text-[10px] text-slate-400">conditions</p>
          </div>
          <div className="flex-1 bg-slate-800/60 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{profile.medications.length}</p>
            <p className="text-[10px] text-slate-400">meds</p>
          </div>
          <div className="flex-1 bg-slate-800/60 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{abnormalCount}</p>
            <p className="text-[10px] text-slate-400">abnormal</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

      {/* BMI Calculator */}
      <BmiCalculator heightCm={profile.height_cm} weightKg={profile.weight_kg} />

      {/* Conditions */}
      {profile.conditions.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Conditions
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.conditions.map((c) => (
              <span
                key={c}
                className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-full"
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {profile.medications.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Medications
          </h3>
          <div className="space-y-1">
            {profile.medications.map((m) => {
              const info = findMedicationInfo(m.name);
              return (
                <button
                  key={m.name}
                  onClick={() => { if (info) onInfoClick({ type: "medication", data: info }); }}
                  className={`text-sm text-slate-300 text-left w-full rounded-lg px-2 py-1 -mx-2 transition-colors ${
                    info ? "hover:bg-slate-800/60 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="font-medium text-teal-400">{m.name.charAt(0).toUpperCase() + m.name.slice(1)}</span>{" "}
                  <span className="text-slate-500">{m.dosage}</span>
                  {info && <span className="ml-1 text-teal-400/60 text-xs">i</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Peptides */}
      {sidebarPeptides.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Peptides
          </h3>
          <div className="space-y-1">
            {sidebarPeptides.map((p) => {
              const info = findPeptideInfo(p.name);
              return (
                <button
                  key={p.name}
                  onClick={() => { if (info) onInfoClick({ type: "peptide", data: info }); }}
                  className={`text-sm text-slate-300 text-left w-full rounded-lg px-2 py-1 -mx-2 transition-colors ${
                    info ? "hover:bg-slate-800/60 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="font-medium text-teal-400">{p.name}</span>{" "}
                  <span className="text-slate-500">{p.dosage}{p.frequency ? ` \u00b7 ${p.frequency}` : ""}</span>
                  {info && <span className="ml-1 text-teal-400/60 text-xs">i</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Allergies */}
      {profile.allergies.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Allergies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.allergies.map((a) => {
              const info = findAllergyInfo(a);
              return (
                <button
                  key={a}
                  onClick={() => { if (info) onInfoClick({ type: "allergy", data: info }); }}
                  className={`text-xs border px-2.5 py-1 rounded-full transition-colors ${
                    info
                      ? "bg-red-900/40 text-red-300 border-red-800/50 hover:bg-red-900/60 hover:border-red-700/60 cursor-pointer"
                      : "bg-red-900/40 text-red-300 border-red-800/50 cursor-default"
                  }`}
                >
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                  {info && <span className="ml-1 text-red-400/60">i</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vaccines */}
      {profile.vaccines && profile.vaccines.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Vaccines
          </h3>
          <div className="space-y-1.5">
            {profile.vaccines.map((v) => {
              const info = findVaccineInfo(v.name);
              return (
                <button
                  key={v.name + v.date}
                  onClick={() => { if (info) onInfoClick({ type: "vaccine", data: info }); }}
                  className={`flex justify-between items-center text-sm w-full text-left rounded-lg px-2 py-1 -mx-2 transition-colors ${
                    info ? "hover:bg-slate-800/60 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="text-slate-300">
                    {v.name}
                    {info && <span className="ml-1 text-teal-400/60 text-xs">i</span>}
                  </span>
                  <span className="text-xs text-slate-500">{v.date}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Labs — from bloodwork PDF when available */}
      {cbcLabs.length > 0 ? (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Recent Labs
          </h3>
          <div className="space-y-2">
            {cbcLabs.map(({ display, lab }) => {
              const pct = lab.normal_high > lab.normal_low
                ? Math.max(0, Math.min(100, ((lab.value - lab.normal_low) / (lab.normal_high - lab.normal_low)) * 100))
                : 50;
              return (
                <div key={display}>
                  <div className="flex justify-between items-center text-sm mb-0.5">
                    <span className="text-slate-400">{display}</span>
                    <span
                      className={`font-mono text-xs ${
                        lab.flag === "high"
                          ? "text-red-400"
                          : lab.flag === "low"
                          ? "text-amber-400"
                          : "text-green-400"
                      }`}
                    >
                      {lab.value} {lab.unit}
                      {lab.flag === "high" ? " ↑" : lab.flag === "low" ? " ↓" : ""}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        lab.flag === "high"
                          ? "bg-red-500"
                          : lab.flag === "low"
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                    <span>{lab.normal_low}</span>
                    <span>{lab.normal_high}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : profile.lab_results.length > 0 ? (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Recent Labs
          </h3>
          <div className="space-y-1.5">
            {profile.lab_results.map((lab) => (
              <div key={lab.name} className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{lab.name}</span>
                <span
                  className={`font-mono text-xs ${
                    lab.flag === "high"
                      ? "text-red-400"
                      : lab.flag === "low"
                      ? "text-amber-400"
                      : "text-green-400"
                  }`}
                >
                  {lab.value} {lab.unit}
                  {lab.flag && (lab.flag === "high" ? " ↑" : " ↓")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Family History */}
      {profile.family_history.length > 0 && (
        <div className="px-4 py-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Family History
          </h3>
          {profile.family_history.map((f) => (
            <p key={f} className="text-sm text-slate-400">{f}</p>
          ))}
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-32" />

      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-teal-400 rounded-full" />
    </div>
  );
}

function WordBankSection({
  title,
  suggestions,
  items,
  onUpdate,
  addLabel,
  placeholder,
}: {
  title: string;
  suggestions: string[];
  items: string[];
  onUpdate: (items: string[]) => void;
  addLabel: string;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      onUpdate([...items, trimmed]);
    }
  };

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-teal-400">{title}</h3>

      {/* Word bank suggestions */}
      <div>
        <p className="text-[10px] text-slate-600 mb-2">Common {title.toLowerCase()} — click to add</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => {
            const isAdded = items.some((i) => i.toLowerCase() === s.toLowerCase());
            return (
              <button
                key={s}
                onClick={() => addItem(s)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  isAdded
                    ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                    : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                {isAdded ? `${s} +` : s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current items */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-1 text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-2.5 py-1 rounded-full"
            >
              {item}
              <button
                onClick={() => removeItem(i)}
                className="text-slate-500 hover:text-red-400 transition-colors ml-0.5"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new button / input */}
      {showInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newItem.trim()) {
                addItem(newItem);
                setNewItem("");
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
            autoFocus
          />
          <button
            onClick={() => {
              if (newItem.trim()) {
                addItem(newItem);
                setNewItem("");
              }
              setShowInput(false);
            }}
            className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => { setShowInput(false); setNewItem(""); }}
            className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          <span className="text-base leading-none">+</span> {addLabel}
        </button>
      )}
    </div>
  );
}

function EditProfileView({
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

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [infoPopup, setInfoPopup] = useState<InfoPopup | null>(null);
  const userId = user?.id || "demo-marcus-chen";
  const [fileText, setFileText] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [bloodworkLabs, setBloodworkLabs] = useState<LabValue[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("pulseai_bloodwork");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // BloodWork.tsx stores { filename, results, raw_text }
      return Array.isArray(parsed) ? parsed : parsed?.results ?? [];
    } catch { return []; }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBloodworkResults = useCallback((results: LabValue[]) => {
    setBloodworkLabs(results);
  }, []);

  const handleFileText = useCallback((text: string, filename: string) => {
    setFileText(text);
    setAttachedFile(filename);
    setShowUploadZone(false);
  }, []);

  const clearFile = useCallback(() => {
    setFileText("");
    setAttachedFile(null);
  }, []);

  const [inputDragOver, setInputDragOver] = useState(false);
  const dragLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputDragHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
        dragLeaveTimer.current = null;
      }
      setInputDragOver(true);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      // Delay so moving between child elements doesn't flicker
      dragLeaveTimer.current = setTimeout(() => setInputDragOver(false), 50);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
        dragLeaveTimer.current = null;
      }
      // Don't hide immediately — FileUpload's onDrop will call handleFileText
      // which sets attachedFile, hiding the drop zone naturally
      setTimeout(() => setInputDragOver(false), 100);
    },
  };

  useEffect(() => {
    // Load saved profile from localStorage — if it exists, trust it as source of truth
    try {
      const saved = localStorage.getItem("pulseai_profile");
      if (saved) {
        setProfile(JSON.parse(saved));
        return; // User has a saved profile — don't overwrite with backend data
      }
    } catch { /* ignore */ }

    // No local profile — fetch from backend
    fetch(`/api/profile/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
          localStorage.setItem("pulseai_profile", JSON.stringify(data));
        }
      })
      .catch(() => {
        // Backend unreachable — load demo as fallback
        fetch("/api/profile/demo-marcus-chen")
          .then((r) => r.json())
          .then((data) => {
            if (data && data.name) {
              setProfile(data);
              localStorage.setItem("pulseai_profile", JSON.stringify(data));
            }
          })
          .catch(() => {});
      });
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearChat = () => setMessages([]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, fileName: attachedFile || undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body: Record<string, string> = { message: text, user_id: userId };
      if (fileText) body.file_text = fileText;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      clearFile();
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || data.detail || "Something went wrong.",
          citations: data.citations || [],
          is_emergency: data.is_emergency || false,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to the server. Make sure the backend is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1929]">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b1929]">
      {/* Health profile sidebar — LEFT side */}
      <HealthProfileSidebar profile={profile} bloodworkLabs={bloodworkLabs} onInfoClick={setInfoPopup} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative" {...inputDragHandlers}>
        {/* Top nav bar */}
        <header className="border-b border-slate-800/50 px-6 py-3 flex items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {["Chat", "Blood Work", "Med Tracker", "Vaccines"].map((tab) => {
              const tabKey = tab.toLowerCase().replace(/ /g, "-");
              const isActive = activeTab === tabKey || (tab === "Chat" && activeTab === "chat");
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Action links */}
          <div className="flex items-center gap-4">
            <button
              onClick={clearChat}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Clear chat
            </button>
            <button
              onClick={() => setShowEditProfile((v) => !v)}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Edit profile
            </button>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Edit Profile view */}
        {showEditProfile && (
          <EditProfileView
            profile={profile}
            onSave={(updated) => { setProfile(updated); setShowEditProfile(false); localStorage.setItem("pulseai_profile", JSON.stringify(updated)); }}
            onCancel={() => setShowEditProfile(false)}
          />
        )}

        {/* Blood Work tab */}
        {!showEditProfile && activeTab === "blood-work" && <BloodWorkTab onResults={handleBloodworkResults} />}

        {/* Med Tracker tab */}
        {!showEditProfile && activeTab === "med-tracker" && (
          <MedTrackerTab
            medications={profile?.medications || []}
            onUpdateMedications={(meds) => {
              if (profile) {
                const updated = { ...profile, medications: meds };
                setProfile(updated);
                localStorage.setItem("pulseai_profile", JSON.stringify(updated));
              }
            }}
          />
        )}

        {/* Vaccines tab */}
        {!showEditProfile && activeTab === "vaccines" && (
          <VaccinesTab
            vaccines={profile?.vaccines || []}
            onUpdate={(vaccines) => {
              if (profile) {
                const updated = { ...profile, vaccines };
                setProfile(updated);
                localStorage.setItem("pulseai_profile", JSON.stringify(updated));
              }
            }}
          />
        )}

        {/* Chat tab */}
        {!showEditProfile && activeTab === "chat" && (
          <>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Ask anything about your health
                  </h2>
                  <p className="text-slate-400 max-w-md mb-8 text-sm">
                    Try: &ldquo;What does my LDL of 158 mean?&rdquo; or attach a photo of your lab results
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i}>
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-teal-600/80 text-white"
                          : msg.is_emergency
                          ? "bg-red-900/50 border border-red-700 text-red-100"
                          : "bg-slate-800/50 text-slate-200"
                      }`}
                    >
                      {msg.fileName && (
                        <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 bg-white/10 rounded-lg w-fit">
                          {msg.fileName.toLowerCase().endsWith(".pdf") ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          )}
                          <div>
                            <p className="text-xs font-medium truncate max-w-[180px]">{msg.fileName}</p>
                            <p className="text-[10px] opacity-70">{msg.fileName.split(".").pop()?.toUpperCase()} attached</p>
                          </div>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 ml-0 space-y-2 max-w-2xl">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Sources
                      </p>
                      {msg.citations.map((cite, j) => (
                        <CitationCard key={cite.pmid} citation={cite} index={j} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-6 py-4">
              <div className="max-w-3xl mx-auto space-y-3">

                {/* Drop zone — shows on drag-over or button toggle, only when no file attached */}
                {(showUploadZone || inputDragOver) && !attachedFile && (
                  <FileUpload onFileText={handleFileText} onClear={clearFile} attachedFile={attachedFile} initialDragging={inputDragOver} />
                )}

                {/* Attached file chip — shown above text input when a file is ready */}
                {attachedFile && (
                  <AttachedFileChip filename={attachedFile} onClear={clearFile} />
                )}

                {/* Text input bar */}
                <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3">
                  {/* Attachment button */}
                  <button
                    onClick={() => setShowUploadZone((v) => !v)}
                    className={`transition-colors p-1 ${attachedFile ? "text-teal-400" : "text-slate-500 hover:text-slate-300"}`}
                    title="Attach file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={attachedFile ? "Ask a question about your document..." : "Ask about your labs, symptoms, medications..."}
                    className="flex-1 bg-transparent py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                    disabled={loading}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-600">
                  Enter to send &middot; Pulse.ai is not a substitute for professional medical advice
                </p>
              </div>
            </div>
          </>
        )}


      </div>

      {/* Info popup modal */}
      {infoPopup && (
        <InfoModal popup={infoPopup} onClose={() => setInfoPopup(null)} />
      )}

    </div>
  );
}
