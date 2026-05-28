import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/acadesk-logo.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-tr from-[#eefaf4] via-[#e2f1fc] to-[#f0f3ff] flex items-center justify-center relative">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-cyan-200/20 rounded-full blur-3xl run-blob"></div>
      <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-blue-200/25 rounded-full blur-3xl run-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl run-blob" style={{ animationDelay: '4s' }}></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Glow Ring behind logo */}
        <div className="absolute w-80 h-80 rounded-full bg-blue-400/20 blur-3xl run-zoom"></div>

        {/* Logo Element */}
        <div className="relative run-zoom flex items-center justify-center">
          <div className="run-float p-6 bg-white/40 backdrop-blur-md rounded-full shadow-[0_16px_48px_rgba(37,99,235,0.06)] border border-white/60">
            <img
              src={logo}
              alt="Acadesk Logo"
              className="w-44 h-44 object-contain filter drop-shadow-lg"
              onError={(e) => {
                // Fallback icon representation if logo image fails to load
                e.target.style.display = 'none';
                const el = document.getElementById('logo-fallback');
                if (el) el.style.display = 'flex';
              }}
            />
            {/* Fallback Icon if PNG logo is missing */}
            <div 
              id="logo-fallback" 
              className="hidden w-44 h-44 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-6xl shadow-inner font-display"
            >
              S
            </div>
          </div>
        </div>

        {/* Title Text */}
        <h1 
          className="mt-8 text-6xl font-black tracking-tight text-slate-800 opacity-0 run-text font-display flex items-center gap-1.5"
          style={{ animationDelay: '450ms' }}
        >
          Acadesk
        </h1>

        {/* Tagline */}
        <p 
          className="mt-3 text-sm font-bold tracking-[0.3em] text-slate-400 uppercase opacity-0 run-fade font-sans"
          style={{ animationDelay: '900ms' }}
        >
          Focus beautifully
        </p>

        {/* Loading indicator bar */}
        <div 
          className="mt-12 w-48 h-1 bg-slate-200/50 rounded-full overflow-hidden opacity-0 run-fade"
          style={{ animationDelay: '1200ms' }}
        >
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-[loading_3.5s_ease-in-out_infinite]"></div>
          <style>{`
            @keyframes loading {
              0% { width: 0%; transform: translateX(-10%); }
              50% { width: 80%; transform: translateX(20%); }
              100% { width: 100%; transform: translateX(110%); }
            }
          `}</style>
        </div>

      </div>
    </div>
  );
}