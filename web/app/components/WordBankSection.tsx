"use client";

import { useState } from "react";

export function WordBankSection({
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
