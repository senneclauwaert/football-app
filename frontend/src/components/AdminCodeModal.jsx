import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function AdminCodeModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setOpen(true)
        setEmail('')
        setPassword('')
        setError(null)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const submit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)
      const res = await client.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const { access_token, user } = res.data
      localStorage.setItem('tr_token', access_token)
      localStorage.setItem('tr_user', JSON.stringify(user))
      localStorage.setItem('tr_admin_unlocked', 'true')
      client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      setOpen(false)
      navigate('/admin')
    } catch {
      setError('Verkeerde inloggegevens')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', animation: 'backdrop-in 0.15s ease' }}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 p-8 w-80 flex flex-col gap-4"
        style={{ animation: 'sheet-in 0.2s ease', borderRadius: 0 }}
      >
        <p className="font-anton text-white text-xl uppercase tracking-wider">Admin toegang</p>
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="E-mailadres"
          className="bg-zinc-800 border border-zinc-600 text-white px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
          style={{ borderRadius: 0 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Wachtwoord"
          className="bg-zinc-800 border border-zinc-600 text-white px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
          style={{ borderRadius: 0 }}
        />
        {error && <p className="text-red-400 text-xs -mt-2">{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-anton uppercase tracking-wider py-3 text-sm transition-colors disabled:opacity-60"
          style={{ borderRadius: 0 }}
        >
          {loading ? 'Bezig...' : 'Inloggen'}
        </button>
      </div>
    </div>
  )
}
