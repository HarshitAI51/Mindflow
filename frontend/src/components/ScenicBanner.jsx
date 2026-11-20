import React from "react";

export default function ScenicBanner({ onCapybaraClick }) {
  return (
    <div className="relative w-full h-64 overflow-hidden rounded-t-[36px] bg-gradient-to-b from-[#7bc4ee] via-[#aee0fa] to-[#d6f0be] select-none">
      {/* Sky & Sun Glow */}
      <div className="absolute top-4 left-1/3 w-32 h-32 rounded-full bg-yellow-200/50 blur-2xl pointer-events-none" />
      <div className="absolute top-2 right-12 w-16 h-16 rounded-full bg-white/40 blur-lg pointer-events-none" />

      {/* Fluffy Clouds */}
      <svg
        className="absolute top-6 left-6 w-24 h-12 text-white/70 animate-pulse"
        viewBox="0 0 100 45"
        fill="currentColor"
      >
        <path d="M20,35 Q10,35 10,25 Q10,15 25,15 Q30,5 45,8 Q60,2 70,14 Q85,10 88,24 Q95,28 92,36 Z" />
      </svg>
      <svg
        className="absolute top-10 right-20 w-32 h-14 text-white/80"
        viewBox="0 0 100 45"
        fill="currentColor"
      >
        <path d="M15,35 Q5,35 5,22 Q5,12 20,12 Q28,2 45,5 Q60,0 72,12 Q88,8 90,22 Q98,28 90,36 Z" />
      </svg>

      {/* Layered Background Mountains (Perrier Green Vibe) */}
      <svg
        className="absolute bottom-16 left-0 right-0 w-full h-32"
        preserveAspectRatio="none"
        viewBox="0 0 500 150"
      >
        {/* Distant Mountains */}
        <path
          d="M0,120 Q80,40 180,90 T360,70 Q430,40 500,100 L500,150 L0,150 Z"
          fill="#47986c"
          opacity="0.45"
        />
        {/* Mid Hills */}
        <path
          d="M0,130 Q120,60 240,110 T460,90 Q485,80 500,95 L500,150 L0,150 Z"
          fill="#2b7e51"
          opacity="0.65"
        />
      </svg>

      {/* Mountain Lake / Water Body */}
      <svg
        className="absolute bottom-12 left-0 right-0 w-full h-12"
        preserveAspectRatio="none"
        viewBox="0 0 500 40"
      >
        <path
          d="M0,20 Q125,5 250,20 T500,15 L500,40 L0,40 Z"
          fill="#5bbceb"
          opacity="0.75"
        />
      </svg>

      {/* Foreground Rolling Green Hill */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-24"
        preserveAspectRatio="none"
        viewBox="0 0 500 100"
      >
        <path
          d="M0,50 Q140,10 280,40 T500,20 L500,100 L0,100 Z"
          fill="#6abf4b"
        />
        <path
          d="M0,75 Q160,35 320,65 T500,45 L500,100 L0,100 Z"
          fill="#4c9e37"
        />
      </svg>

      {/* Big Friendly Oak Tree on Left */}
      <svg
        className="absolute -top-8 -left-10 w-44 h-56 pointer-events-none"
        viewBox="0 0 200 240"
      >
        {/* Trunk & branches */}
        <path
          d="M20,240 Q40,150 45,90 Q47,50 35,0"
          stroke="#5a3d28"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40,130 Q80,100 110,90"
          stroke="#5a3d28"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        {/* Foliage leaves in shades of Perrier green */}
        <circle cx="50" cy="50" r="45" fill="#1b6e3f" opacity="0.9" />
        <circle cx="95" cy="55" r="40" fill="#2d945a" opacity="0.95" />
        <circle cx="60" cy="80" r="35" fill="#4cb068" />
        <circle cx="115" cy="85" r="30" fill="#75cf7a" />
      </svg>

      {/* Cute Capybara Sitting on the Hill */}
      <div
        onClick={onCapybaraClick}
        className="absolute bottom-6 right-20 cursor-pointer transform hover:scale-105 transition-transform duration-300 group"
        title="Tap me for good morning wisdom!"
      >
        <svg className="w-28 h-24" viewBox="0 0 120 100">
          {/* Shadow */}
          <ellipse cx="60" cy="92" rx="42" ry="7" fill="#1d4d29" opacity="0.35" />

          {/* Capybara Body */}
          <ellipse cx="62" cy="65" rx="36" ry="24" fill="#c48a58" />
          <ellipse cx="62" cy="68" rx="33" ry="21" fill="#b07849" />

          {/* Back leg / hip */}
          <ellipse cx="38" cy="72" rx="14" ry="12" fill="#9e693f" />

          {/* Front paws */}
          <ellipse cx="78" cy="86" rx="6" ry="5" fill="#8d5c36" />
          <ellipse cx="66" cy="87" rx="6" ry="5" fill="#8d5c36" />

          {/* Head & Snout */}
          <ellipse cx="86" cy="46" rx="16" ry="17" fill="#c48a58" />
          {/* Boxy nose / snout */}
          <path
            d="M86,34 L104,36 Q108,44 104,54 L86,56 Z"
            fill="#ba8151"
          />
          {/* Nose tip */}
          <ellipse cx="104" cy="42" rx="3.5" ry="4" fill="#4a3120" />
          {/* Nostril */}
          <circle cx="103" cy="43" r="1.2" fill="#24170d" />

          {/* Peaceful closed eye */}
          <path
            d="M86,42 Q90,39 94,42"
            stroke="#3a2214"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cute Capybara Ear */}
          <ellipse cx="74" cy="36" rx="4.5" ry="6" fill="#8d5c36" transform="rotate(-15 74 36)" />
          <ellipse cx="74" cy="36" rx="2.5" ry="4" fill="#d99b70" transform="rotate(-15 74 36)" />

          {/* Little Cheek Blush */}
          <circle cx="88" cy="50" r="4" fill="#e66f68" opacity="0.45" />

          {/* Little gentle smile */}
          <path
            d="M97,49 Q101,52 103,49"
            stroke="#4a3120"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Floating Speech Bubble from Capybara */}
        <div className="absolute -top-11 -right-12 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl shadow-md border border-emerald-100 flex items-center gap-1.5 whitespace-nowrap animate-float-slow">
          <span className="text-[10px] font-bold text-slate-800 tracking-tight">
            The Morning is Lovely Like You
          </span>
          <span className="text-xs text-rose-500 animate-pulse">❤️</span>
          {/* Little speech tail pointing towards capybara head */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white rotate-45 border-r border-b border-emerald-100" />
        </div>
      </div>

      {/* Decorative Wildflowers on Grass */}
      <div className="absolute bottom-2 left-16 flex gap-3 pointer-events-none opacity-80">
        <span className="text-[10px]">🌼</span>
        <span className="text-[9px]">🌸</span>
        <span className="text-[10px]">🌿</span>
      </div>
    </div>
  );
}

