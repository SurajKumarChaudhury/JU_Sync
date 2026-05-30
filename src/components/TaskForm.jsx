import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Layers } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function TaskForm({ onAddTask, filterMode = 'weekly' }) {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  
  // Specific states for each heatmap mode picker
  const [timeVal, setTimeVal] = useState('12:00'); // Daily
  const [weeklyVal, setWeeklyVal] = useState(''); // Weekly YYYY-MM-DD
  const [monthlyVal, setMonthlyVal] = useState(''); // Monthly YYYY-MM-DD
  
  const [type, setType] = useState('submission');
  const [group, setGroup] = useState('Personal');

  // ADHD Autosave: Restore draft in real-time on mount
  React.useEffect(() => {
    const savedTitle = localStorage.getItem('acadesk_autosave_title');
    const savedCourse = localStorage.getItem('acadesk_autosave_course');
    if (savedTitle) setTitle(savedTitle);
    if (savedCourse) setCourse(savedCourse);
  }, []);

  // ADHD Autosave: Update drafts on changes
  React.useEffect(() => {
    localStorage.setItem('acadesk_autosave_title', title);
  }, [title]);

  React.useEffect(() => {
    localStorage.setItem('acadesk_autosave_course', course);
  }, [course]);

  // Generate dynamic picklists
  const getWeeklyOptions = () => {
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(now, i);
      return {
        value: format(d, 'yyyy-MM-dd'),
        label: format(d, 'EEEE (MMM d)')
      };
    });
  };

  const getMonthlyOptions = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: totalDays }).map((_, i) => {
      const dayNum = i + 1;
      const d = new Date(year, month, dayNum);
      const j = dayNum % 10, k = dayNum % 100;
      let suffix = "th";
      if (j === 1 && k !== 11) suffix = "st";
      else if (j === 2 && k !== 12) suffix = "nd";
      else if (j === 3 && k !== 13) suffix = "rd";
      
      return {
        value: format(d, 'yyyy-MM-dd'),
        label: `${dayNum}${suffix} - ${format(d, 'EEE')}`
      };
    });
  };

  // Initialize weekly/monthly dropdown selections
  React.useEffect(() => {
    const weeklyOptions = getWeeklyOptions();
    if (weeklyOptions.length > 0) setWeeklyVal(weeklyOptions[0].value);
    
    const monthlyOptions = getMonthlyOptions();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasToday = monthlyOptions.some(opt => opt.value === todayStr);
    setMonthlyVal(hasToday ? todayStr : (monthlyOptions[0]?.value || ''));
  }, [filterMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !course.trim()) return;

    let finalDateStr = '';
    const now = new Date();
    const todayISOStr = format(now, 'yyyy-MM-dd');

    if (filterMode === 'daily') {
      if (!timeVal) return;
      finalDateStr = `${todayISOStr}T${timeVal}:00`;
    } else if (filterMode === 'weekly') {
      if (!weeklyVal) return;
      finalDateStr = `${weeklyVal}T12:00:00`;
    } else {
      if (!monthlyVal) return;
      finalDateStr = `${monthlyVal}T12:00:00`;
    }

    onAddTask({
      title: title.trim(),
      course: course.toUpperCase().replace(/\s+/g, ''),
      date: finalDateStr,
      type,
      group
    });

    // Clear inputs and autosave keys
    setTitle('');
    setCourse('');
    setType('submission');
    setGroup('Personal');
    localStorage.removeItem('acadesk_autosave_title');
    localStorage.removeItem('acadesk_autosave_course');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 run-fade relative overflow-hidden max-w-xl mx-auto text-left"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl animate-pulse">
          <Plus size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Add New Deadline</h3>
          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-extrabold uppercase tracking-wider">
            {filterMode} scheduler • autosave active 🛡️
          </span>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: GENERAL DETAILS (Chunking Content) */}
        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
            Section 1: General Details 📝
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Deadline / Task Title
              </label>
              <div className="relative flex items-center">
                <BookOpen size={16} className="absolute left-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Lab Report, Midterm" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200" 
                  required 
                />
              </div>
            </div>

            {/* Course Code Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Course Code
              </label>
              <div className="relative flex items-center">
                <Layers size={16} className="absolute left-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. CS401, EE202" 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200" 
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SCHEDULE & CATEGORY (Chunking Content) */}
        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 space-y-4">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
            Section 2: Schedule & Category ⏰
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Due Date Context Picker */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1 truncate">
                {filterMode === 'daily' && 'Due Time (Hrs & Mins)'}
                {filterMode === 'weekly' && 'Day of Week'}
                {filterMode === 'monthly' && 'Day of Month'}
              </label>
              <div className="relative flex items-center">
                <Calendar size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                
                {filterMode === 'daily' && (
                  <input 
                    type="time" 
                    value={timeVal}
                    onChange={(e) => setTimeVal(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer" 
                    required 
                  />
                )}

                {filterMode === 'weekly' && (
                  <select 
                    value={weeklyVal}
                    onChange={(e) => setWeeklyVal(e.target.value)}
                    className="w-full pl-11 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer appearance-none"
                    required
                  >
                    {getWeeklyOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}

                {filterMode === 'monthly' && (
                  <select 
                    value={monthlyVal}
                    onChange={(e) => setMonthlyVal(e.target.value)}
                    className="w-full pl-11 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer appearance-none"
                    required
                  >
                    {getMonthlyOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Task Type */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Task Type
              </label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-bold text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
              >
                <option value="submission">Submission</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
              </select>
            </div>

            {/* Target Group */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Target Group
              </label>
              <select 
                value={group} 
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 text-xs font-bold text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
              >
                <option value="Personal">Personal</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
                <option value="All">All Class</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      <button 
        type="submit" 
        className="w-full premium-btn text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-md mt-6"
      >
        <Plus size={16} />
        Add to Timetable
      </button>
    </form>
  );
}