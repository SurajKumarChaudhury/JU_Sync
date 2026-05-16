import React, { useState } from 'react';

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('submission');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !course || !date) return;

    onAddTask({
      id: Date.now(),
      title,
      course,
      date: new Date(date).toISOString(),
      type,
      group: 'Personal'
    });

    setTitle('');
    setCourse('');
    setDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-bold mb-4">Add New Deadline</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <input 
          type="text" placeholder="Task Title (e.g. Lab Report)" value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded-lg w-full" required 
        />
        <input 
          type="text" placeholder="Course Code (e.g. CS401)" value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="border p-2 rounded-lg w-full" required 
        />
        <input 
          type="date" value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded-lg w-full" required 
        />
        <select 
          value={type} onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded-lg w-full bg-white"
        >
          <option value="submission">Submission</option>
          <option value="exam">Exam</option>
          <option value="project">Project</option>
        </select>
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
        + Add to Timetable
      </button>
    </form>
  );
}