"use client";

import type { AllergyInfo } from "../data/allergyData";
import type { VaccineInfo } from "../data/vaccineData";
import type { MedicationInfo } from "../data/medicationData";
import type { PeptideInfo } from "../data/peptideData";
import type { SteroidInfo } from "../data/steroidData";
import type { SupplementInfo } from "../data/supplementData";

export type InfoPopup =
  | { type: "allergy"; data: AllergyInfo }
  | { type: "vaccine"; data: VaccineInfo }
  | { type: "medication"; data: MedicationInfo }
  | { type: "peptide"; data: PeptideInfo }
  | { type: "steroid"; data: SteroidInfo }
  | { type: "supplement"; data: SupplementInfo };

export function InfoModal({ popup, onClose }: { popup: InfoPopup; onClose: () => void }) {
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
  } else if (popup.type === "steroid") {
    title = popup.data.name;
    sections = [
      { label: "What it is", text: popup.data.synopsis },
      { label: "What it does", text: popup.data.whatItDoes },
      { label: "How it works", text: popup.data.howItWorks },
    ];
  } else if (popup.type === "supplement") {
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
