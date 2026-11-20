export default function ProgressOverview({ tasks = [], daySummary }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const intensity = daySummary?.intensity || (pending > 2 ? 'HECTIC' : 'NORMAL');
  const message = daySummary?.message || "Analyze your brain dump to generate task clarity.";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3E2B]/60">Task Clarity</span>
          <h2 className="font-serif text-2xl font-bold text-[#1B3E2B]">Overview Dashboard</h2>
          <p className="text-xs font-semibold text-[#2E5A40] mt-1">{message}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          intensity === 'HECTIC' || intensity === 'BUSY'
            ? 'bg-[#F7D6D0] text-[#5C1D18] border-[#5C1D18]/10'
            : 'bg-[#D8EFE0] text-[#1B5233] border-[#1B5233]/10'
        }`}>
          {intensity === 'HECTIC' ? '⚡ Heavy Schedule' :
           intensity === 'BUSY' ? '🔥 Busy Day' :
           intensity === 'NORMAL' ? '✨ Steady Pace' : '☕ Light Day'}
        </span>
      </div>
      {/* ...your remaining cards... */}
    </div>
  );
}