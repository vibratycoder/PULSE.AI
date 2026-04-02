"use client";

import { useState } from "react";
import { findVaccineInfo, VaccineInfo } from "./data/vaccineData";
import type { Vaccine } from "./types";

const COMMON_VACCINES = [
  "COVID-19",
  "Flu (Influenza)",
  "Tdap",
  "Shingles",
  "Pneumonia",
  "Hepatitis A",
  "Hepatitis B",
  "HPV",
  "MMR",
  "Meningococcal",
  "Varicella",
  "Polio",
];

export function VaccinesTab({
  vaccines,
  onUpdate,
}: {
  vaccines: Vaccine[];
  onUpdate: (vaccines: Vaccine[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [expandedVaccine, setExpandedVaccine] = useState<string | null>(null);

  const inputClass =
    "w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors";

  const addVaccine = (name: string, date: string) => {
    onUpdate([...vaccines, { name, date }]);
  };

  const removeVaccine = (index: number) => {
    onUpdate(vaccines.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addVaccine(newName.trim(), newDate);
    setNewName("");
    setNewDate("");
    setAdding(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white">Vaccine Records</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track your vaccination history
          </p>
        </div>

        {/* Quick-add word bank */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-teal-400 mb-3">
            Common Vaccines
          </h3>
          <p className="text-[10px] text-slate-600 mb-2">
            Click to add a vaccine record
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_VACCINES.map((vax) => {
              const isAdded = vaccines.some(
                (v) => v.name.toLowerCase() === vax.toLowerCase()
              );
              return (
                <button
                  key={vax}
                  onClick={() => {
                    if (!isAdded) {
                      setNewName(vax);
                      setAdding(true);
                    }
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    isAdded
                      ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                      : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600"
                  }`}
                >
                  {isAdded ? `${vax} \u2713` : vax}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vaccine list */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-teal-400 mb-3">
            Your Vaccines
          </h3>

          {vaccines.length === 0 && !adding && (
            <p className="text-sm text-slate-500">
              No vaccines recorded yet. Add one above or click the button below.
            </p>
          )}

          {vaccines.length > 0 && (
            <div className="space-y-2 mb-4">
              {vaccines.map((v, i) => (
                <div
                  key={`${v.name}-${i}`}
                  className="bg-slate-800/40 border border-slate-700/30 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => {
                        const info = findVaccineInfo(v.name);
                        if (info) setExpandedVaccine(expandedVaccine === v.name ? null : v.name);
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-slate-200">
                        {v.name}
                        {findVaccineInfo(v.name) && (
                          <span className="ml-1.5 text-teal-400/60 text-xs">i</span>
                        )}
                      </p>
                      {v.date && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {v.date}
                        </p>
                      )}
                    </button>
                    <button
                      onClick={() => removeVaccine(i)}
                      className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none ml-3"
                    >
                      &times;
                    </button>
                  </div>
                  {expandedVaccine === v.name && (() => {
                    const info = findVaccineInfo(v.name);
                    if (!info) return null;
                    return (
                      <div className="px-4 pb-3 pt-0 border-t border-slate-700/20 space-y-2">
                        <div className="pt-2">
                          <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-0.5">What it is</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{info.synopsis}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-0.5">Protects against</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{info.protectsAgainst}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-0.5">Why it matters</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{info.value}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {adding && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4 mb-3 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. COVID-19 (Pfizer)"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Date Administered
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add Vaccine
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewName("");
                    setNewDate("");
                  }}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="w-full py-2.5 border border-dashed border-slate-700/50 rounded-lg text-sm text-slate-500 hover:text-teal-400 hover:border-teal-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-base leading-none">+</span> Add vaccine
              record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
