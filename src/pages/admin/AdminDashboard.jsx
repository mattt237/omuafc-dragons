import { Link, useNavigate } from 'react-router-dom'

const sections = [
  { to: '/admin/matches', label: 'Matches', desc: 'Enter results, scorers, POD', icon: '⚽' },
  { to: '/admin/players', label: 'Players', desc: 'Manage squad roster', icon: '👥' },
  { to: '/admin/training', label: 'Training', desc: 'Weekly schedule', icon: '🏃' },
  { to: '/admin/table', label: 'Table', desc: 'League standings', icon: '📊' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  function logout() {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div>
          <div className="font-heading text-4xl text-white">ADMIN</div>
          <div className="text-sm text-white/70 font-ui">OMUAFC Dragons 2025</div>
        </div>
        <button onClick={logout} className="text-white/70 text-sm font-ui underline mb-1">Logout</button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {sections.map(s => (
          <Link key={s.to} to={s.to}
            className="card p-4 flex items-center gap-4 active:bg-[#1a1a1a] transition-colors">
            <div className="text-3xl">{s.icon}</div>
            <div>
              <div className="font-heading text-2xl text-white">{s.label}</div>
              <div className="text-sm text-[#888] font-ui">{s.desc}</div>
            </div>
            <div className="ml-auto text-[#666]">›</div>
          </Link>
        ))}

        <Link to="/" className="block text-center text-[#666] text-sm font-ui underline pt-4">
          View public site
        </Link>
      </div>
    </div>
  )
}
