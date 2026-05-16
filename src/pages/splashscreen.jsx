import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/acadesk-logo.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#edf7f3] via-[#e7f5ff] to-[#f4f7ff] flex items-center justify-center relative">
      
      {/* 100% Bulletproof Injected Styles */}
      <style>{`
        @keyframes forceZoomIn {
          0% { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes forceFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes forceTextReveal {
          0% { opacity: 0; letter-spacing: -0.2em; filter: blur(8px); }
          100% { opacity: 1; letter-spacing: 0.05em; filter: blur(0); }
        }
        @keyframes forceFadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes forceBlob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .run-zoom { animation: forceZoomIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important; }
        .run-float { animation: forceFloat 4s ease-in-out infinite !important; }
        .run-text { animation: forceTextReveal 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards !important; }
        .run-fade { animation: forceFadeUp 1s ease forwards !important; }
        .run-blob { animation: forceBlob 10s infinite ease-in-out !important; }
      `}</style>

      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl run-blob"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-200/30 rounded-full blur-3xl run-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl run-blob" style={{ animationDelay: '4s' }}></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Glow Ring behind logo */}
        <div className="absolute w-72 h-72 rounded-full bg-blue-300/20 blur-3xl run-zoom"></div>

        {/* Logo Element */}
        <div className="relative run-zoom">
          <div className="run-float">
            <img
              src={logo}
              alt="Acadesk Logo"
              className="w-56 h-56 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Title Text */}
        <h1 
          className="mt-10 text-6xl font-black tracking-wide text-blue-700 opacity-0 run-text"
          style={{ animationDelay: '400ms' }}
        >
          ACADESK
        </h1>

        {/* Tagline */}
        <p 
          className="mt-4 text-lg font-medium tracking-[0.2em] text-slate-500 uppercase opacity-0 run-fade"
          style={{ animationDelay: '800ms' }}
        >
          Focus beautifully
        </p>

      </div>
    </div>
  );
}