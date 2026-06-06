import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/squad', label: 'Squad', icon: SquadIcon },
  { to: '/matches', label: 'Matches', icon: MatchIcon },
  { to: '/about', label: 'About', icon: AboutIcon },
  { to: '/table', label: 'Table', icon: TableIcon },
]

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15V15h-6v6.75H3.75A.75.75 0 013 21V9.75z" />
    </svg>
  )
}
function SquadIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="9" cy="7" r="3" /><circle cx="15" cy="7" r="3" />
      <path strokeLinecap="round" d="M3 19c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6" />
    </svg>
  )
}
function MatchIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    </svg>
  )
}
function AboutIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8h.01M11 12h1v4h1" />
    </svg>
  )
}
function TableIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  )
}

export default function BottomNav() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-[#0f0f0f] border-t border-[#2a2a2a] z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className="flex-1 flex flex-col items-center py-2 gap-0.5"
              style={{ color: active ? '#c0161c' : '#666' }}>
              <Icon active={active} />
              <span className="text-[10px] font-ui font-medium tracking-wide">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
