import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard'

const STAFF = [
  { name: 'Matt Thompson',  role: 'Co-Coach', initials: 'MT' },
  { name: 'Ben Thompson',   role: 'Co-Coach', initials: 'BT' },
  { name: 'Sharnie Warren', role: 'Manager',  initials: 'SW' },
]

export default function Squad() {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .eq('active', true)
      .order('goals', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data) })
  }, [])

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">SQUAD</div>
        <div className="text-sm text-white/70 font-ui">2026 Season · {players.length} players</div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Coaches & Management */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">COACHES & MANAGEMENT</div>
          {STAFF.map(s => (
            <div key={s.name} className="flex items-center gap-3 py-3 border-b border-[#1f1f1f] last:border-0">
              <div className="w-10 h-10 rounded-full bg-[#c0161c] flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-sm text-white">{s.initials}</span>
              </div>
              <div className="min-w-0">
                <div className="font-ui text-white font-medium text-sm">{s.name}</div>
                <div className="text-xs text-[#666]">{s.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Players */}
        <div className="font-heading text-2xl text-[#e8b84b]">PLAYERS</div>
        {players.map(p => <PlayerCard key={p.id} player={p} />)}
        {players.length === 0 && (
          <div className="text-center text-[#666] py-8 font-ui">Loading squad...</div>
        )}

      </div>
    </div>
  )
}
