import React, { useState } from 'react';
import { login } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = () => {
    const forgotUrl = 'https://prompt-forge-ai-v1.vercel.app/password-login';
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: forgotUrl });
    } else {
      window.open(forgotUrl, '_blank');
    }
  };

  const handleSignUpClick = () => {
    const signupUrl = import.meta.env.VITE_WEB_APP_SIGNUP_URL || 'http://localhost:5173/signup';
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: signupUrl });
    } else {
      window.open(signupUrl, '_blank');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 w-full text-[var(--text-primary)]">
      <div className="w-full max-w-sm p-6 bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-main)]">
        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          PromptForge AI
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 mt-6"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            New user?{' '}
            <button
              type="button"
              onClick={handleSignUpClick}
              className="text-[var(--text-primary)] hover:underline cursor-pointer font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
