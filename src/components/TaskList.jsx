import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { BookOpen, Clock, Trash2, CalendarRange, FolderGit, AlertCircle, ListTodo, ChevronDown, ChevronUp, CheckSquare, Square, BatteryCharging } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import GoogleSync from './GoogleSync';

export default function TaskList({ filterMode = 'weekly', energyLevel = 'medium' }) {
  const { tasks, deleteTask } = useTasks();
  
  // ADHD State: tracking expanded checklists and ticked items
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState({});

  const getTaskComplexityWeight = (type) => {
    switch (type) {
      case 'exam': return 3;
      case 'project': return 3;
      case 'submission': return 2;
      default: return 1;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    try {
      const taskDate = new Date(task.date);
      const now = new Date();
      
      // Calculate start and end times locally to prevent timezone shifting
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      if (filterMode === 'daily') {
        return taskDate >= todayStart && taskDate <= todayEnd;
      }
      if (filterMode === 'weekly') {
        const nextWeekEnd = new Date(todayStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        nextWeekEnd.setHours(23, 59, 59);
        return taskDate >= todayStart && taskDate <= nextWeekEnd;
      }
      if (filterMode === 'monthly') {
        return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
      }
      return true;
    } catch {
      return true;
    }
  });

  // Sort chronologically and dynamically shift according to current Brain Energy Levels
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (energyLevel === 'low') {
      // Low Energy: Sort by complexity weight ascending (Easy Wins First)
      const weightDiff = getTaskComplexityWeight(a.type) - getTaskComplexityWeight(b.type);
      if (weightDiff !== 0) return weightDiff;
    } else if (energyLevel === 'high') {
      // High Energy: Sort by complexity weight descending (Complex Exams First)
      const weightDiff = getTaskComplexityWeight(b.type) - getTaskComplexityWeight(a.type);
      if (weightDiff !== 0) return weightDiff;
    }
    // Standard chronological fallback
    return new Date(a.date) - new Date(b.date);
  });

  const getTaskBadgeStyle = (type) => {
    switch (type) {
      case 'exam':
        return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50';
      case 'project':
        return 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50';
      default:
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
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

  // ADHD Time Perception: Draining workload battery calculation
  const getWorkloadBarDetails = (dateStr) => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const taskDate = new Date(dateStr);
      
      // Calculate whole days remaining
      const msDiff = taskDate.getTime() - todayStart.getTime();
      const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24)) - 1;

      if (daysLeft < 0) {
        return { percent: 0, color: 'bg-rose-500', label: 'Overdue' };
      }
      if (daysLeft === 0) {
        return { percent: 10, color: 'bg-rose-500 animate-pulse', label: 'Due Today' };
      }
      if (daysLeft === 1) {
        return { percent: 25, color: 'bg-orange-500', label: 'Due Tomorrow' };
      }
      if (daysLeft <= 3) {
        return { percent: 50, color: 'bg-amber-400', label: `${daysLeft} days left` };
      }
      if (daysLeft <= 7) {
        return { percent: 75, color: 'bg-blue-400', label: `${daysLeft} days left` };
      }
      return { percent: 100, color: 'bg-emerald-400', label: `${daysLeft} days left` };
    } catch {
      return { percent: 100, color: 'bg-emerald-400', label: 'No Limit' };
    }
  };

  // ADHD Executive Function: Automatic 5-step task decomposition engine
  const getDecomposedSteps = (title, type) => {
    const t = title.toLowerCase();
    
    if (t.includes('lab') || t.includes('report') || t.includes('practical')) {
      return [
        { step: "Gather lab readings, graphs, and experiment data", time: "15m" },
        { step: "Outline lab methodology and list instruments used", time: "15m" },
        { step: "Perform formula calculations and draw conclusions", time: "25m" },
        { step: "Draft analysis, experiment discussion, and references", time: "40m" },
        { step: "Review report formatting and export to PDF", time: "15m" }
      ];
    }
    
    if (t.includes('code') || t.includes('program') || t.includes('dev') || t.includes('app') || t.includes('project')) {
      return [
        { step: "Analyze requirements and sketch structure / components", time: "20m" },
        { step: "Create folder structure and install libraries", time: "15m" },
        { step: "Code core functions and layout components", time: "60m" },
        { step: "Run simple test suites and fix syntax errors", time: "30m" },
        { step: "Format comments, check console, and commit to Git", time: "15m" }
      ];
    }
    
    if (type === 'exam') {
      return [
        { step: "Collect all slides, mock sheets, and past lessons", time: "15m" },
        { step: "Read chapters and write down top terms on paper", time: "40m" },
        { step: "Practice 2-3 previous papers under timer conditions", time: "60m" },
        { step: "Review mistakes and write small flashcards", time: "30m" },
        { step: "Get solid rest and do a quick 10m review before paper", time: "10m" }
      ];
    }
    
    if (type === 'project') {
      return [
        { step: "Read the project guidelines and define scope", time: "20m" },
        { step: "Perform academic search and organize citations", time: "45m" },
        { step: "Draft core project sections / assemble mock parts", time: "90m" },
        { step: "Double check guidelines criteria and fix alignment", time: "25m" },
        { step: "Format references page and submit final deliverable", time: "20m" }
      ];
    }
    
    return [
      { step: "Clear desk space, close tabs, and set a 25m focus clock", time: "5m" },
      { step: "Scribble a 3-sentence draft of your main goal", time: "10m" },
      { step: "Focus block 1: Work on the absolute hardest section", time: "35m" },
      { step: "Take a quick 5-minute break to stretch and drink water", time: "5m" },
      { step: "Focus block 2: Add final touches and proofread work", time: "25m" }
    ];
  };

  const handleToggleCheck = (taskId, idx) => {
    const key = `${taskId}-${idx}`;
    setCheckedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  return (
    <section 
      id="tasks-timeline-container"
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 run-fade relative overflow-hidden transition-all duration-500 max-w-xl mx-auto"
    >
      
      {/* Background visual details */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl">
            <CalendarRange size={18} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Upcoming Workload</h3>
            <span className="text-[10px] text-blue-500 dark:text-blue-400 font-extrabold uppercase tracking-wider">
              {filterMode} view • {energyLevel} energy sort
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          Total: {sortedTasks.length}
        </span>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-800">
            <AlertCircle size={20} />
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            No upcoming deadlines.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            You're all clear! Add new milestones or ask AI to model a plan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const barDetails = getWorkloadBarDetails(task.date);
            const isExpanded = expandedTaskId === task.id;
            const decomposed = getDecomposedSteps(task.title, task.type);
            const totalSteps = decomposed.length;
            const checkedCount = decomposed.filter((_, i) => checkedSteps[`${task.id}-${i}`]).length;
            const stepsProgressPercent = Math.round((checkedCount / totalSteps) * 100);

            return (
              <div
                key={task.id}
                className="group flex flex-col p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 hover:bg-white/80 dark:hover:bg-slate-900/60 hover:border-blue-200/50 dark:hover:border-slate-700/60 transition-all duration-300 hover:shadow-sm"
              >
                
                {/* Core Task Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-0.5 p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getTaskBadgeStyle(task.type)}`}
                    >
                      {getTaskIcon(task.type)}
                    </div>

                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold tracking-wide uppercase">
                          {task.course}
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                          {task.group}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Due Date & Sync operations */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:border-none">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-black text-slate-700 dark:text-slate-300 font-display">
                        {formatTaskDate(task.date)}
                      </div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                        {task.type}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Google Calendar Sync */}
                      <GoogleSync task={task} />

                      {/* Delete button */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                        title="Remove Task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ADHD Visual Draining battery bar */}
                <div className="w-full mt-4 flex items-center gap-3">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/40 relative">
                    <div 
                      className={`h-full ${barDetails.color} rounded-full transition-all duration-500`}
                      style={{ width: `${barDetails.percent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider shrink-0 text-slate-500 dark:text-slate-400 min-w-[75px] text-right">
                    {barDetails.label}
                  </span>
                </div>

                {/* ADHD Auto-Decomposition Action Button */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      isExpanded 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700' 
                        : 'bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 hover:border-blue-200 dark:hover:border-blue-800'
                    }`}
                  >
                    <ListTodo size={13} />
                    {isExpanded ? "Hide Steps" : "Break it Down"} 
                    <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {checkedCount}/{totalSteps} done
                    </span>
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  
                  {isExpanded && stepsProgressPercent === 100 && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40 animate-[bounce_0.5s_ease]">
                      All focus steps completed! 🏆
                    </span>
                  )}
                </div>

                {/* ADHD Expandable Micro-task checklist panel */}
                {isExpanded && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 run-zoom text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Decomposed Checklist (Focus Tasks)
                      </span>
                      {/* checklist progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${stepsProgressPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                          {stepsProgressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1.5">
                      {decomposed.map((stepObj, idx) => {
                        const isStepChecked = !!checkedSteps[`${task.id}-${idx}`];
                        return (
                          <button
                            key={idx}
                            onClick={() => handleToggleCheck(task.id, idx)}
                            className="w-full flex items-start gap-3 p-2 rounded-xl text-left hover:bg-white dark:hover:bg-slate-900/40 transition duration-150 border border-transparent hover:border-slate-200/30 dark:hover:border-slate-800/30 group/step"
                          >
                            <span className={`mt-0.5 shrink-0 transition-colors ${isStepChecked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700 group-hover/step:text-blue-500'}`}>
                              {isStepChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                            </span>
                            <div className="flex-grow flex items-center justify-between gap-4">
                              <span className={`text-[11px] font-bold leading-normal transition-all ${isStepChecked ? 'line-through text-slate-400 dark:text-slate-600 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                {stepObj.step}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md shrink-0">
                                ⏱️ {stepObj.time}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
}