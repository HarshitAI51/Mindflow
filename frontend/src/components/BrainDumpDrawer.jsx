import React, { useState } from "react";

const PRESET_DUMPS = [
  {
    label: "🌪️ University & Life Chaos",
    text: "ugh today's been so chaotic. Need to submit the ML assignment by Friday 11:59pm, that's URGENT because sir said no late submissions. Call mom tonight around 7 too. Dentist is Monday at 3pm and I need to buy groceries sometime this weekend. Also I still haven't watched that movie everyone keeps talking about lol.",
  },
  {
    label: "🛒 Weekend Errands",
    text: "Remember to pick up dry cleaning by Saturday noon. Also pay wifi bill before Sunday 5pm so it doesn't get disconnected. Need to clean the kitchen and prep lunch for Monday.",
  },
  {
    label: "💻 Tech Project Sprint",
    text: "Fix the bug in the authentication pipeline by tomorrow 2pm. Write the unit tests for data extraction. Sync with Harshit at 4pm today about the new UI redesign.",
  },
];

export default function BrainDumpDrawer({
  isOpen,
  onClose,
  currentText,
  onTextChange,
  onParse,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-retro-bg rounded-t-[36px] sm:rounded-[36px] border-t-4 sm:border-4 border-perrier-dark p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-perrier-mint pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h2 className="font-display text-base text-perrier-dark uppercase tracking-tight">
              Brain Dump AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-retro-cream text-retro-text hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-retro-muted leading-relaxed">
          Pour out your raw, chaotic thoughts. Our NLP model will separate actionable
          commitments, dates, and priorities automatically.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-display uppercase tracking-wider text-perrier-dark/70">
            Quick Load Examples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_DUMPS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onTextChange(p.text)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white border border-perrier-mint hover:border-perrier-green hover:bg-perrier-soft text-retro-text transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={5}
          value={currentText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Type or paste everything going on in your head..."
          className="w-full p-4 rounded-2xl bg-white border-2 border-perrier-mint focus:border-perrier-green focus:outline-none text-xs text-retro-text leading-relaxed shadow-inner resize-none font-sans"
        />

        {/* Action Button */}
        <button
          onClick={() => {
            onParse();
            onClose();
          }}
          disabled={loading || !currentText.trim()}
          className="w-full py-3.5 rounded-2xl bg-perrier-green hover:bg-perrier-dark text-white font-display text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-perrier-green/30 flex items-center justify-center gap-2"
        >
          {loading ? "Extracting Tasks With AI..." : "Extract Tasks & Calculate Load ⚡"}
        </button>
      </div>
    </div>
  );
}

