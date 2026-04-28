import React, { useRef, useState } from 'react'
import { setPassword } from '../services/api'

export default function SetPassword(){
  const [password, setPass] = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const passRef = useRef(null)
  const confirmRef = useRef(null)
  const email = localStorage.getItem('pf_auth_email') || ''
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSet = async () => {
    setError('')
    if (!password || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true); setMsg('')
    try{
      await setPassword(email, password)
      setMsg('Password set. You can login now.')
      window.location.href = '/auth/password-login'
    }catch(err){
      setMsg(err.message || 'Failed')
    }finally{setLoading(false)}
  }

  const handlePasswordKey = (e) => {
    if (e.key === 'Enter') {
      confirmRef.current && confirmRef.current.focus()
    }
  }

  const handleConfirmKey = (e) => {
    if (e.key === 'Enter') {
      handleSet()
    }
  }

  const togglePassword = () => setShowPassword(v => !v)
  const toggleConfirm = () => setShowConfirm(v => !v)

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Set Password</h2>
      <p className="text-sm mb-3 text-slate-500">Account: <strong>{email}</strong></p>
      <div style={{ position: 'relative' }} className="mb-3">
        <input
          ref={passRef}
          type={showPassword ? 'text' : 'password'}
          className="w-full border p-2 rounded"
          placeholder="New password"
          value={password}
          onChange={e=>setPass(e.target.value)}
          onKeyDown={handlePasswordKey}
          autoFocus
        />
        <span onClick={togglePassword} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
          {showPassword ? '🙈' : '👁'}
        </span>
      </div>

      <div style={{ position: 'relative' }} className="mb-3">
        <input
          ref={confirmRef}
          type={showConfirm ? 'text' : 'password'}
          className="w-full border p-2 rounded"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={e=>setConfirm(e.target.value)}
          onKeyDown={handleConfirmKey}
        />
        <span onClick={toggleConfirm} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
          {showConfirm ? '🙈' : '👁'}
        </span>
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={handleSet} disabled={loading}>{loading? 'Saving...' : 'Set Password'}</button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </div>
  )
}
