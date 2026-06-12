import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard'
import TeamValues from '../components/TeamValues'

const STAFF = [
  { name: 'Matt Thompson', role: 'Co-Coach', phone: '021 292 2022', initials: 'MT' },
  { name: 'Ben Thompson',  role: 'Co-Coach', phone: '0274 567 551', initials: 'BT' },
  { name: 'Sharnie Warren', role: 'Manager', phone: '021 242 3375', initials: 'SW' },
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
              <div className="flex-1 min-w-0">
                <div className="font-ui text-white font-medium text-sm">{s.name}</div>
                <div className="text-xs text-[#666]">{s.role}</div>
              </div>
              <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="text-[#e8b84b] text-sm font-ui font-medium flex-shrink-0">
                {s.phone}
              </a>
            </div>
          ))}
        </div>

        {/* Players */}
        <div className="font-heading text-2xl text-[#e8b84b]">PLAYERS</div>
        {players.map(p => <PlayerCard key={p.id} player={p} />)}
        {players.length === 0 && (
          <div className="text-center text-[#666] py-8 font-ui">Loading squad...</div>
        )}

        {/* About Our Club */}
        <div className="card p-4 mt-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">ABOUT OUR CLUB</div>
          <div className="text-sm text-[#aaa] font-ui leading-relaxed space-y-2">
            <p>OMUAFC Dragons are a Grade 8 youth football team based in Auckland, New Zealand, competing in the 2026 season.</p>
            <p>We play our home games at Mangere Mountain and train every Wednesday evening at OMUAFC Ground, Mangere.</p>
          </div>
        </div>

        {/* Team Values */}
        <TeamValues />

        {/* Training & Match Day */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">TRAINING & MATCH DAY</div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 mt-1.5 h-5 bg-[#c0161c] rounded-full flex-shrink-0" />
              <div>
                <div className="font-heading text-lg text-white">Wednesday Training</div>
                <div className="text-[#e8b84b] text-sm font-ui">Wednesday · 5:00pm</div>
                <div className="text-[#aaa] text-sm font-ui mt-0.5">OMUAFC Ground, Mangere. Arrive in full kit with boots and water.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 mt-1.5 h-5 bg-[#c0161c] rounded-full flex-shrink-0" />
              <div>
                <div className="font-heading text-lg text-white">Match Day</div>
                <div className="text-[#e8b84b] text-sm font-ui">Saturday mornings</div>
                <div className="text-[#aaa] text-sm font-ui mt-0.5">Arrive 30 minutes before kickoff. Check the Matches tab for venue and time.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors */}
        <div className="card p-4">
          <div className="font-heading text-lg text-[#666] mb-4">OUR SPONSORS</div>
          <div className="flex items-center justify-around gap-4">
            <img src="/logos/manukora-logo.png" alt="Manukora" className="h-10 w-auto object-contain opacity-90" />
            <img src="/logos/pulse-energy-logo.png" alt="Pulse Energy" className="h-10 w-auto object-contain opacity-90 brightness-0 invert" />
          </div>
        </div>

      </div>
    </div>
  )
}
