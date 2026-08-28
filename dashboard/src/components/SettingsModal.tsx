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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Supabase Connection Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your Supabase project credentials to connect this dashboard directly to your live database.
            Leave blank to use interactive <strong>Demo / Mock data</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supabase Anon / Public Key
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {saved && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Credentials saved! Connecting to Supabase...</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToMock}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Switch to Demo Mode</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-colors"
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
