import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TeamValues from '../components/TeamValues'

export default function Home() {
  const [stats, setStats] = useState(null)
  const [latestMatch, setLatestMatch] = useState(null)
  const [nextMatch, setNextMatch] = useState(null)
  const [topScorers, setTopScorers] = useState([])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0]

    const [{ data: matches }, { data: players }, { data: standings }] = await Promise.all([
      supabase.from('matches').select('*').order('date', { ascending: true }),
      supabase.from('players').select('first_name, last_name, goals').eq('active', true).order('goals', { ascending: false }).limit(3),
      supabase.from('standings').select('*'),
    ])

    if (matches && standings) {
      // W/D/L from standings row for Dragons
      const pts = t => (t.won * 3) + t.drawn
      const sorted = [...standings].sort((a, b) => pts(b) - pts(a) || b.won - a.won)
      const idx = sorted.findIndex(t => t.team.toLowerCase().includes('dragons'))
      const dragonsRow = idx !== -1 ? sorted[idx] : null

      // GF/GA and played count from matches (W/L/D only)
      const played = matches.filter(m => ['W', 'L', 'D'].includes(m.result) && m.our_score != null)
      const gf = played.reduce((s, m) => s + (m.our_score || 0), 0)
      const ga = played.reduce((s, m) => s + (m.their_score || 0), 0)
      const wins = dragonsRow?.won ?? 0
      const playedCount = played.length
      const winRate = playedCount > 0 ? Math.round((wins / playedCount) * 100) : 0

      setStats({
        wins,
        draws:    dragonsRow?.drawn ?? 0,
        losses:   dragonsRow?.lost  ?? 0,
        pos:      idx !== -1 ? idx + 1 : null,
        total:    sorted.length,
        gf,
        ga,
        played:   playedCount,
        winRate,
      })

      // Latest result
      const results = matches.filter(m => m.result && !['BYE', 'X'].includes(m.result) && m.date <= today)
      if (results.length) setLatestMatch(results[results.length - 1])

      // Next fixture: earliest upcoming (no result) from today onward
      const upcoming = matches.filter(m => !m.result && m.date >= today)
      if (upcoming.length) setNextMatch(upcoming[0])
    }

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

        {/* Combined stats box */}
        {stats && (
          <div className="card p-4">
            <div className="font-heading text-xl text-[#e8b84b] mb-3">SEASON 2026</div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              <StatBox label="Win Rate" value={`${stats.winRate}%`} color="text-green-400" />
              <StatBox label="Wins"     value={stats.wins}          color="text-green-400" />
              <StatBox label="Draws"    value={stats.draws}         color="text-[#e8b84b]" />
              <StatBox label="Losses"   value={stats.losses}        color="text-[#c0161c]" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <StatBox label="Played" value={stats.played} color="text-white" />
              <StatBox
                label="Position"
                value={stats.pos ? `${stats.pos}${ordinal(stats.pos)}` : '–'}
                color="text-white"
                sub={stats.pos ? `of ${stats.total}` : ''}
              />
              <StatBox label="GF" value={stats.gf} color="text-white" />
              <StatBox label="GA" value={stats.ga} color="text-[#888]" />
            </div>
          </div>
        )}

        {/* Team Values */}
        <TeamValues />

        {/* Latest result */}
        {latestMatch && (
          <div className="card p-4">
            <div className="font-heading text-lg text-[#666] mb-2">LATEST RESULT</div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-heading text-2xl text-white truncate">vs {latestMatch.opponent}</div>
                <div className="text-sm text-[#888] font-ui">
                  Rd {latestMatch.round} · {new Date(latestMatch.date + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} · {latestMatch.home_away === 'H' ? 'Home' : 'Away'}
                </div>
                {latestMatch.player_of_day && (
                  <div className="text-sm text-[#e8b84b] mt-1">⭐ {latestMatch.player_of_day}</div>
                )}
              </div>
              <ResultBadge match={latestMatch} />
            </div>
          </div>
        )}

        {/* Next fixture */}
        {nextMatch && (
          <div className="card p-4" style={{ borderColor: '#c0161c55', borderWidth: 1 }}>
            <div className="font-heading text-lg text-[#c0161c] mb-2">NEXT FIXTURE</div>
            <div className="font-heading text-2xl text-white">vs {nextMatch.opponent || 'TBC'}</div>
            <div className="text-sm text-[#888] font-ui mt-1">
              Rd {nextMatch.round} · {nextMatch.home_away === 'H' ? 'Home' : 'Away'}
            </div>
            {nextMatch.date && (
              <div className="text-sm text-white font-ui mt-1">
                {new Date(nextMatch.date + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                {nextMatch.kickoff_time ? ` · ${nextMatch.kickoff_time}` : ''}
              </div>
            )}
            {nextMatch.venue && (
              <div className="text-xs text-[#e8b84b] mt-1 font-ui">📍 {nextMatch.venue}</div>
            )}
            <div className="text-xs text-[#555] mt-2 font-ui">Arrive 30 mins before kickoff</div>
          </div>
        )}

        {/* Top scorers */}
        {topScorers.length > 0 && (
          <div className="card p-4">
            <div className="font-heading text-lg text-[#e8b84b] mb-3">TOP SCORERS</div>
            {topScorers.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#555] w-4">{i + 1}</span>
                  <span className="font-ui text-white">{p.first_name} {p.last_name}</span>
                </div>
                <span className="font-heading text-xl text-[#e8b84b]">{p.goals}</span>
              </div>
            ))}
          </div>
        )}

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

function ordinal(n) {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

function StatBox({ label, value, color, sub }) {
  return (
    <div className="bg-[#0f0f0f] rounded-lg p-3 text-center">
      <div className={`font-heading text-2xl leading-none ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-[#555] mt-0.5">{sub}</div>}
      <div className="text-[9px] text-[#666] uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}

function ResultBadge({ match }) {
  const colors = { W: '#22c55e', L: '#c0161c', D: '#e8b84b', A: '#e8b84b' }
  const labels = {
    W: `W ${match.our_score}–${match.their_score}`,
    L: `L ${match.our_score}–${match.their_score}`,
    D: `D ${match.our_score}–${match.their_score}`,
    A: 'ABD',
  }
  const c = colors[match.result] || '#666'
  return (
    <div className="font-heading text-xl px-3 py-1 rounded-lg flex-shrink-0"
      style={{ color: c, backgroundColor: c + '22', border: `1px solid ${c}` }}>
      {labels[match.result] || match.result}
    </div>
  )
}
