"use client";

import { useState, useEffect } from "react";

interface BmiCategory {
  label: string;
  color: string;
  position: number;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400", position: (bmi / 40) * 100 };
  if (bmi < 25) return { label: "Normal", color: "text-green-400", position: (bmi / 40) * 100 };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-400", position: (bmi / 40) * 100 };
  return { label: "Obese", color: "text-red-400", position: Math.min((bmi / 40) * 100, 95) };
}

export function calculateBmi(heightCm: number, weightKg: number): number {
  if (heightCm <= 0) return 0;
  return weightKg / (heightCm / 100) ** 2;
}

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.205);
}

function lbsToKg(lbs: number): number {
  return lbs / 2.205;
}

export function BmiCalculator({
  heightCm,
  weightKg,
}: {
  heightCm: number;
  weightKg: number;
}) {
  const initial = cmToFeetInches(heightCm);
  const [feet, setFeet] = useState(initial.feet);
  const [inches, setInches] = useState(initial.inches);
  const [lbs, setLbs] = useState(kgToLbs(weightKg));

  // Sync if profile changes
  useEffect(() => {
    const converted = cmToFeetInches(heightCm);
    setFeet(converted.feet);
    setInches(converted.inches);
    setLbs(kgToLbs(weightKg));
  }, [heightCm, weightKg]);

  const currentCm = feetInchesToCm(feet, inches);
  const currentKg = lbsToKg(lbs);
  const bmiNum = calculateBmi(currentCm, currentKg);
  const bmi = bmiNum.toFixed(1);
  const bmiInfo = getBmiCategory(bmiNum);

  const isModified =
    feet !== cmToFeetInches(heightCm).feet ||
    inches !== cmToFeetInches(heightCm).inches ||
    lbs !== kgToLbs(weightKg);

  const reset = () => {
    const orig = cmToFeetInches(heightCm);
    setFeet(orig.feet);
    setInches(orig.inches);
    setLbs(kgToLbs(weightKg));
  };

  return (
    <div className="px-4 py-4 border-b border-slate-800/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          BMI Calculator
        </h3>
        {isModified && (
          <button
            onClick={reset}
            className="text-[10px] text-teal-400 hover:text-teal-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-slate-800/60 rounded px-2 py-1.5 text-center">
          <label className="text-xs text-slate-400">ft</label>
          <input
            type="number"
            value={feet}
            onChange={(e) => setFeet(Math.max(0, Math.min(8, parseInt(e.target.value) || 0)))}
            className="w-full bg-transparent text-sm font-semibold text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
            min={0}
            max={8}
          />
        </div>
        <div className="flex-1 bg-slate-800/60 rounded px-2 py-1.5 text-center">
          <label className="text-xs text-slate-400">in</label>
          <input
            type="number"
            value={inches}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              if (val > 11) {
                setFeet((f) => Math.min(8, f + 1));
                setInches(0);
              } else if (val < 0 && feet > 0) {
                setFeet((f) => f - 1);
                setInches(11);
              } else {
                setInches(Math.max(0, Math.min(11, val)));
              }
            }}
            className="w-full bg-transparent text-sm font-semibold text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
          />
        </div>
        <div className="flex-1 bg-slate-800/60 rounded px-2 py-1.5 text-center">
          <label className="text-xs text-slate-400">lbs</label>
          <input
            type="number"
            value={lbs}
            onChange={(e) => setLbs(Math.max(0, Math.min(999, parseInt(e.target.value) || 0)))}
            className="w-full bg-transparent text-sm font-semibold text-white text-center focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
            min={0}
            max={999}
          />
        </div>
      </div>

      <p className={`text-3xl font-bold ${bmiInfo.color}`}>{bmi}</p>
      <p className={`text-sm font-medium ${bmiInfo.color} mb-2`}>{bmiInfo.label}</p>

      {/* BMI bar */}
      <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-green-500 via-50% via-yellow-500 to-red-500">
        <div
          className="absolute top-0 w-1 h-full bg-white rounded-full shadow-sm transition-all duration-300"
          style={{ left: `${bmiInfo.position}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-500 mt-1">
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
      </div>
    </div>
  );
}
