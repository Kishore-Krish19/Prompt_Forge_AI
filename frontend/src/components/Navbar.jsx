import React from 'react';
import { Sparkles, Github, BookOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

export default function Navbar({ activeTab = 'optimizer', onTabChange }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl text-white">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                PromptForge AI
              </h1>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => onTabChange && onTabChange('optimizer')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'optimizer' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Optimizer
            </button>
            <button
              onClick={() => onTabChange && onTabChange('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Dashboard
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
              <BookOpen size={18} />
              <span className="hidden sm:inline">Docs</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
              <Github size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </button> */}
            <div className="w-px bg-slate-200" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-500/30 hover:text-purple-600 transition-all duration-200 active:scale-95"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

