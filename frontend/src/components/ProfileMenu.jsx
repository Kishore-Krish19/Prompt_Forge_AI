import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useTheme } from '../utils/ThemeContext';

const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    return null;
  }
};

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState({ gemini: 0, groq: 0, qwen: 0 });
  const user = getUserFromToken();
  const email = user?.sub || user?.email || localStorage.getItem('pf_auth_email') || 'Unknown';
  const role = user?.is_admin ? 'Admin' : 'User';
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pf_auth_email');
    localStorage.removeItem('is_admin');
    // use navigate to keep SPA routing
    navigate('/login-password');
  };

  useEffect(() => {
    let mounted = true;
    const fetchUsage = async () => {
      try {
        const res = await API.get('/api/admin/my-usage');
        if (!mounted) return;
        setUsage(res.data || res || { gemini: 0, groq: 0, qwen: 0 });
      } catch (err) {
        console.error('Usage fetch failed', err);
      }
    };

    fetchUsage();
    return () => { mounted = false; };
  }, []);

  console.log('USER:', user);

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          background: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40
        }}
        title={email || 'Account'}
      >
        👤
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '45px',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px',
            width: '220px',
            boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.6)' : '0 5px 15px rgba(0,0,0,0.1)',
            zIndex: 40
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <h4 style={{ marginBottom: '5px', color: isDark ? '#f9fafb' : '#111827' }}>{email}</h4>
            <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: 0 }}>{role}</p>
          </div>

          <hr style={{ margin: '8px 0', border: 'none', borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />

          <h4 style={{ margin: '8px 0', color: isDark ? '#f9fafb' : '#111827' }}>Usage</h4>
          <p style={{ margin: '4px 0', color: isDark ? '#e5e7eb' : '#111827' }}>Gemini: {usage.gemini || 0}</p>
          <p style={{ margin: '4px 0', color: isDark ? '#e5e7eb' : '#111827' }}>Groq: {usage.groq || 0}</p>
          <p style={{ margin: '4px 0', color: isDark ? '#e5e7eb' : '#111827' }}>Qwen: {usage.qwen || usage.huggingface || 0}</p>

          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
