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
    <header className="sticky top-0 z-30 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Pitthugram Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <a href="#" className="flex items-center gap-2.5">
              <img
                src="./logo.png"
                alt="Pitthugram"
                className="h-8 sm:h-9 w-auto rounded-md shadow-pitthu-red border border-[#F40009]/40 transition-transform hover:scale-105"
              />
            </a>
            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-[#2A2A2A]">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F40009]/15 text-[#F40009] border border-[#F40009]/30">
                Analytics & Planning
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-1.5 bg-[#161616] p-1 rounded-xl border border-[#2A2A2A]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#F40009] text-white shadow-md shadow-[#F40009]/30'
                  : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'students'
                  ? 'bg-[#F40009] text-white shadow-md shadow-[#F40009]/30'
                  : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students & Tests</span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'planning'
                  ? 'bg-[#F40009] text-white shadow-md shadow-[#F40009]/30'
                  : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#1E1E1E]'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Student Planning</span>
            </button>
          </nav>

          {/* Actions & Connection Badge */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Data"
              className="p-2 text-[#A0A0A0] hover:text-[#F40009] hover:bg-[#1E1E1E] rounded-lg transition-colors border border-[#2A2A2A]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F40009]' : ''}`} />
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#161616] hover:bg-[#1E1E1E] transition-colors text-xs font-semibold text-[#F0F0F0]"
            >
              <Database className={`w-3.5 h-3.5 ${isLiveMode ? 'text-emerald-400' : 'text-[#F40009]'}`} />
              <span className="hidden md:inline">
                {isLiveMode ? 'Connected: Supabase' : 'Demo Mode'}
              </span>
              <Settings className="w-3.5 h-3.5 text-[#777777]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
