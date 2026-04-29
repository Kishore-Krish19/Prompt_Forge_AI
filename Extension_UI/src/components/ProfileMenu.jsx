import React from 'react';
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react';
import { getAuthToken, getAuthHeaders, removeAuthToken } from '../services/api';
import { API_BASE_URL } from '../utils/api';

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
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/usage`, {
          method: 'GET',
          headers,
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
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-transparent px-2 py-1 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus:outline-none"
        title={email}
      >
        <UserCircle2 className="h-5 w-5 text-[var(--text-primary)]" />
        <span className="max-w-[120px] truncate">{email}</span>
        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 z-[9999] overflow-hidden rounded-lg border border-[var(--border-main)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-2xl shadow-black/50"
          style={{ backgroundColor: '#151c2f', opacity: 1 }}
        >
          <div className="space-y-3 p-4 text-sm text-[var(--text-primary)]">
            <div>
              <p className="truncate font-medium text-[var(--text-primary)]">{email}</p>
              <p className="text-xs text-[var(--text-muted)]">{role}</p>
            </div>

            <div className="space-y-1 border-t border-[var(--border-light)] pt-3 text-xs text-[var(--text-muted)]">
              <p className="font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Usage</p>
              <p className="text-sm text-[var(--text-primary)]">Gemini: {usage.gemini || 0}</p>
              <p className="text-sm text-[var(--text-primary)]">Groq: {usage.groq || 0}</p>
              <p className="text-sm text-[var(--text-primary)]">Qwen: {usage.qwen || usage.huggingface || 0}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              <LogOut className="h-4 w-4 text-white" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;