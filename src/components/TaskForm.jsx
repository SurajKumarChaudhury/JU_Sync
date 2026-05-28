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
    // Default monthly selection to today's date if it falls in the options list
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
      // Default to noon on the selected weekday
      finalDateStr = `${weeklyVal}T12:00:00`;
    } else {
      if (!monthlyVal) return;
      // Default to noon on the selected month day
      finalDateStr = `${monthlyVal}T12:00:00`;
    }

    onAddTask({
      title: title.trim(),
      course: course.toUpperCase().replace(/\s+/g, ''),
      date: finalDateStr,
      type,
      group
    });

    setTitle('');
    setCourse('');
    setType('submission');
    setGroup('Personal');
  };

  const [type, setType] = useState('submission');
  const [group, setGroup] = useState('Personal');

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 run-fade relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Plus size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Add New Deadline</h3>
          <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider">
            {filterMode} scheduler
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        
        {/* Title Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
            Deadline / Task Title
          </label>
          <div className="relative flex items-center">
            <BookOpen size={16} className="absolute left-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="e.g. Lab Report, Midterm" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-semibold" 
              required 
            />
          </div>
        </div>

        {/* Course Code Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
            Course Code
          </label>
          <div className="relative flex items-center">
            <Layers size={16} className="absolute left-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="e.g. CS401, EE202" 
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-semibold" 
              required 
            />
          </div>
        </div>

        {/* Due Date Context Picker */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
            {filterMode === 'daily' && 'Due Time (Hours & Minutes)'}
            {filterMode === 'weekly' && 'Select Day of Week'}
            {filterMode === 'monthly' && 'Select Day of Month'}
          </label>
          <div className="relative flex items-center">
            <Calendar size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            
            {filterMode === 'daily' && (
              <input 
                type="time" 
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-bold text-slate-600 cursor-pointer" 
                required 
              />
            )}

            {filterMode === 'weekly' && (
              <select 
                value={weeklyVal}
                onChange={(e) => setWeeklyVal(e.target.value)}
                className="w-full pl-11 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-bold text-slate-600 cursor-pointer appearance-none"
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
                className="w-full pl-11 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-bold text-slate-600 cursor-pointer appearance-none"
                required
              >
                {getMonthlyOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Dynamic Selects Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Task Type
            </label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="submission">Submission</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Target Group
            </label>
            <select 
              value={group} 
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="Personal">Personal</option>
              <option value="Group A">Group A</option>
              <option value="Group B">Group B</option>
              <option value="All">All Class</option>
            </select>
          </div>
        </div>

      </div>

      <button 
        type="submit" 
        className="w-full premium-btn text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs shadow-md"
      >
        <Plus size={16} />
        Add to Timetable
      </button>
    </form>
  );
}