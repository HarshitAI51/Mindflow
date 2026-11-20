// src/components/TaskQueue.jsx
import React, { useState } from 'react';
import TaskCard from './TaskCard';

export default function TaskQueue({ tasks = [], onToggleTask, onDeleteTask, onEditTask }) {
  const [filter, setFilter] = useState('ALL');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'PENDING') return !task.completed;
    if (filter === 'DONE') return task.completed;
    if (filter === 'DEADLINES') return task.category === 'DEADLINE';
    return true;
  });

  return (
    <div className="bg-[#FAF7F2]/60 rounded-3xl p-4 border border-[#E5DAC6] shadow-sm backdrop-blur-sm space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1B3E2B]">Extracted Task Queue</h3>
          <p className="text-xs text-[#2E5A40]">Organized by priority and date</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#E5DAC6]/40 p-1 rounded-full text-[11px] font-semibold">
          {['ALL', 'PENDING', 'DONE', 'DEADLINES'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full transition-all ${
                filter === tab 
                  ? 'bg-[#1B3E2B] text-[#FAF7F2] shadow-sm' 
                  : 'text-[#1B3E2B]/70 hover:text-[#1B3E2B]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task Stack */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-[#2E5A40]/60 text-xs font-medium border border-dashed border-[#E5DAC6] rounded-2xl">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              {...task} 
              onToggle={onToggleTask} 
              onDelete={onDeleteTask} 
              onEdit={onEditTask} // <-- Added Edit Prop
            />
          ))
        )}
      </div>
    </div>
  );
}