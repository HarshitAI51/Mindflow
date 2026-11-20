// src/components/TaskCard.jsx
import React, { useState } from 'react';

export default function TaskCard({ id, title, category, priority, time, completed, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title, category, priority, time });

  const categoryStyles = {
    APPOINTMENT: 'bg-[#D2E6F5] text-[#18486B]',
    DEADLINE: 'bg-[#F7D6D0] text-[#5C1D18]',
    TASK: 'bg-[#D8EFE0] text-[#1B5233]',
  };

  const priorityStyles = {
    'HIGH PRIORITY': 'bg-rose-100 text-rose-900 border-rose-200',
    'MEDIUM PRIORITY': 'bg-[#FBE8C5] text-[#52350C] border-[#52350C]/10',
    'LOW PRIORITY': 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const handleSave = () => {
    onEdit(id, editData);
    setIsEditing(false);
  };

  // --- EDIT MODE UI ---
  if (isEditing) {
    return (
      <div className="border border-[#E5DAC6] bg-[#FAF7F2] rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <input 
          type="text" 
          value={editData.title}
          onChange={(e) => setEditData({...editData, title: e.target.value})}
          className="w-full bg-white border border-[#E5DAC6] rounded-lg px-3 py-2 text-sm text-[#1B3E2B] font-semibold focus:outline-none focus:border-[#1B3E2B]/30"
          placeholder="Task title..."
        />
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={editData.category}
            onChange={(e) => setEditData({...editData, category: e.target.value})}
            className="bg-white border border-[#E5DAC6] rounded-lg px-2 py-1.5 text-xs font-bold text-[#1B3E2B] focus:outline-none"
          >
            <option value="TASK">TASK</option>
            <option value="DEADLINE">DEADLINE</option>
            <option value="APPOINTMENT">APPOINTMENT</option>
          </select>

          <select 
            value={editData.priority}
            onChange={(e) => setEditData({...editData, priority: e.target.value})}
            className="bg-white border border-[#E5DAC6] rounded-lg px-2 py-1.5 text-xs font-bold text-[#1B3E2B] focus:outline-none"
          >
            <option value="LOW PRIORITY">LOW PRIORITY</option>
            <option value="MEDIUM PRIORITY">MEDIUM PRIORITY</option>
            <option value="HIGH PRIORITY">HIGH PRIORITY</option>
          </select>

          <div className="flex-1 min-w-[120px] flex items-center bg-white border border-[#E5DAC6] rounded-lg px-2 py-1.5 focus-within:border-[#1B3E2B]/30">
            <span className="text-xs mr-1">📅</span>
            <input 
              type="text" 
              value={editData.time}
              onChange={(e) => setEditData({...editData, time: e.target.value})}
              className="w-full bg-transparent text-xs font-medium text-[#1B3E2B] focus:outline-none placeholder:text-[#1B3E2B]/40"
              placeholder="e.g. Tomorrow 4PM"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-bold text-[#1B3E2B]/60 hover:text-[#1B3E2B] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 text-xs font-bold bg-[#1B3E2B] text-white rounded-lg hover:bg-[#2E5A40] transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // --- NORMAL VIEW UI ---
  return (
    <div className={`border rounded-2xl p-4 shadow-sm transition-all flex items-center justify-between gap-3 ${
      completed ? 'bg-[#F2ECE1]/60 border-[#E5DAC6] opacity-75' : 'bg-[#FAF7F2] hover:bg-white border-[#E5DAC6]'
    }`}>
      <div className="flex items-center gap-3.5 flex-1">
        <button 
          type="button"
          onClick={() => onToggle(id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
            completed ? 'border-[#1B3E2B] bg-[#1B3E2B]' : 'border-[#1B3E2B]/30 hover:border-[#1B3E2B]'
          }`}
        >
          {completed && <span className="text-white text-xs font-bold">✓</span>}
        </button>

        <div className="space-y-1.5">
          <h4 className={`font-sans font-semibold text-sm leading-snug ${completed ? 'line-through text-[#1B3E2B]/50' : 'text-[#1B3E2B]'}`}>
            {title}
          </h4>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${categoryStyles[category] || 'bg-gray-200 text-gray-800'}`}>
              {category}
            </span>

            {priority && (
              <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${priorityStyles[priority]}`}>
                {priority}
              </span>
            )}

            {time && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                time === "No deadline" ? 'bg-gray-100 text-gray-500 border-gray-200/50' : 'bg-[#F2ECE1] text-[#1B3E2B]/70 border-[#E5DAC6]/50'
              }`}>
                📅 {time}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-1">
        <button 
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1.5 hover:bg-[#E5DAC6]/50 rounded-lg text-xs text-[#1B3E2B]/40 hover:text-[#1B3E2B] transition-colors"
          title="Edit task"
        >
          ✏️
        </button>
        <button 
          type="button"
          onClick={() => onDelete(id)}
          className="p-1.5 hover:bg-rose-100 rounded-lg text-xs text-[#1B3E2B]/40 hover:text-rose-700 transition-colors"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}