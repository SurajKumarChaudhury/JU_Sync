import React from 'react';
import { Flame } from 'lucide-react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

export default function Heatmap({ tasks }) {
  const next7Days = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  const getDayWorkload = (date) => {
    return tasks.filter(task => {
        try {
            return isSameDay(new Date(task.date), date);
        } catch(e) { return false; }
    }).length;
  };

  const getHeatmapColor = (workloadCount) => {
    if (workloadCount === 0) return 'bg-white text-slate-400 border-slate-200';
    if (workloadCount === 1) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (workloadCount === 2) return 'bg-orange-200 text-orange-800 border-orange-400';
    return 'bg-red-500 text-white border-red-600 shadow-md';
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="text-orange-500" />
        <h3 className="text-lg font-bold">Crunch Week Heatmap</h3>
      </div>
      <p className="text-sm text-slate-500 mb-4">Visualizing overlapping deadlines.</p>
      
      <div className="flex flex-col gap-3">
        {next7Days.map((day, idx) => {
          const workload = getDayWorkload(day);
          return (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${getHeatmapColor(workload)} transition-all`}>
              <span className="font-medium">{format(day, 'EEE, MMM d')}</span>
              <span className="text-sm font-bold flex items-center gap-1">
                {workload} {workload === 1 ? 'Deadline' : 'Deadlines'}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}