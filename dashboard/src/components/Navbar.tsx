import React from 'react';
import { LayoutDashboard, Users, ClipboardList, Settings, Database, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'students' | 'planning';
  setActiveTab: (tab: 'overview' | 'students' | 'planning') => void;
  isLiveMode: boolean;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isLiveMode,
  onOpenSettings,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              M
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">MoodleReport</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Analytics & Student Intervention Planning</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students & Tests</span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'planning'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Student Planning</span>
            </button>
          </nav>

          {/* Actions & Connection Badge */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Data"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
            >
              <Database className={`w-3.5 h-3.5 ${isLiveMode ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="hidden md:inline">
                {isLiveMode ? 'Connected: Supabase' : 'Demo / Mock Mode'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
