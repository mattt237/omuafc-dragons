import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function pts(team) {
  return (team.won * 3) + team.drawn
}

export default function Table() {
  const [standings, setStandings] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: rows }, { data: setting }] = await Promise.all([
        supabase.from('standings').select('*'),
        supabase.from('settings').select('value').eq('key', 'standings_updated').single(),
      ])
      if (rows) {
        // Sort by computed points, then won as tiebreaker
        setStandings([...rows].sort((a, b) => pts(b) - pts(a) || b.won - a.won))
      }
      if (setting?.value) setLastUpdated(setting.value)
    }
    load()
  }, [])

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">TABLE</div>
        <div className="text-sm text-white/70 font-ui">Grade 8 · Auckland · 2026</div>
      </div>

      <div className="px-4 py-4">
        {standings.length === 0 ? (
          <div className="text-center text-[#666] py-12 font-ui">Loading table...</div>
        ) : (
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="grid bg-[#1a1a1a] px-3 py-2 text-[10px] text-[#666] uppercase tracking-wider font-ui"
              style={{ gridTemplateColumns: '1.5rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 3rem' }}>
              <span>#</span>
              <span>Team</span>
              <span className="text-center">P</span>
              <span className="text-center">W</span>
              <span className="text-center">D</span>
              <span className="text-center">L</span>
              <span className="text-center">Pts</span>
            </div>
            {standings.map((team, i) => {
              const isDragons = team.team.toLowerCase().includes('dragons')
              const points = pts(team)
              return (
                <div key={team.id}
                  className={`grid px-3 py-3 border-b border-[#1a1a1a] last:border-0 text-sm font-ui ${isDragons ? 'bg-[#c0161c]/10' : ''}`}
                  style={{ gridTemplateColumns: '1.5rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 3rem' }}>
                  <span className="text-[#666] text-xs self-center">{i + 1}</span>
                  <span className={`font-medium self-center ${isDragons ? 'text-[#e8b84b]' : 'text-white'}`}>{team.team}</span>
                  <span className="text-center text-[#aaa] self-center">{team.played}</span>
                  <span className="text-center text-green-400 self-center">{team.won}</span>
                  <span className="text-center text-[#e8b84b] self-center">{team.drawn}</span>
                  <span className="text-center text-[#c0161c] self-center">{team.lost}</span>
                  <span className={`text-center font-heading text-lg self-center ${isDragons ? 'text-[#e8b84b]' : 'text-white'}`}>{points}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-[#666] font-ui">W=3pts · D=1pt · L=0pts</div>
          {lastUpdated && (
            <div className="text-xs text-[#666] font-ui">
              Updated {new Date(lastUpdated).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
