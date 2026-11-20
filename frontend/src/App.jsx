// src/App.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BrainDumpHero from './components/BrainDumpHero';
import ProgressOverview from './components/ProgressOverview';
import TaskQueue from './components/TaskQueue';
import { extractTasksWithAI } from './lib/api';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [daySummary, setDaySummary] = useState(null);

  const handleOrganize = async (rawText) => {
    setIsProcessing(true);
    setApiError(null);
    setApiInfo(null);

    try {
      const rawAiResults = await extractTasksWithAI(rawText);
      const extractedTasksList = rawAiResults.tasks || [];

      if (rawAiResults.day_summary) {
        setDaySummary(rawAiResults.day_summary);
      }

      if (rawAiResults.source === "local_engine") {
        setApiInfo(
          "Extracted using local intelligence. To connect the Python/spaCy backend, run 'uvicorn app.main:app --reload --port 8001' in your backend terminal."
        );
      }

      const formattedTasks = extractedTasksList.map((item, index) => {
        let timeStr = item.date_display || (item.datetime && item.datetime !== "FLEXIBLE" ? item.datetime : "No deadline");
        if (item.time_display && item.time_display !== "None") {
          timeStr =
            timeStr === "No deadline"
              ? item.time_display
              : `${timeStr} • ${item.time_display}`;
        }

        return {
          id: item.id || Date.now() + index,
          title: item.task || "Untitled Task",
          category: item.type || "TASK",
          priority: (item.priority || "MEDIUM") + " PRIORITY",
          time: timeStr,
          completed: false,
        };
      });

      setTasks(formattedTasks);
    } catch (err) {
      console.error("Failed to extract tasks:", err);
      setApiError(
        "Could not connect to DayForge NLP service. Please check terminal logs."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleEditTask = (taskId, updatedData) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updatedData } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#DCE5D8] font-sans text-[#1B3E2B] selection:bg-[#FBE8C5]">
      <Navbar />

      {/* FULLER WIDTH — reduced side padding + wider max container */}
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-4 md:py-6">
        {apiError && (
          <div className="mb-5 p-4 rounded-2xl bg-[#F7D6D0] border border-[#5C1D18]/20 text-[#5C1D18] flex items-center justify-between text-sm font-semibold shadow-sm">
            <span>⚠️ {apiError}</span>
            <button
              onClick={() => setApiError(null)}
              className="text-xs uppercase font-bold underline px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {apiInfo && (
          <div className="mb-5 p-4 rounded-2xl bg-[#FBE8C5] border border-[#6E4515]/20 text-[#6E4515] flex items-center justify-between text-xs sm:text-sm font-semibold shadow-sm">
            <span>💡 {apiInfo}</span>
            <button
              onClick={() => setApiInfo(null)}
              className="text-xs uppercase font-bold underline px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT: Brain Dump */}
          <div className="lg:col-span-5 xl:col-span-4">
            <BrainDumpHero
              onOrganize={handleOrganize}
              isProcessing={isProcessing}
            />
          </div>

          {/* RIGHT: Dashboard + Queue */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            <ProgressOverview tasks={tasks} daySummary={daySummary} />
            <TaskQueue
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
