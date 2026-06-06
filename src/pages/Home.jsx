import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Home() {
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0, goals: 0 })
  const [latestMatch, setLatestMatch] = useState(null)
  const [nextMatch, setNextMatch] = useState(null)
  const [topScorers, setTopScorers] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0]

    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true })

    if (matches) {
      const played = matches.filter(m => m.result && m.result !== 'BYE' && m.result !== 'X')
      const wins = played.filter(m => m.result === 'W').length
      const losses = played.filter(m => m.result === 'L').length
      const draws = played.filter(m => m.result === 'D').length
      const goals = played.reduce((sum, m) => sum + (m.our_score || 0), 0)
      setStats({ wins, losses, draws, goals })

      const pastPlayed = played.filter(m => m.date <= today)
      if (pastPlayed.length) setLatestMatch(pastPlayed[pastPlayed.length - 1])

      const upcoming = matches.filter(m => m.date > today || !m.result)
      if (upcoming.length) setNextMatch(upcoming[0])
    }

    const { data: players } = await supabase
      .from('players')
      .select('first_name, last_name, goals')
      .eq('active', true)
      .order('goals', { ascending: false })
      .limit(3)

    if (players) setTopScorers(players)
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="bg-[#c0161c] px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-heading text-4xl text-white leading-none">OMUAFC</div>
            <div className="font-heading text-6xl text-[#e8b84b] leading-none">DRAGONS</div>
            <div className="text-sm text-white/70 mt-1 font-ui">Grade 8 · Auckland · Season 2026</div>
          </div>
          <img src="/logos/dragons-logo.png" alt="Dragons" className="h-24 w-auto object-contain drop-shadow-lg" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Season record */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">SEASON 2026</div>
          <div className="grid grid-cols-4 gap-2">
            <StatBox label="Wins" value={stats.wins} color="text-green-400" />
            <StatBox label="Losses" value={stats.losses} color="text-[#c0161c]" />
            <StatBox label="Draws" value={stats.draws} color="text-[#e8b84b]" />
            <StatBox label="Goals" value={stats.goals} color="text-white" />
          </div>
        </div>

        {/* Team values */}
        <div className="card p-4">
          <div className="font-heading text-lg text-[#666] mb-3">OUR VALUES</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { word: 'Focus', emoji: '🎯' },
              { word: 'Fire',  emoji: '🔥' },
              { word: 'Fair',  emoji: '🤝' },
              { word: 'Fun',   emoji: '⚡' },
            ].map(({ word, emoji }) => (
              <div key={word} className="bg-[#0f0f0f] rounded-lg p-3 text-center">
                <div className="text-xl mb-1">{emoji}</div>
                <div className="font-heading text-lg text-[#c0161c] leading-none">{word}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest result */}
        {latestMatch && (
          <div className="card p-4">
            <div className="font-heading text-lg text-[#666] mb-2">LATEST RESULT</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading text-2xl text-white">vs {latestMatch.opponent}</div>
                <div className="text-sm text-[#888] font-ui">
                  Round {latestMatch.round} · {new Date(latestMatch.date + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}
                </div>
                {latestMatch.player_of_day && (
                  <div className="text-sm text-[#e8b84b] mt-1">⭐ POD: {latestMatch.player_of_day}</div>
                )}
              </div>
              <ResultBadge match={latestMatch} />
            </div>
          </div>
        )}

        {/* Next match */}
        {nextMatch && (
          <div className="card p-4 border-[#c0161c]/40">
            <div className="font-heading text-lg text-[#c0161c] mb-2">NEXT MATCH</div>
            <div className="font-heading text-2xl text-white">vs {nextMatch.opponent || 'TBC'}</div>
            <div className="text-sm text-[#888] font-ui mt-1">
              Round {nextMatch.round} · {nextMatch.date ? new Date(nextMatch.date + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Date TBC'} · {nextMatch.home_away === 'H' ? 'Home' : 'Away'}
            </div>
            <div className="text-xs text-[#666] mt-2 font-ui">Arrive 30 mins before kickoff</div>
          </div>
        )}

        {/* Top scorers */}
        {topScorers.length > 0 && (
          <div className="card p-4">
            <div className="font-heading text-lg text-[#e8b84b] mb-3">TOP SCORERS</div>
            {topScorers.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666] w-4">{i + 1}</span>
                  <span className="font-ui text-white">{p.first_name} {p.last_name}</span>
                </div>
                <span className="font-heading text-xl text-[#e8b84b]">{p.goals}</span>
              </div>
            ))}
          </div>
        )}

        {/* Staff card */}
        <div className="card p-4">
          <div className="font-heading text-lg text-[#666] mb-3">TEAM STAFF</div>
          <StaffRow name="Matt Thompson" role="Co-Coach" phone="021 292 2022" />
          <StaffRow name="Ben Thompson" role="Co-Coach" phone="0274 567 551" />
          <StaffRow name="Sharnie Warren" role="Manager" phone="021 242 3375" />
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

function StatBox({ label, value, color }) {
  return (
    <div className="bg-[#0f0f0f] rounded-lg p-3 text-center">
      <div className={`font-heading text-3xl ${color}`}>{value}</div>
      <div className="text-[10px] text-[#666] uppercase tracking-wider">{label}</div>
    </div>
  )
}

function ResultBadge({ match }) {
  const colors = { W: '#22c55e', L: '#c0161c', D: '#e8b84b', A: '#e8b84b' }
  const labels = { W: `W ${match.our_score}–${match.their_score}`, L: `L ${match.our_score}–${match.their_score}`, D: `D ${match.our_score}–${match.their_score}`, A: 'ABD' }
  const c = colors[match.result] || '#666'
  return (
    <div className="font-heading text-2xl px-3 py-1 rounded-lg" style={{ color: c, backgroundColor: c + '22', border: `1px solid ${c}` }}>
      {labels[match.result] || match.result}
    </div>
  )
}

function StaffRow({ name, role, phone }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1f1f1f] last:border-0">
      <div>
        <div className="font-ui text-white text-sm font-medium">{name}</div>
        <div className="text-xs text-[#666]">{role}</div>
      </div>
      <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-[#e8b84b] text-sm font-ui">{phone}</a>
    </div>
  )
}
