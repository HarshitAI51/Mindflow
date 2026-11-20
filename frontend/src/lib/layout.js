// src/components/TaskCard.jsx
import React from 'react';

export default function TaskCard({ title, category, priority, time, completed = false }) {
  // Pastel pill colors matching Ref 1 & Ref 3
  const categoryColors = {
    APPOINTMENT: 'bg-pastel-blue text-slate-800',
    DEADLINE: 'bg-pastel-pink text-rose-950',
    TASK: 'bg-pastel-mint text-emerald-950',
  };

  const priorityColors = {
    'HIGH PRIORITY': 'bg-rose-100 text-rose-800 border-rose-200',
    'MEDIUM PRIORITY': 'bg-amber-100 text-amber-900 border-amber-200',
    'LOW PRIORITY': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="bg-cream-100 hover:bg-cream-50 transition-all border border-cream-300/80 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-4 flex-1">
        {/* Checkbox circle */}
        <button className="w-6 h-6 rounded-full border-2 border-forest/30 flex items-center justify-center hover:border-forest transition-colors flex-shrink-0">
          {completed && <div className="w-3 h-3 rounded-full bg-forest" />}
        </button>

        {/* Task Details */}
        <div className="space-y-2">
          <h3 className="font-sans font-semibold text-forest text-base leading-snug">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Pill */}
            <span className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md ${categoryColors[category] || 'bg-cream-200 text-forest'}`}>
              {category}
            </span>

            {/* Priority Pill */}
            {priority && (
              <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-md ${priorityColors[priority]}`}>
                {priority}
              </span>
            )}

            {/* Date/Time Tag */}
            <span className="text-[11px] font-medium text-forest/70 bg-cream-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              📅 {time}
            </span>
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2 flex-shrink-0 text-forest/50">
        <button className="p-2 hover:bg-cream-200 rounded-lg transition-colors hover:text-forest">
          ✏️
        </button>
        <button className="p-2 hover:bg-cream-200 rounded-lg transition-colors hover:text-rose-600">
          🗑️
        </button>
      </div>
    </div>
  );
}