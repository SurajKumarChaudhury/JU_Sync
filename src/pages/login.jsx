import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function Login() {
  const { login, signup, logout, loginWithGoogle } = useAuth();

  // Ensure a fresh login page by clearing any existing authenticated user
  useEffect(() => {
    if (logout) {
      logout();
    }
  }, []);

  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Please enter your name.");
        await signup(name, email, password);
        alert(`Your account (${name}) successfully created!`);
      } else {
        await login(email, password);
      }
      // Successful auth, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#edf7f3] via-[#e7f5ff] to-[#f4f7ff] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Floating Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <DarkModeToggle />
      </div>

      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl run-blob"></div>
      <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-blue-200/25 rounded-full blur-3xl run-blob" style={{ animationDelay: "2s" }}></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Icon and Brand Header */}
        <div className="text-center mb-8 run-zoom">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-blue-500/20 font-display">
            A
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-800 font-display tracking-tight">
            Acadesk
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isRegister ? "Create a companion study workspace" : "Your collaborative study companion"}
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 run-fade">
          
          <h2 className="text-xl font-bold text-slate-800 mb-6 font-display flex items-center gap-2">
            {isRegister ? <UserPlus size={20} className="text-blue-500" /> : <LogIn size={20} className="text-blue-500" />}
            {isRegister ? "Get Started" : "Welcome Back"}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5 text-sm animate-shake">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-sans text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-sans text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all font-sans text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-btn text-white py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 text-sm mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>{isRegister ? "Create Account" : "Access Workspace"}</>
              )}
            </button>
          </form>

          {/* Form Switch link */}
          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold transition"
            >
              {isRegister
                ? "Already have an account? Sign In"
                : "New here? Create a persistent account"}
            </button>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease; }
      `}</style>
    </div>
  );
}