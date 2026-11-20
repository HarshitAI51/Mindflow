// src/components/Navbar.jsx
import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-5 flex items-center justify-between bg-transparent">
      
      {/* LEFT */}
      <div className="flex items-center gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-sans font-bold text-[#1B3E2B] tracking-tight">
          MindFlow
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#1B3E2B]/10 text-[#1B3E2B]/60 text-xs font-semibold">
          <span className="text-[10px]">✦</span>
          Brain Dump Engine
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 md:gap-5">
        <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#1B3E2B]/70">
          <span className="w-2 h-2 rounded-full bg-[#1B5233] animate-pulse"></span>
          Pipeline Active
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1B3E2B]/5 text-[#1B3E2B]/70 hover:text-[#1B3E2B] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </button>
          
          <div className="w-9 h-9 rounded-full bg-[#1B3E2B] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shadow-sm">
            HS
          </div>
        </div>
      </div>
    </nav>
  );
}