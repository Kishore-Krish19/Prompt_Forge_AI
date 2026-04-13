import React from 'react';
import { Sparkles, Github, BookOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';
import ProfileMenu from './ProfileMenu';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserFromToken, isAdmin as checkIsAdmin } from '../utils/auth';

export default function Navbar({ activeTab = 'optimizer', onTabChange, usage = null, accountEmail = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const currentPath = location.pathname || '/';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/auth');
  const navigate = useNavigate();
  const userPayload = token ? getUserFromToken() : null;
  const isAdmin = checkIsAdmin();

  if (isAuthPage) return null;

  const isActive = (path) => {
    if (path === '/optimizer' && (currentPath === '/' || currentPath === '')) return true;
    if (path === '/optimizer' && currentPath.startsWith('/optimizer')) return true;
    if (path === '/dashboard' && currentPath.startsWith('/dashboard')) return true;
    if (path === '/admin' && currentPath.startsWith('/admin')) return true;
    return currentPath === path;
  };

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

          {/* Center: Navigation Tabs (only when logged in) */}
          {token ? (
            <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin'); onTabChange && onTabChange('admin'); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin') ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Admin
                  </button>
                )}

                <button
                  onClick={() => { navigate('/optimizer'); onTabChange && onTabChange('optimizer'); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/optimizer') ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Optimizer
                </button>

                <button
                  onClick={() => { navigate('/dashboard'); onTabChange && onTabChange('dashboard'); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/dashboard') ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Dashboard
                </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1" />
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div className="w-px bg-slate-200" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-500/30 hover:text-purple-600 transition-all duration-200 active:scale-95"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile menu placed next to theme toggle (only when logged in) */}
            <div>
              {token && <ProfileMenu />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

