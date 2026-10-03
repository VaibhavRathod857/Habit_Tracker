import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService.js';
import { useToast } from '../context/ToastContext.jsx';
import { HeatmapGrid } from '../components/calendar/HeatmapGrid.jsx';
import { DayDetailModal } from '../components/calendar/DayDetailModal.jsx';

export const CalendarPage = () => {
  const { error: toastError } = useToast();
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const fetchCalendarData = async () => {
    try {
      const res = await analyticsService.getHeatmap();
      if (res.success && res.data) {
        setHeatmapData(res.data);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const handleSelectDate = async (dateStr) => {
    setSelectedDate(dateStr);
    try {
      const res = await analyticsService.getDayDetails(dateStr);
      if (res.success && res.data) {
        setDayDetails(res.data);
        setIsDayModalOpen(true);
      }
    } catch (err) {
      toastError(err.message);
    }
  };

  // Calendar month days calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthHeatmapMap = new Map();
  heatmapData.forEach((d) => monthHeatmapMap.set(d.date, d));

  const changeMonth = (delta) => {
    setCurrentMonthDate(new Date(year, month + delta, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Consistency Calendar &amp; Heatmap
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your long-term momentum. Every square is proof of consistency compound interest.
        </p>
      </div>

      {/* GitHub-Style 365-day Heatmap */}
      <HeatmapGrid heatmapData={heatmapData} onSelectDate={handleSelectDate} />

      {/* Monthly Interactive Calendar View */}
      <div className="rounded-2xl p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 rounded-xl bg-transparent" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const data = monthHeatmapMap.get(dateStr);
            const count = data?.count || 0;
            const focusMinutes = data?.focusMinutes || 0;

            return (
              <button
                key={dateStr}
                onClick={() => handleSelectDate(dateStr)}
                className="h-16 p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex flex-col justify-between text-left group"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {dayNum}
                </span>

                <div className="space-y-0.5">
                  {count > 0 && (
                    <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {count} habits
                    </span>
                  )}
                  {focusMinutes > 0 && (
                    <span className="block text-[10px] font-mono text-brand-600 dark:text-brand-400">
                      {focusMinutes}m
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        dayDetails={dayDetails}
      />
    </div>
  );
};
