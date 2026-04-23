import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_CODE = 'admin123'

export default function AdminCodeModal() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setOpen(true)
        setCode('')
        setError(false)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const submit = () => {
    if (code === ADMIN_CODE) {
      localStorage.setItem('tr_admin_unlocked', 'true')
      setOpen(false)
      navigate('/admin')
    } else {
      setError(true)
      setCode('')
      setTimeout(() => setError(false), 1200)
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
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Voer code in"
          className="bg-zinc-800 border border-zinc-600 text-white px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
          style={{
            borderRadius: 0,
            animation: error ? 'shake 0.3s ease' : undefined,
          }}
        />
        {error && <p className="text-red-400 text-xs -mt-2">Verkeerde code</p>}
        <button
          onClick={submit}
          className="bg-orange-500 hover:bg-orange-600 text-white font-anton uppercase tracking-wider py-3 text-sm transition-colors"
          style={{ borderRadius: 0 }}
        >
          Doorgaan
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          75% { transform: translateX(6px) }
        }
      `}</style>
    </div>
  )
}
