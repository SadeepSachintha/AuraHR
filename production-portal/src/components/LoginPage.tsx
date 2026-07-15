import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Wind, KeyRound, Mail, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userEmail: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sandboxUsed, setSandboxUsed] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Attempt Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 2. Fallback to Local Sandbox Credentials for demo/development if Supabase fails
        if (email.trim() === 'admin@aurahr.io' && password === 'admin123') {
          setSandboxUsed(true);
          setTimeout(() => {
            onLoginSuccess('admin@aurahr.io (Local Sandbox)');
          }, 1000);
          return;
        }
        throw new Error(error.message);
      }

      if (data?.user) {
        onLoginSuccess(data.user.email || 'admin@aurahr.io');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate. Check credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex items-center justify-center p-4 relative font-sans">
      {/* Decorative ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Login Card */}
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle top light bar */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <Wind size={28} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">AuraHR Portal Login</h2>
            <p className="text-gray-400 text-xs mt-1">Authenticate to access the administrative SaaS management console.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-3.5 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sandboxUsed && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-3.5 mb-6">
            <Sparkles size={16} className="shrink-0" />
            <span>Valid Sandbox Key! Activating local offline database.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-sm">
          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurahr.io"
                className="glass-input w-full pl-10 text-xs"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold pl-1">Secret Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full pl-10 text-xs"
              />
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 text-bgSpace font-bold rounded-xl text-xs hover:opacity-90 transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-bgSpace border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In Console</span>
            )}
          </button>
        </form>

        {/* Sandbox details hint */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[11px] text-center text-gray-500">
          <span>Sandbox fallback details: </span>
          <code className="text-cyan-400/80 font-mono">admin@aurahr.io</code> / <code className="text-cyan-400/80 font-mono">admin123</code>
        </div>
      </div>
    </div>
  );
};
