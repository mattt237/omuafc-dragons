import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (password === 'dragons2025') {
      sessionStorage.setItem('admin_auth', 'true')
      navigate('/admin')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="font-heading text-5xl text-[#c0161c] mb-1">DRAGONS</div>
      <div className="font-heading text-2xl text-[#e8b84b] mb-8">ADMIN PANEL</div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white font-ui text-lg focus:outline-none focus:border-[#c0161c]"
          autoFocus
        />
        {error && <div className="text-[#c0161c] text-sm font-ui">{error}</div>}
        <button type="submit"
          className="w-full bg-[#c0161c] text-white font-heading text-2xl py-3 rounded-lg">
          ENTER
        </button>
      </form>
    </div>
  )
}
