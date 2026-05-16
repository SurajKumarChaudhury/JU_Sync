import React from 'react';
import { BookOpen, Clock, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import GoogleCalendarSync from './GoogleCalendarSync'; // <-- Import here

export default function TaskList({ tasks, onDeleteTask }) {
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-blue-600" />
        <h3 className="text-lg font-bold">Upcoming Workload</h3>
      </div>

      {sortedTasks.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No upcoming deadlines. You're all clear!</p>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-lg ${task.type === 'exam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {task.type === 'exam' ? <BookOpen size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{task.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{task.course} • {task.group}</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-3 text-right">
                <div>
                  <div className="text-sm font-bold text-slate-700">
                    {format(new Date(task.date), 'MMM do, yyyy')}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                    {task.type}
                  </div>
                </div>
                
                {/* ---> Add the Sync Button Here <--- */}
                <GoogleCalendarSync task={task} />
                
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete Task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}