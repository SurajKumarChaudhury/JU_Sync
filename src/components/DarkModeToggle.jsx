import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('acadesk_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('acadesk_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('acadesk_dark_mode', 'false');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      className="p-2.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all flex items-center justify-center relative overflow-hidden shadow-sm hover:shadow-md active:scale-95 bg-white/40 backdrop-blur-md"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          size={17} 
          className={`absolute transition-all duration-500 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`} 
        />
        {/* Moon Icon */}
        <Moon 
          size={17} 
          className={`absolute transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100 text-indigo-400' : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </button>
  );
}
