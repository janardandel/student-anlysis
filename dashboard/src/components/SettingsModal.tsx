import React, { useState } from 'react';
import { X, Database, Check, Trash2 } from 'lucide-react';
import { getSavedCredentials, saveCredentials, clearCredentials, resetSupabaseClient } from '../lib/supabase';

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
  const currentCreds = getSavedCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCredentials(url.trim(), anonKey.trim());
    resetSupabaseClient();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onCredentialsUpdated();
      onClose();
    }, 1000);
  };

  const handleResetToMock = () => {
    clearCredentials();
    setUrl('');
    setAnonKey('');
    resetSupabaseClient();
    onCredentialsUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161616] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#2A2A2A]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-[#F40009]" />
            <h3 className="text-base font-bold text-[#F0F0F0]">Supabase Database Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#777777] hover:text-[#F0F0F0] rounded-lg hover:bg-[#242424]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-xs text-[#A0A0A0] leading-relaxed">
            Enter your Supabase project credentials to connect this dashboard directly to your live database.
            Leave blank to use interactive <strong>Demo mode</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">
              Supabase Anon / Public Key
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-[#242424] border border-[#333333] rounded-xl text-[#F0F0F0] placeholder-[#777777] focus:border-[#F40009] focus:ring-2 focus:ring-[#F40009]/20"
            />
          </div>

          {saved && (
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/30">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Credentials saved! Connecting to Supabase...</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToMock}
              className="text-xs text-[#F40009] hover:underline font-bold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Switch to Demo Mode</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-[#A0A0A0] hover:bg-[#242424] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#F40009] hover:bg-[#A30006] rounded-xl shadow-pitthu-red transition-all"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
