import React from 'react';

export const HeatmapGrid = ({ heatmapData, onSelectDate }) => {
  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Loading consistency contribution heatmap...
      </div>
    );
  }

  // Group into columns of 7 days (weeks)
  const weeks = [];
  let currentWeek = [];

  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getCellColor = (level) => {
    switch (level) {
      case 4:
        return 'bg-brand-600 hover:bg-brand-500 ring-brand-400';
      case 3:
        return 'bg-brand-500/80 hover:bg-brand-400 ring-brand-300';
      case 2:
        return 'bg-brand-400/50 hover:bg-brand-400 ring-brand-300';
      case 1:
        return 'bg-brand-300/30 hover:bg-brand-300 ring-brand-200 dark:bg-brand-950/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            365-Day Consistency Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any cell to inspect completed habits, missed days, and focus sessions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-300/30 dark:bg-brand-950/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-400/50" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-500/80" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-600" />
          <span>More</span>
        </div>
      </div>

      {/* Grid container with horizontal scroll */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-1 min-w-[700px]">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((day) => (
                <button
                  key={day.date}
                  onClick={() => onSelectDate(day.date)}
                  className={`w-3 h-3 rounded-[3px] transition-all heatmap-cell focus:outline-none focus:ring-1 ${getCellColor(
                    day.level
                  )}`}
                  title={`${day.date}: ${day.count} habits completed, ${day.focusMinutes} focus mins`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
