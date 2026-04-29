import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyOtp, sendOtp } from '../services/api'
import API from '../services/api'

export default function VerifyOtp(){
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const email = localStorage.getItem('pf_auth_email') || ''

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const joinOtp = () => otp.join('')

  const handleVerify = async (value) => {
    const code = value || joinOtp()
    setError('')
    if (!code || code.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true); setMsg('')
    try{
      await verifyOtp(email, code)
      setMsg('Verified — set a password now.')
      navigate('/auth/set-password')
    }catch(err){
      setError(err.message || 'Verification failed')
    }finally{setLoading(false)}
  }

  // handle digit change and full-paste detection
  const handleChange = (value, index) => {
    // normalize incoming value
    const sanitized = value.replace(/\D/g, '')

    // If user pasted multiple digits into a single box
    if (sanitized.length > 1) {
      const digits = sanitized.slice(0, 6).split('')
      setOtp(digits)
      digits.forEach((digit, i) => {
        if (inputsRef.current[i]) inputsRef.current[i].value = digit
      })
      handleVerify(digits.join(''))
      return
    }

    if (!/^[0-9]?$/.test(sanitized)) return
    const next = [...otp]
    next[index] = sanitized
    setOtp(next)
    if (sanitized && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
    if (next.every(d => d !== '')) {
      handleVerify(next.join(''))
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    }
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  // paste support for full OTP
  const handlePaste = (e) => {
    const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim()
    const sanitized = pastedData.replace(/\D/g, '')
    if (!/^[0-9]{6}$/.test(sanitized)) return
    const digits = sanitized.split('')
    setOtp(digits)
    digits.forEach((digit, i) => {
      if (inputsRef.current[i]) inputsRef.current[i].value = digit
    })
    handleVerify(sanitized)
  }

  // resend and timer handling
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleResend = async () => {
    try {
      const flow = localStorage.getItem('pf_auth_flow') || 'signup'
      if (flow === 'reset') {
        await API.post('/api/auth/reset-password-otp', { email })
      } else {
        await API.post('/api/auth/send-otp', { email })
      }

      setTimer(30)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      inputsRef.current[0]?.focus()
    } catch (err) {
      console.error('Resend failed', err)
      setError('Resend failed. Try again later.')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
      <p className="text-sm mb-3 text-slate-500">Sending code to <strong>{email}</strong></p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            ref={el => inputsRef.current[idx] = el}
            onChange={e => handleChange(e.target.value, idx)}
            onKeyDown={e => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            style={{ width: 48, height: 56, textAlign: 'center', fontSize: 20, borderRadius: 8, border: '1px solid #ccc' }}
          />
        ))}
      </div>

      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={() => handleVerify()} disabled={loading}>{loading? 'Verifying...' : 'Verify'}</button>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button
          onClick={handleResend}
          disabled={!canResend}
          onMouseEnter={(e) => { if (canResend) e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            display: 'inline-block',

            background: canResend
              ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
              : '#0f1724',

            color: canResend ? '#ffffff' : '#6b7280',

            cursor: canResend ? 'pointer' : 'not-allowed',

            opacity: canResend ? 1 : 0.7,

            transition: 'all 0.25s cubic-bezier(.2,.9,.2,1)',
            transform: 'scale(1)'
          }}
        >
          {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </div>
  )
}
