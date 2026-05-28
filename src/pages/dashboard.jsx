import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Calendar, LogOut, User, Database, Settings } from 'lucide-react';

import Heatmap from '../components/Heatmap';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import AIAssistant from '../components/AIAssistant';

export default function Dashboard() {
  const { currentUser, logout, updateProfileImage } = useAuth();
  const { tasks, addTask, deleteTask } = useTasks();
  const navigate = useNavigate();
  
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('sync_gemini_api_key') || '');
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('sync_google_client_id') || '');
  const fileInputRef = React.useRef(null);
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Log Out handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Settings Save handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('sync_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('sync_gemini_api_key');
    }
    if (googleClientId.trim()) {
      localStorage.setItem('sync_google_client_id', googleClientId.trim());
    } else {
      localStorage.removeItem('sync_google_client_id');
    }
    setShowSettings(false);
    alert('Acadesk configuration updated successfully! Please reload the page if you updated your Google Client ID.');
  };

  const [heatmapMode, setHeatmapMode] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'

  return (
    <div className="min-h-screen pb-16 font-sans text-slate-800 bg-gradient-to-tr from-[#f3faf6] via-[#eef4fc] to-[#f8f9fe] relative overflow-hidden">
      
      {/* Background blobs for elite look */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-blue-200/10 rounded-full blur-3xl run-blob"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-cyan-200/10 rounded-full blur-3xl run-blob" style={{ animationDelay: '3s' }}></div>

      {/* Top Header / Profile Navigation */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/50 px-6 py-4 mb-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-500/15">
              <Calendar size={22} className="run-float" />
            </div>
            <div>
              <h1 className="text-xl font-black font-display tracking-tight text-slate-800">
                Acadesk
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-slate-400">
                Collaborative Planner
              </span>
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-4">
            
            {/* Database indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
              <Database size={13} className="animate-pulse" />
              <span>Firebase Cloud DB Active</span>
            </div>

            {/* Profile badge dropdown / detail */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700">
                   {currentUser?.name || 'Academic User'}
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  {currentUser?.email}
                </p>
              </div>

              {/* User avatar */}
               <div className="relative">
                 <button type="button" onClick={handleAvatarClick} className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-blue-200 text-blue-700 font-bold flex items-center justify-center shadow-inner overflow-hidden">
                   {currentUser?.image ? (
                     <img src={currentUser.image} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                   ) : (
                     currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User size={18} />
                   )}
                 </button>
                 <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
               </div>
            </div>

            {/* Configuration Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white/80 rounded-xl border border-transparent hover:border-slate-200/50 transition-all"
              title="AI Settings"
            >
              <Settings size={18} />
            </button>

            {/* Log Out button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>

          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace Grid */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Crunch Heatmap and AI Rearranger Command Console (5 cols) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          
          <Heatmap tasks={tasks} mode={heatmapMode} setMode={setHeatmapMode} />
          
          <AIAssistant apiKey={apiKey} setApiKey={setApiKey} />

        </div>

        {/* Right Columns: Add Deadline Form and Tasks Timelines (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          <TaskForm onAddTask={(task) => addTask(task.title, task.course, task.date, task.type, task.group)} filterMode={heatmapMode} />

          <TaskList filterMode={heatmapMode} />

        </div>

      </main>

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 run-fade">
            <h3 className="text-xl font-bold font-display text-slate-800 mb-2 flex items-center gap-2">
              <Settings className="text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
              Configure AI Rescheduler
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Acadesk includes a local smart engine, but you can enable advanced DeepMind-style reasoning by configuring your Gemini API Key.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block ml-1">
                  Stored safely in your local browser storage.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Google OAuth Client ID
                </label>
                <input
                  type="text"
                  placeholder="1029384756-...apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-[10px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block ml-1">
                  Allows calendar syncing to your specific Google Cloud project.
                </span>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}