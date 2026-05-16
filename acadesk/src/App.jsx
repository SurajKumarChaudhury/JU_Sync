import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { addDays } from 'date-fns';

// Import our new modules
import Heatmap from './components/Heatmap';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const INITIAL_TASKS = [
  { id: 1, title: 'Computer Architecture Lab Report', course: 'CS401', date: new Date().toISOString(), type: 'submission', group: 'Group A' },
  { id: 2, title: 'Digital Logic Midterm', course: 'CS402', date: addDays(new Date(), 2).toISOString(), type: 'exam', group: 'All' },
];

export default function App() {
  // Main state holding all reminders
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Interactive Functions
  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (idToDelete) => {
    setTasks(tasks.filter(task => task.id !== idToDelete));
  };

  return (
    <div className="min-h-screen p-6 font-sans text-slate-800">
      
      {/* Header */}
      <header className="mb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Calendar size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Synchronicity</h1>
        </div>
        <h2 className="text-xl font-semibold text-slate-600">
          Collaborative Timetable & Deadline Manager
        </h2>
      </header>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1">
          <Heatmap tasks={tasks} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <TaskForm onAddTask={handleAddTask} />
          <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />
        </div>

      </main>
    </div>
  );
}