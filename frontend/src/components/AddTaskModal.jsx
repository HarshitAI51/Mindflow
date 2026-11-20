import React, { useState } from "react";

export default function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [dateDisplay, setDateDisplay] = useState("Today");
  const [timeDisplay, setTimeDisplay] = useState("12:00 PM");
  const [priority, setPriority] = useState("MEDIUM");
  const [taskType, setTaskType] = useState("TASK");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAdd({
      id: `task_manual_${Date.now()}`,
      task: taskTitle.trim(),
      date_display: dateDisplay.trim() || "No deadline",
      time_display: timeDisplay.trim() || "None",
      priority,
      type: taskType,
      datetime: "FLEXIBLE",
      is_ambiguous: false,
    });

    setTaskTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-mindflow-white rounded-3xl border-4 border-mindflow-deep shadow-retro-lg p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-mindflow-deep/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">➕</span>
            <h3 className="font-display text-base text-mindflow-dark uppercase">
              Add Task Manually
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-mindflow-cream text-mindflow-deep hover:bg-mindflow-coralLight hover:text-mindflow-coral flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-space font-bold uppercase text-mindflow-deep/80 block mb-1">
              Task Description
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Call Rahul to review presentation slides"
              className="w-full p-3 rounded-2xl border-2 border-mindflow-deep bg-white text-xs sm:text-sm font-semibold text-mindflow-dark focus:outline-none focus:border-mindflow-green"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-space font-bold uppercase text-mindflow-deep/80 block mb-1">
                Date
              </label>
              <input
                type="text"
                value={dateDisplay}
                onChange={(e) => setDateDisplay(e.target.value)}
                placeholder="e.g. 10 November or Tomorrow"
                className="w-full p-2.5 rounded-xl border border-mindflow-deep bg-white text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-space font-bold uppercase text-mindflow-deep/80 block mb-1">
                Time
              </label>
              <input
                type="text"
                value={timeDisplay}
                onChange={(e) => setTimeDisplay(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full p-2.5 rounded-xl border border-mindflow-deep bg-white text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-space font-bold uppercase text-mindflow-deep/80 block mb-1">
                Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-mindflow-deep bg-white text-xs font-medium"
              >
                <option value="TASK">Task</option>
                <option value="DEADLINE">Deadline</option>
                <option value="APPOINTMENT">Appointment</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-space font-bold uppercase text-mindflow-deep/80 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-mindflow-deep bg-white text-xs font-medium"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-mindflow-deep/15 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-mindflow-deep hover:bg-mindflow-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className="px-5 py-2.5 rounded-xl bg-mindflow-green text-white font-display text-xs uppercase tracking-wider border-2 border-mindflow-deep shadow-retro-sm hover:shadow-none transition-all disabled:opacity-50"
            >
              Add Task →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

