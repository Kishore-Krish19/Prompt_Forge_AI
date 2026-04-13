import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', { email, password });
      const data = res.data || res;
      const token = data.access_token || data.token || data.accessToken || data.jwt;
      if (!token) throw new Error('No token returned');
      localStorage.setItem('token', token);
      const isAdmin = data.is_admin || data.isAdmin || false;
      localStorage.setItem('is_admin', isAdmin ? 'true' : 'false');
      if (isAdmin) {
        navigate('/admin');
      } else {
        alert('Not an admin');
      }
    } catch (err) {
      alert(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow mt-24">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      <input className="w-full border p-2 rounded mb-3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" className="w-full border p-2 rounded mb-3" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={handleLogin} disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
    </div>
  );
}
