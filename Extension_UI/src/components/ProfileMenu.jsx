import React from 'react';
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react';
import { getAuthToken, removeAuthToken } from '../services/api';

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

  if (typeof atob === 'function') {
    return atob(padded);
  }

  return Buffer.from(padded, 'base64').toString('utf8');
};

const decodeToken = (token) => {
  try {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
};

const ProfileMenu = ({ onLogout }) => {
  const [open, setOpen] = React.useState(false);
  const [usage, setUsage] = React.useState({ gemini: 0, groq: 0, qwen: 0 });
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const token = await getAuthToken();
      if (!mounted) {
        return;
      }

      setUser(decodeToken(token));

      if (!token) {
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/usage', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (mounted) {
          setUsage(data?.usage || { gemini: 0, groq: 0, qwen: 0 });
        }
      } catch {
        // Keep the menu usable even if usage stats fail to load.
      }
    };

    loadProfile();

    const handleUsageUpdated = () => {
      loadProfile();
    };

    window.addEventListener('usageUpdated', handleUsageUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('usageUpdated', handleUsageUpdated);
    };
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest?.('[data-profile-menu]')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const email = user?.sub || user?.email || 'Unknown';
  const role = user?.is_admin ? 'Admin' : (user?.role ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1) : 'User');

  const handleLogout = async () => {
    await removeAuthToken();
    setOpen(false);
    onLogout?.();
  };

  return (
    <div className="relative" data-profile-menu>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-[#111827] px-3 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-800"
        title={email}
      >
        <UserCircle2 className="h-4 w-4 text-blue-400" />
        <span className="max-w-[92px] truncate">{email}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 z-50 overflow-hidden rounded-xl border border-gray-700 bg-[#111827] shadow-xl shadow-black/30">
          <div className="space-y-2 p-3 text-sm text-gray-200">
            <div>
              <p className="truncate font-medium text-white">{email}</p>
              <p className="text-xs text-gray-400">{role}</p>
            </div>

            <div className="space-y-1 border-t border-gray-800 pt-2 text-xs text-gray-300">
              <p className="font-semibold uppercase tracking-[0.18em] text-gray-500">Usage</p>
              <p>Gemini: {usage.gemini || 0}</p>
              <p>Groq: {usage.groq || 0}</p>
              <p>Qwen: {usage.qwen || usage.huggingface || 0}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;