"use client";

import { useState, useEffect } from "react";
import { BmiCalculator } from "../BMI";
import { findAllergyInfo } from "../data/allergyData";
import { findVaccineInfo } from "../data/vaccineData";
import { findMedicationInfo } from "../data/medicationData";
import { findPeptideInfo } from "../data/peptideData";
import { findSteroidInfo } from "../data/steroidData";
import { findSupplementInfo } from "../data/supplementData";
import type { HealthProfile } from "../types";
import type { LabValue } from "../BloodWork";
import type { InfoPopup } from "./InfoModal";

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

export function HealthProfileSidebar({ profile, bloodworkLabs, onInfoClick }: { profile: HealthProfile | null; bloodworkLabs: LabValue[]; onInfoClick: (popup: InfoPopup) => void }) {
  const [sidebarPeptides, setSidebarPeptides] = useState<{ name: string; dosage: string; frequency: string }[]>([]);
  const [sidebarSteroids, setSidebarSteroids] = useState<{ name: string; dosage: string; frequency: string }[]>([]);
  const [sidebarSupplements, setSidebarSupplements] = useState<{ name: string; dosage: string; frequency: string }[]>([]);

  useEffect(() => {
    const loadItems = (key: string) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.map((p: { name: string; dosage?: number; unit?: string; frequency?: string }) => ({
            name: p.name,
            dosage: p.dosage ? `${p.dosage}${p.unit || "mcg"}` : "",
            frequency: p.frequency || "",
          }));
        }
      } catch { /* ignore */ }
      return [];
    };

    setSidebarPeptides(loadItems("pulseai_peptides"));
    setSidebarSteroids(loadItems("pulseai_steroids"));
    setSidebarSupplements(loadItems("pulseai_supplements"));

    const handleStorage = (e: StorageEvent) => {
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const items = parsed.map((p: { name: string; dosage?: number; unit?: string; frequency?: string }) => ({
            name: p.name,
            dosage: p.dosage ? `${p.dosage}${p.unit || "mcg"}` : "",
            frequency: p.frequency || "",
          }));
          if (e.key === "pulseai_peptides") setSidebarPeptides(items);
          else if (e.key === "pulseai_steroids") setSidebarSteroids(items);
          else if (e.key === "pulseai_supplements") setSidebarSupplements(items);
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

      {/* Steroids */}
      {sidebarSteroids.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Steroids
          </h3>
          <div className="space-y-1">
            {sidebarSteroids.map((s) => {
              const info = findSteroidInfo(s.name);
              return (
                <button
                  key={s.name}
                  onClick={() => { if (info) onInfoClick({ type: "steroid", data: info }); }}
                  className={`text-sm text-slate-300 text-left w-full rounded-lg px-2 py-1 -mx-2 transition-colors ${
                    info ? "hover:bg-slate-800/60 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="font-medium text-teal-400">{s.name}</span>{" "}
                  <span className="text-slate-500">{s.dosage}{s.frequency ? ` · ${s.frequency}` : ""}</span>
                  {info && <span className="ml-1 text-teal-400/60 text-xs">i</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Supplements */}
      {sidebarSupplements.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Supplements
          </h3>
          <div className="space-y-1">
            {sidebarSupplements.map((s) => {
              const info = findSupplementInfo(s.name);
              return (
                <button
                  key={s.name}
                  onClick={() => { if (info) onInfoClick({ type: "supplement", data: info }); }}
                  className={`text-sm text-slate-300 text-left w-full rounded-lg px-2 py-1 -mx-2 transition-colors ${
                    info ? "hover:bg-slate-800/60 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="font-medium text-teal-400">{s.name}</span>{" "}
                  <span className="text-slate-500">{s.dosage}{s.frequency ? ` · ${s.frequency}` : ""}</span>
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
                      {lab.flag === "high" ? " \u2191" : lab.flag === "low" ? " \u2193" : ""}
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
                  {lab.flag && (lab.flag === "high" ? " \u2191" : " \u2193")}
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
