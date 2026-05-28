import React from 'react';
import { useTasks } from '../context/TaskContext';
import { BookOpen, Clock, Trash2, CalendarRange, FolderGit, AlertCircle } from 'lucide-react';
import { format, differenceInDays, isSameDay, isSameMonth, addDays, startOfDay, endOfDay } from 'date-fns';
import GoogleSync from './GoogleSync';

export default function TaskList({ filterMode = 'weekly' }) {
  const { tasks, deleteTask } = useTasks();

  const filteredTasks = tasks.filter((task) => {
    try {
      const taskDate = new Date(task.date);
      const now = new Date();
      if (filterMode === 'daily') {
        return isSameDay(taskDate, now);
      }
      if (filterMode === 'weekly') {
        const start = startOfDay(now);
        const end = endOfDay(addDays(now, 6)); // next 7 days including today
        return taskDate >= start && taskDate <= end;
      }
      if (filterMode === 'monthly') {
        return isSameMonth(taskDate, now);
      }
      return true;
    } catch {
      return true;
    }
  });

  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const formatTaskDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (filterMode === 'daily') {
        return format(d, 'hh:mm a');
      }
      if (filterMode === 'weekly') {
        return format(d, 'EEEE, MMM d');
      }
      return format(d, 'MMM do, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getTaskBadgeStyle = (type) => {
    switch (type) {
      case 'exam':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'project':
        return 'bg-violet-50 text-violet-600 border-violet-100';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'exam':
        return <BookOpen size={16} />;
      case 'project':
        return <FolderGit size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getUrgencyBadge = (dateStr) => {
    try {
      const daysLeft = differenceInDays(new Date(dateStr), new Date());
      if (daysLeft < 0) {
        return <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-extrabold uppercase border border-slate-200/50">Overdue</span>;
      }
      if (daysLeft === 0) {
        return <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-extrabold uppercase border border-rose-600 shadow-sm animate-pulse">Due Today</span>;
      }
      if (daysLeft === 1) {
        return <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase border border-orange-200">Due Tomorrow</span>;
      }
      if (daysLeft <= 3) {
        return <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase border border-amber-200">{daysLeft} days left</span>;
      }
      return <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-extrabold uppercase border border-slate-200/50">{daysLeft} days left</span>;
    } catch (e) {
      return null;
    }
  };

  return (
    <section 
      id="tasks-timeline-container"
      className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 run-fade relative overflow-hidden transition-all duration-500"
    >
      
      {/* Background visual details */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarRange size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Upcoming Workload</h3>
            <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider">
              {filterMode} view
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-extrabold rounded-xl border border-slate-200/50">
          Total: {sortedTasks.length}
        </span>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3 border border-slate-100">
            <AlertCircle size={20} />
          </div>
          <p className="text-xs font-bold text-slate-500">
            No upcoming deadlines.
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            You're all clear! Add new milestones or ask AI to model a plan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white/40 hover:bg-white/80 hover:border-blue-200/50 transition-all duration-300 hover:shadow-sm"
            >
              
              {/* Task Title & Details */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getTaskBadgeStyle(task.type)}`}
                >
                  {getTaskIcon(task.type)}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-blue-900 transition-colors">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-bold text-slate-400">
                    <span className="text-blue-600 font-extrabold tracking-wide uppercase">
                      {task.course}
                    </span>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                      {task.group}
                    </span>
                    <span>•</span>
                    {getUrgencyBadge(task.date)}
                  </div>
                </div>
              </div>

              {/* Due Date & Operations */}
              <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 border-t border-slate-50 pt-3 sm:pt-0 sm:border-none">
                
                <div className="text-left sm:text-right">
                  <div className="text-xs font-black text-slate-700 font-display">
                    {formatTaskDate(task.date)}
                  </div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
                    {task.type}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  
                  {/* Google Calendar Sync Button */}
                  <GoogleSync task={task} />

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Remove Task"
                  >
                    <Trash2 size={15} />
                  </button>
                  
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </section>
  );
}