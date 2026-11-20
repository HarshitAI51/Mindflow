import React, { useState, useEffect } from "react";

export default function FocusModal({ task, isOpen, onClose, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[32px] bg-retro-bg border-4 border-perrier-dark p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Retro Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-retro-coral via-retro-yellow to-perrier-green" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-retro-cream text-retro-text hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ✕
        </button>

        {/* Badge */}
        <span className="mt-2 px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-wider bg-perrier-mint text-perrier-dark border border-perrier-green/30">
          ⚡ Deep Focus Mode
        </span>

        {/* Current Task */}
        <h3 className="mt-3 text-base font-bold text-retro-text line-clamp-2 px-2">
          {task?.task || "Focus on your #1 priority"}
        </h3>
        <p className="text-[11px] text-retro-muted mt-1">
          Zero distractions. Just you and the work.
        </p>

        {/* Big Retro Digital Timer */}
        <div className="my-6 p-6 rounded-3xl bg-perrier-dark text-retro-bg w-48 shadow-inner border-2 border-perrier-light flex flex-col items-center justify-center">
          <span className="font-display text-4xl tracking-wider text-perrier-lime">
            {timeFormatted}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-perrier-mint/70 mt-1">
            {isActive ? "Flowing..." : "Paused"}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-3 rounded-2xl font-display text-xs uppercase tracking-wider transition-all shadow-md ${
              isActive
                ? "bg-retro-yellow text-slate-900 hover:bg-yellow-400"
                : "bg-perrier-green text-white hover:bg-perrier-deep"
            }`}
          >
            {isActive ? "Pause" : "Start Focus"}
          </button>

          <button
            onClick={() => {
              if (task) onComplete(task.id);
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl font-display text-xs uppercase tracking-wider bg-retro-coral text-white hover:bg-rose-600 transition-all shadow-md"
          >
            Mark Done ✓
          </button>
        </div>

        {/* Reset Timer */}
        <button
          onClick={() => {
            setIsActive(false);
            setSecondsLeft(25 * 60);
          }}
          className="mt-4 text-[11px] font-semibold text-retro-muted hover:text-retro-text underline underline-offset-2"
        >
          Reset to 25 mins
        </button>
      </div>
    </div>
  );
}

