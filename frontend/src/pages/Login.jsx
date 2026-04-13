import React, { useRef, useState } from 'react'
import API, { sendOtp } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userExists, setUserExists] = useState(false)
  const emailRef = useRef(null)

  const navigate = useNavigate()

  const handleSend = async () => {
    setError('')
    if (!email || !email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const res = await sendOtp(email.trim())

      // New user flow: route to OTP verification to create password
      if (res && res.status === 'NEW') {
        localStorage.setItem('pf_auth_email', email.trim())
        localStorage.setItem('pf_auth_flow', 'signup')
        window.location.href = '/auth/verify'
        return
      }

      // Existing user: show options (login / reset password)
      if (res && res.status === 'EXISTS') {
        setUserExists(true)
        localStorage.setItem('pf_auth_email', email.trim())
        return
      }

      // fallback
      setMessage('OTP sent — check your email.')
    } catch (err) {
      setMessage(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      <input
        ref={emailRef}
        className="w-full border p-2 rounded mb-3"
        placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={handleSend} disabled={loading}>
        {loading? 'Sending...' : 'Send OTP'}
      </button>
      {userExists && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ color: '#f87171', marginBottom: '10px' }}>
            User already exists
          </p>

          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            
            {/* Login with Password */}
            <button
              onClick={() => navigate('/login-password')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#1f2937',
                color: '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#1f2937';
              }}
            >
              Login with Password
            </button>

            {/* Reset Password */}
            <button
              onClick={async () => {
                  try {
                    setLoading(true)
                    await API.post('/api/auth/reset-password-otp', { email })
                    localStorage.setItem('pf_auth_email', email)
                    localStorage.setItem('pf_auth_flow', 'reset')
                    navigate('/verify-otp')
                  } catch (e) {
                    setMessage('Failed to send reset OTP')
                  } finally {
                    setLoading(false)
                  }
                }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                color: '#111827',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              Reset Password
            </button>

          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      <p style={{ marginTop: '12px', textAlign: 'center' }}>
        Already a user?{' '}
        <span
          onClick={() => navigate('/login-password')}
          style={{
            color: '#8b5cf6',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Login
        </span>
      </p>

    </div>
  )
}
