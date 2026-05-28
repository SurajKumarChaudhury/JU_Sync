import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import {
  format,
  startOfDay,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  isSameHour,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from 'date-fns';

/**
 * Heatmap component displays a visual representation of the user's task density.
 * It supports three granularities:
 *  - "daily": 24 hourly slots for the current day.
 *  - "weekly": 7 daily slots for the next week (default view).
 *  - "monthly": weekly slots for the current month.
 */
export default function Heatmap({ tasks, mode = 'weekly', setMode }) {

  // ---------------------------------------------------------------------------
  // Period generation based on the selected mode
  // ---------------------------------------------------------------------------
  const generatePeriods = () => {
    const now = new Date();
    if (mode === 'daily') {
      // 24 hours of the current day
      const start = startOfDay(now);
      return Array.from({ length: 24 }).map((_, i) => addHours(start, i));
    }
    if (mode === 'weekly') {
      // Next 7 days including today
      return Array.from({ length: 7 }).map((_, i) => addDays(now, i));
    }
    // monthly – weeks of the current month
    const monthStart = startOfMonth(now);
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      weeks.push(addWeeks(monthStart, i));
    }
    return weeks;
  };

  const periods = generatePeriods();

  // ---------------------------------------------------------------------------
  // Workload calculation for each period
  // ---------------------------------------------------------------------------
  const getWorkload = (date) => {
    if (mode === 'daily') {
      return tasks.filter((t) => {
        try {
          return isSameHour(new Date(t.date), date);
        } catch {
          return false;
        }
      }).length;
    }
    if (mode === 'weekly') {
      return tasks.filter((t) => {
        try {
          return isSameDay(new Date(t.date), date);
        } catch {
          return false;
        }
      }).length;
    }
    // monthly – count tasks that fall within the same week as the period start
    return tasks.filter((t) => {
      try {
        return isSameWeek(new Date(t.date), date, { weekStartsOn: 1 });
      } catch {
        return false;
      }
    }).length;
  };

  // ---------------------------------------------------------------------------
  // Styling based on workload intensity
  // ---------------------------------------------------------------------------
  const getHeatmapStyle = (count) => {
    if (count === 0) {
      return {
        card: 'bg-white/60 border-slate-100 hover:border-slate-200/80',
        badge: 'bg-slate-50 text-slate-400 border-slate-200/50',
        text: 'text-slate-600',
        sub: 'text-slate-400',
      };
    }
    if (count === 1) {
      return {
        card: 'bg-blue-50/40 border-blue-100/70 hover:border-blue-200/80 hover:bg-blue-50/60',
        badge: 'bg-blue-50 text-blue-600 border-blue-200/40',
        text: 'text-blue-900 font-semibold',
        sub: 'text-blue-500 font-medium',
      };
    }
    if (count === 2) {
      return {
        card: 'bg-amber-50/40 border-amber-100/70 hover:border-amber-200/80 hover:bg-amber-50/60',
        badge: 'bg-amber-50 text-amber-700 border-amber-200/40',
        text: 'text-amber-900 font-bold',
        sub: 'text-amber-600 font-semibold',
      };
    }
    // 3 or more tasks
    return {
      card: 'bg-rose-50/40 border-rose-200/70 hover:border-rose-300/80 hover:bg-rose-50/60 shadow-sm shadow-rose-500/5 animate-[pulse_3s_infinite_ease]',
      badge: 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/20',
      text: 'text-rose-900 font-black',
      sub: 'text-rose-600 font-bold',
    };
  };

  // ---------------------------------------------------------------------------
  // Helper to render the label for each period depending on mode
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Helper to render the label for each period depending on mode
  // ---------------------------------------------------------------------------
  const getPeriodDetails = (date, idx) => {
    if (mode === 'daily') {
      return {
        primary: format(date, 'ha'),
        secondary: format(date, 'EEEE, MMM d'),
      };
    }
    if (mode === 'weekly') {
      return {
        primary: format(date, 'EEEE'),
        secondary: format(date, 'MMM d, yyyy'),
      };
    }
    // monthly – weekly view
    const startOfW = startOfWeek(date, { weekStartsOn: 1 });
    const endOfW = new Date(startOfW.getTime() + 6 * 24 * 60 * 60 * 1000);
    const weekStart = format(startOfW, 'MMM d');
    const weekEnd = format(endOfW, 'MMM d');
    return {
      primary: `Week ${idx + 1}`,
      secondary: `${weekStart} – ${weekEnd}`,
    };
  };

  const getStatusLabel = (count) => {
    if (count === 0) return { label: 'Optimal', badge: 'bg-slate-100/70 text-slate-500 border-slate-200/50' };
    if (count === 1) return { label: 'Moderate', badge: 'bg-blue-50 text-blue-600 border-blue-100' };
    if (count === 2) return { label: 'Highly Busy', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Critical Overload', badge: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse' };
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  return (
    <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col relative overflow-hidden run-fade">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-orange-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with mode selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
            <Flame className="animate-bounce" style={{ animationDuration: '3s' }} size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Crunch Heatmap</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Overlap Monitor</span>
          </div>
        </div>
        {/* Mode selector – simple pill buttons */}
        <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto">
          {['daily', 'weekly', 'monthly'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === m
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 font-medium">
        {mode === 'daily' && 'Hourly workload for the current day.'}
        {mode === 'weekly' && 'Daily workload for the next 7 days.'}
        {mode === 'monthly' && 'Weekly workload for the current month.'}
      </p>

      {/* Tabular Form Grid */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Period</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Details</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-1">Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {periods.map((period, idx) => {
              const workload = getWorkload(period);
              const style = getHeatmapStyle(workload);
              const { primary, secondary } = getPeriodDetails(period, idx);
              const status = getStatusLabel(workload);

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/50 transition-colors duration-150 group`}
                >
                  {/* Period Column */}
                  <td className="py-3.5 pl-1">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {primary}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 sm:hidden">
                        {secondary}
                      </span>
                    </div>
                  </td>

                  {/* Details Column (Desktop only) */}
                  <td className="py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-medium text-slate-500">
                      {secondary}
                    </span>
                  </td>

                  {/* Status Badge Column */}
                  <td className="py-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${status.badge}`}>
                      {status.label}
                    </span>
                  </td>

                  {/* Task Count Column */}
                  <td className="py-3.5 text-right pr-1">
                    <div className="inline-flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg border ${style.badge}`}>
                        {workload} {workload === 1 ? 'Task' : 'Tasks'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}