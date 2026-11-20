// src/components/BrainDumpHero.jsx
import React, { useState } from 'react';

const SAMPLE_PROMPTS = [
  {
    label: "📌 Project Review",
    text: "We need to finish the final project presentation for the review meeting on 10 November at 10am. Before that, ask Rahul to review the slides and test the demo code tomorrow at 4pm."
  },
  {
    label: "🎓 University Chaos",
    text: "Submit abstract by 8 November at 5pm. Read Chapter 4 for AI class before Friday 2pm. Group meeting on Sunday at 11am."
  },
  {
    label: "🚀 Product Sprint",
    text: "Fix login bug before launch tomorrow at 9am. Prepare pitch deck for investors by Thursday 3pm. Schedule team sync."
  }
];

export default function BrainDumpHero({ onOrganize, isProcessing }) {
  const [text, setText] = useState(
    "We need to finish the final project presentation for the review meeting on 10 November at 10am. Before that, ask Rahul to review the slides and test the demo code tomorrow at 4pm. Submit the abstract by 8 November at 5pm."
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onOrganize(text);
    }
  };

  return (
    <div className="lg:sticky lg:top-24 space-y-5">
      {/* Header Badge & Title */}
      <div>
        <span className="inline-block bg-[#FAF7F2] text-[#1B3E2B] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#E5DAC6] shadow-sm mb-3">
          ✦ Natural Language Engine
        </span>
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1B3E2B] font-normal leading-[1.1] mb-2">
          Clear your <span className="italic font-light">mind.</span>
        </h1>
        <p className="text-[#2E5A40] text-xs md:text-sm font-medium">
          Type everything on your mind. Our AI pipeline identifies deadlines, appointments, and tasks automatically.
        </p>
      </div>

      {/* Main Canvas Card Surface */}
      <form onSubmit={handleSubmit} className="bg-[#FAF7F2] rounded-3xl p-5 md:p-6 shadow-xl shadow-[#1B3E2B]/5 border border-[#E5DAC6]">
        {/* Top bar info */}
        <div className="flex justify-between items-center pb-3 mb-3 border-b border-[#E5DAC6] text-xs text-[#2E5A40]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F7D6D0] border border-[#7A221E]/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBE8C5] border border-[#6E4515]/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#D8EFE0] border border-[#1B5233]/20" />
            <span className="font-bold uppercase tracking-wider text-[10px] ml-1 text-[#1B3E2B]">Brain Dump Canvas</span>
          </div>
          <span className="font-medium text-[11px]">
            {text.split(' ').filter(Boolean).length} words • {text.length} chars
          </span>
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full bg-[#F2ECE1]/60 rounded-2xl p-4 text-[#1B3E2B] font-sans font-medium text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1B3E2B]/20 border border-[#E5DAC6] resize-none transition-all placeholder:text-[#2E5A40]/50"
          placeholder="Write your raw thoughts here..."
        />

        {/* Sample Prompt Quick Chips */}
        <div className="pt-3 flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setText(prompt.text)}
              className="bg-[#E5DCF9] hover:bg-[#D7CBF4] text-[#2C1959] font-bold text-[11px] px-3 py-1 rounded-full transition-all border border-[#2C1959]/10 shadow-sm"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isProcessing || !text.trim()}
          className="w-full mt-5 bg-[#1B3E2B] hover:bg-[#2E5A40] text-[#FAF7F2] font-bold text-sm px-6 py-3.5 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              EXTRACTING TASKS...
            </span>
          ) : (
            'ORGANIZE MY THOUGHTS →'
          )}
        </button>
      </form>
    </div>
  );
}