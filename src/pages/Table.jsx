import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Rounds 6-9 fixture schedule (hardcoded — Dragons fixtures are locked/auto-populated)
const SCHEDULE = [
  { round: 6, date: '2026-06-13', fixtures: [
    { home: 'OS Gunners',        away: 'OM Pumas' },
    { home: 'OM Lions',          away: 'OM Football Ferns' },
    { home: 'OM Pink Tigers',    away: 'OM Dragons',        dragons: true },
    { home: 'OM Jaguars',        away: 'OM Red Devils' },
  ]},
  { round: 7, date: '2026-06-20', fixtures: [
    { home: 'OM Football Ferns', away: 'OS Gunners' },
    { home: 'OM Lions',          away: 'OM Dragons',        dragons: true },
    { home: 'OM Pink Tigers',    away: 'OM Jaguars' },
    { home: 'OM Red Devils',     away: 'OM Pumas' },
  ]},
  { round: 8, date: '2026-06-27', fixtures: [
    { home: 'OM Red Devils',     away: 'OS Gunners' },
    { home: 'OM Pink Tigers',    away: 'OM Pumas' },
    { home: 'OM Lions',          away: 'OM Jaguars' },
    { home: 'OM Football Ferns', away: 'OM Dragons',        dragons: true },
  ]},
  { round: 9, date: '2026-07-04', fixtures: [
    { home: 'OM Pink Tigers',    away: 'OM Lions' },
    { home: 'OM Football Ferns', away: 'OM Pumas' },
    { home: 'OS Gunners',        away: 'OM Jaguars' },
    { home: 'OM Dragons',        away: 'OM Red Devils',     dragons: true },
  ]},
]

function fkey(round, home, away) { return `${round}|${home}|${away}` }
function pts(t) { return (t.won * 3) + t.drawn }
function short(name) { return name.replace(/^OM /, '').replace(/^MU /, '') }

// Compute live standings from base (rounds 1-5) + fixture_results (rounds 6+) + Dragons matches (rounds 6+)
function computeStandings(base, fixtureResults, dragonsByRound) {
  const map = {}
  for (const row of base) {
    map[row.team] = { team: row.team, won: row.won, drawn: row.drawn, lost: row.lost, played: row.played }
  }

  // Apply saved fixture_results (non-Dragons rounds 6+)
  for (const fr of fixtureResults) {
    if (fr.home_score == null || fr.away_score == null) continue
    const h = fr.home_team, a = fr.away_team
    const hs = fr.home_score, as_ = fr.away_score
    if (!map[h]) map[h] = { team: h, won: 0, drawn: 0, lost: 0, played: 0 }
    if (!map[a]) map[a] = { team: a, won: 0, drawn: 0, lost: 0, played: 0 }
    map[h].played++; map[a].played++
    if (hs > as_)      { map[h].won++;   map[a].lost++ }
    else if (hs < as_) { map[h].lost++;  map[a].won++ }
    else               { map[h].drawn++; map[a].drawn++ }
  }

  // Apply Dragons rounds 6+ from matches table
  for (const m of Object.values(dragonsByRound)) {
    if (!m || !['W', 'L', 'D'].includes(m.result)) continue
    const d = map['OM Dragons']
    if (!d) continue
    d.played++
    if (m.result === 'W') d.won++
    else if (m.result === 'D') d.drawn++
    else d.lost++
  }

  return Object.values(map).sort((a, b) => pts(b) - pts(a) || b.won - a.won)
}

