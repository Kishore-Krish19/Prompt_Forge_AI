import React, { useRef, useState } from 'react'
import { login } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function PasswordLogin(){
  const [email, setEmail] = useState('')
  const [password, setPasswordVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    if (!email || !email.trim()) {
      setError('Email is required')
      emailRef.current && emailRef.current.focus()
      return
    }
    if (!password || !password.trim()) {
      setError('Password is required')
      passwordRef.current && passwordRef.current.focus()
      return
    }

    setLoading(true); setMsg('')
    try{
      const data = await login(email.trim(), password)
      const token = data.token || data.access_token || data.jwt || data.authToken || data.auth_token || data.accessToken;
      if (!token) throw new Error('No token returned from server')
      localStorage.setItem('token', token)
      localStorage.setItem('pf_auth_email', email.trim())
      const isAdmin = data.is_admin || data.isAdmin || false
      localStorage.setItem('is_admin', isAdmin ? 'true' : 'false')
      console.log('TOKEN:', localStorage.getItem('token'), 'is_admin:', localStorage.getItem('is_admin'))
      setMsg('Logged in')
      if (isAdmin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    }catch(err){
      let errorMessage = 'An error occurred. Please try again.'
      
      // Check if error response exists
      if (err.response) {
        const status = err.response.status
        const detailMessage = err.response.data?.detail
        
        // Prioritize backend detail message if available
        if (detailMessage) {
          errorMessage = detailMessage
        } else if (status === 404) {
          errorMessage = 'User does not exist.'
        } else if (status === 401) {
          errorMessage = 'Invalid email or password.'
        } else if (status === 500) {
          errorMessage = 'Server error, please try again later.'
        }
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
    }finally{setLoading(false)}
  }

  const handleEmailKey = (e) => {
    if (e.key === 'Enter') {
      passwordRef.current && passwordRef.current.focus()
    }
  }

  const handlePasswordKey = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  const togglePassword = () => setShowPassword(v => !v)

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Login with password</h2>
      <input ref={emailRef} className="w-full border p-2 rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={handleEmailKey} />

      <div style={{ position: 'relative' }} className="mb-3">
        <input
          ref={passwordRef}
          type={showPassword ? 'text' : 'password'}
          className="w-full border p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={e=>setPasswordVal(e.target.value)}
          onKeyDown={handlePasswordKey}
        />
        <span onClick={togglePassword} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
          {showPassword ? '🙈' : '👁'}
        </span>
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={handleLogin} disabled={loading}>{loading? 'Logging...' : 'Login'}</button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
      <p style={{ marginTop: '12px', textAlign: 'center' }}>
        New user?{' '}
        <span
          onClick={() => navigate('/signup')}
          style={{
            color: '#8b5cf6',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Sign in
        </span>
      </p>
    </div>
  )
}
