import React, { useRef, useState } from 'react'
import { sendOtp } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
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
      await sendOtp(email.trim())
      setMessage('OTP sent — check your email.')
      localStorage.setItem('pf_auth_email', email.trim())
      window.location.href = '/auth/verify'
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
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      <div className="mt-3 text-center">
        <a className="text-sm text-blue-600" href="/auth/password-login">Login with password</a>
      </div>
    </div>
  )
}