export default function Table() {
  const [base, setBase]                   = useState([])
  const [fixtureResults, setFixtureResults] = useState([])
  const [dragonsByRound, setDragonsByRound] = useState({})
  const [drafts, setDrafts]               = useState({})   // key → { home: '', away: '' }
  const [editSet, setEditSet]             = useState(new Set())
  const [savingSet, setSavingSet]         = useState(new Set())

  const today = new Date().toISOString().split('T')[0]

  async function load() {
    const [{ data: standingsRows }, { data: frRows }, { data: matchRows }] = await Promise.all([
      supabase.from('standings').select('*'),
      supabase.from('fixture_results').select('*'),
      supabase.from('matches').select('*').gte('round', 6),
    ])
    if (standingsRows) setBase(standingsRows)
    if (frRows) setFixtureResults(frRows)
    if (matchRows) {
      const byRound = {}
      matchRows.forEach(m => { byRound[m.round] = m })
      setDragonsByRound(byRound)
    }
  }

  useEffect(() => { load() }, [])

  const liveStandings = computeStandings(base, fixtureResults, dragonsByRound)

  // Map of saved results by key
  const savedMap = {}
  fixtureResults.forEach(fr => { savedMap[fkey(fr.round, fr.home_team, fr.away_team)] = fr })

  function getDraft(key) { return drafts[key] || { home: '', away: '' } }

  function setDraftField(key, field, val) {
    setDrafts(prev => ({ ...prev, [key]: { ...(prev[key] || { home: '', away: '' }), [field]: val } }))
  }

  async function saveFixture(round, home, away, roundDate) {
    const key = fkey(round, home, away)
    const d = getDraft(key)
    const hs = parseInt(d.home), as_ = parseInt(d.away)
    if (isNaN(hs) || isNaN(as_)) return

    setSavingSet(prev => new Set(prev).add(key))
    await supabase.from('fixture_results').upsert(
      { round, home_team: home, away_team: away, home_score: hs, away_score: as_, date: roundDate, locked: false },
      { onConflict: 'round,home_team,away_team' }
    )
    await load()
    setSavingSet(prev => { const s = new Set(prev); s.delete(key); return s })
    setEditSet(prev => { const s = new Set(prev); s.delete(key); return s })
  }

  function startEdit(key, saved) {
    setDrafts(prev => ({ ...prev, [key]: { home: String(saved.home_score), away: String(saved.away_score) } }))
    setEditSet(prev => new Set(prev).add(key))
  }

  function cancelEdit(key) {
    setEditSet(prev => { const s = new Set(prev); s.delete(key); return s })
  }

  // Get Dragons score for a locked fixture (from matches table)
  function getDragonsScore(round, homeName) {
    const m = dragonsByRound[round]
    if (!m || !['W', 'L', 'D', 'A'].includes(m.result)) return null
    const dragonsAreHome = homeName === 'OM Dragons'
    return {
      home:   dragonsAreHome ? m.our_score   : m.their_score,
      away:   dragonsAreHome ? m.their_score : m.our_score,
      result: m.result,
    }
  }

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">TABLE</div>
        <div className="text-sm text-white/70 font-ui">Grade 8 · Auckland · 2026</div>
      </div>

      <div className="px-4 py-4 space-y-6">

        {/* ── LIVE STANDINGS ── */}
        {liveStandings.length === 0 ? (
          <div className="text-center text-[#666] py-12 font-ui">Loading table...</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="grid bg-[#1a1a1a] px-3 py-2 text-[10px] text-[#666] uppercase tracking-wider font-ui"
              style={{ gridTemplateColumns: '1.5rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 3rem' }}>
              <span>#</span><span>Team</span>
              <span className="text-center">P</span>
              <span className="text-center">W</span>
              <span className="text-center">D</span>
              <span className="text-center">L</span>
              <span className="text-center">Pts</span>
            </div>
            {liveStandings.map((team, i) => {
              const isDragons = team.team.toLowerCase().includes('dragons')
              return (
                <div key={team.team}
                  className={`grid px-3 py-3 border-b border-[#1a1a1a] last:border-0 text-sm font-ui ${isDragons ? 'bg-[#c0161c]/10' : ''}`}
                  style={{ gridTemplateColumns: '1.5rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 3rem' }}>
                  <span className="text-[#666] text-xs self-center">{i + 1}</span>
                  <span className={`font-medium self-center truncate text-xs ${isDragons ? 'text-[#e8b84b]' : 'text-white'}`}>{team.team}</span>
                  <span className="text-center text-[#aaa] self-center">{team.played}</span>
                  <span className="text-center text-green-400 self-center">{team.won}</span>
                  <span className="text-center text-[#e8b84b] self-center">{team.drawn}</span>
                  <span className="text-center text-[#c0161c] self-center">{team.lost}</span>
                  <span className={`text-center font-heading text-lg self-center ${isDragons ? 'text-[#e8b84b]' : 'text-white'}`}>{pts(team)}</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="text-[10px] text-[#444] font-ui text-right -mt-4">
          W=3pts · D=1pt · Live from all results
        </div>

        {/* ── ROUND RESULTS ── */}
        <div>
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">ROUND RESULTS</div>
          <div className="space-y-4">
            {SCHEDULE.map(({ round, date, fixtures }) => {
              const isPast = date <= today
              const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
              return (
                <div key={round} className="card overflow-hidden">

                  {/* Round header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]">
                    <div className="font-heading text-xl text-white">Round {round}</div>
                    <div className="text-xs text-[#666] font-ui">{dateLabel}</div>
                  </div>

                  <div className="divide-y divide-[#1a1a1a]">
                    {fixtures.map(({ home, away, dragons }) => {
                      const key   = fkey(round, home, away)
                      const saved = savedMap[key]
                      const isEd  = editSet.has(key)
                      const isSav = savingSet.has(key)
                      const draft = getDraft(key)
                      const canSave = !isNaN(parseInt(draft.home)) && !isNaN(parseInt(draft.away))
                      const future = date > today

                      // ── DRAGONS fixture ──
                      if (dragons) {
                        const scores = getDragonsScore(round, home)
                        return (
                          <div key={key} className="px-4 py-3 bg-[#c0161c]/5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-ui text-white/90 flex-1 truncate">{short(home)}</span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {scores ? (
                                  <>
                                    <span className="font-heading text-xl text-[#e8b84b]">{scores.home}</span>
                                    <span className="text-[#444] font-heading">:</span>
                                    <span className="font-heading text-xl text-[#e8b84b]">{scores.away}</span>
                                  </>
                                ) : (
                                  <span className="text-xs text-[#555] font-ui px-2">{isPast ? '— —' : 'TBD'}</span>
                                )}
                              </div>
                              <span className="text-xs font-ui text-white/90 flex-1 text-right truncate">{short(away)}</span>
                              <span className="text-sm flex-shrink-0 ml-1">🐉</span>
                            </div>
                          </div>
                        )
                      }

                      // ── SAVED (and not editing) ──
                      if (saved && !isEd) {
                        return (
                          <div key={key} className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-ui text-white flex-1 truncate">{short(home)}</span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="font-heading text-xl text-white">{saved.home_score}</span>
                                <span className="text-[#444] font-heading">:</span>
                                <span className="font-heading text-xl text-white">{saved.away_score}</span>
                                <span className="text-green-400 ml-0.5">✓</span>
                              </div>
                              <span className="text-xs font-ui text-white flex-1 text-right truncate">{short(away)}</span>
                              <button onClick={() => startEdit(key, saved)}
                                className="text-[10px] text-[#666] font-ui border border-[#333] rounded px-2 py-1 flex-shrink-0 ml-1">
                                Edit
                              </button>
                            </div>
                          </div>
                        )
                      }

                      // ── INPUT / EDITING ──
                      return (
                        <div key={key} className={`px-4 py-3 transition-opacity ${future && !isEd ? 'opacity-40' : ''}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-ui text-white flex-1 truncate leading-tight">{short(home)}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type="number" min="0" max="20"
                                value={draft.home}
                                onChange={e => setDraftField(key, 'home', e.target.value)}
                                placeholder="–"
                                className="w-11 h-11 text-center font-heading text-xl bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#c0161c] appearance-none"
                              />
                              <span className="text-[#444] font-heading text-xl">:</span>
                              <input
                                type="number" min="0" max="20"
                                value={draft.away}
                                onChange={e => setDraftField(key, 'away', e.target.value)}
                                placeholder="–"
                                className="w-11 h-11 text-center font-heading text-xl bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#c0161c] appearance-none"
                              />
                            </div>
                            <span className="text-xs font-ui text-white flex-1 text-right truncate leading-tight">{short(away)}</span>
                            <div className="flex gap-1 flex-shrink-0 ml-1">
                              {isEd && (
                                <button onClick={() => cancelEdit(key)}
                                  className="text-[10px] font-ui border border-[#333] rounded px-2 py-1 text-[#666]">
                                  ✕
                                </button>
                              )}
                              <button
                                onClick={() => saveFixture(round, home, away, date)}
                                disabled={isSav || !canSave}
                                className="text-[10px] font-heading px-3 py-2 rounded-lg bg-[#c0161c] text-white disabled:opacity-30"
                              >
                                {isSav ? '…' : 'SAVE'}
                              </button>
                            </div>
                          </div>
                          {future && !isEd && (
                            <div className="text-[10px] text-[#444] font-ui mt-1">Not played yet</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
