"use client";

import { useState } from "react";
import type { Citation } from "../types";

export function CitationCard({
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
