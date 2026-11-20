import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const VERDICT_STYLES = {
  SUPPORTED: "bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-emerald-950/50",
  CONTRADICTED: "bg-rose-950/80 border-rose-500 text-rose-200 shadow-rose-950/50",
  INSUFFICIENT_EVIDENCE: "bg-amber-950/80 border-amber-500 text-amber-200 shadow-amber-950/50",
  ANSWER: "bg-indigo-950/90 border-indigo-500 text-indigo-100 shadow-indigo-950/50",
  EVIDENCE: "bg-slate-900/90 border-slate-700 text-slate-300 shadow-slate-950/50",
};

const VERDICT_BADGES = {
  SUPPORTED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CONTRADICTED: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  INSUFFICIENT_EVIDENCE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export const ClaimNode = memo(({ data }) => {
  const nodeType = data.type || "CLAIM";
  const styleKey = nodeType === "CLAIM" ? data.verdict : nodeType;
  const cardStyle = VERDICT_STYLES[styleKey] || VERDICT_STYLES.EVIDENCE;

  return (
    <div
      className={`px-3.5 py-3 rounded-xl border shadow-xl transition-all duration-200 w-[230px] text-xs cursor-pointer hover:scale-105 ${cardStyle}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />

      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="font-semibold text-[10px] tracking-wider uppercase opacity-75">
          {data.label || nodeType}
        </span>
        {data.verdict && VERDICT_BADGES[data.verdict] && (
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${VERDICT_BADGES[data.verdict]}`}>
            {data.verdict === "INSUFFICIENT_EVIDENCE" ? "ABSTAINED" : data.verdict}
          </span>
        )}
      </div>

      <p className="line-clamp-3 leading-relaxed font-normal text-slate-200">
        {data.text}
      </p>

      {data.confidence !== undefined && data.confidence > 0 && (
        <div className="mt-2 text-[9px] opacity-60 flex justify-between border-t border-white/10 pt-1">
          <span>Confidence</span>
          <span className="font-mono">{(data.confidence * 100).toFixed(0)}%</span>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
});
