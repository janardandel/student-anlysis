import React, { useState } from 'react';
import { X, LogIn, Check, LogOut, AlertCircle } from 'lucide-react';
import { login, clearSession, getSession } from '../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const session = getSession();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onCredentialsUpdated();
        onClose();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    onCredentialsUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161616] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#2A2A2A]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center space-x-2.5">
            <LogIn className="w-5 h-5 text-[#F40009]" />
            <h3 className="text-base font-bold text-[#F0F0F0]">
              {session ? 'Account' : 'Sign In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#777777] hover:text-[#F0F0F0] rounded-lg hover:bg-[#242424]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {session ? (
          <div className="p-6 space-y-4">
            <p className="text-xs text-[#A0A0A0]">
              Signed in as <strong className="text-[#F0F0F0]">{session.user.email}</strong>
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-bold text-white bg-[#F40009] hover:bg-[#A30006] rounded-xl shadow-pitthu-red transition-all flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Sign in with your owner/teacher account. Leave signed out to browse in interactive{' '}
              <strong>Demo mode</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@yourinstitute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/15 text-red-400 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-red-500/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {saved && (
              <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Signed in! Loading your institute data...</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-[#A0A0A0] hover:bg-[#242424] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-[#F40009] hover:bg-[#A30006] rounded-xl shadow-pitthu-red transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
