import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateText } from '../lib/anthropic'

const RESULT_COLOR = { W: '#22c55e', L: '#c0161c', D: '#e8b84b', A: '#e8b84b', BYE: '#444', X: '#444' }

function scoreBadge(match) {
  if (!match.result) return null
  if (match.result === 'BYE' || match.result === 'X') return { label: 'BYE', color: '#444' }
  if (match.result === 'A') return { label: 'ABD', color: '#e8b84b' }
  const c = RESULT_COLOR[match.result] || '#666'
  return { label: `${match.our_score}–${match.their_score}`, color: c }
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [report, setReport] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => { if (data) setMatches(data) })
  }, [])

  async function toggleExpand(match) {
    if (expanded === match.id) { setExpanded(null); return }
    setExpanded(match.id)
    setReport('')
    const hasResult = ['W', 'L', 'D', 'A'].includes(match.result)
    if (hasResult) {
      setReportLoading(true)
      const scorersText = match.scorers?.length
        ? 'Scorers: ' + match.scorers.map(s => `${s.player} (${s.goals})`).join(', ') + '.'
        : 'Individual scorers not recorded.'
      const prompt = `Write a short match report (3-4 sentences) for OMUAFC Dragons vs ${match.opponent} on ${match.date}. ${match.result === 'A' ? 'The match was abandoned.' : `Result: ${match.result === 'W' ? 'Win' : match.result === 'L' ? 'Loss' : 'Draw'} ${match.our_score}–${match.their_score}.`} ${scorersText} ${match.player_of_day ? `Player of the day: ${match.player_of_day}.` : ''}`
      const text = await generateText(prompt)
      setReport(text)
      setReportLoading(false)
    }
  }

  const upcoming = matches.filter(m => !m.result).sort((a, b) => a.date > b.date ? 1 : -1)
  const played   = matches.filter(m => m.result)

  // Find the very next upcoming fixture
  const today = new Date().toISOString().split('T')[0]
  const nextId = upcoming.find(m => m.date >= today)?.id

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">MATCHES</div>
        <div className="text-sm text-white/70 font-ui">Season 2026 · May – October</div>
      </div>

      <div className="px-4 py-4 space-y-6">

        {/* Upcoming fixtures */}
        {upcoming.length > 0 && (
          <section>
            <div className="font-heading text-2xl text-[#e8b84b] mb-3">UPCOMING</div>
            <div className="space-y-2">
              {upcoming.map(m => {
                const d = m.date ? new Date(m.date + 'T00:00:00') : null
                const isNext = m.id === nextId
                return (
                  <div key={m.id} className="card p-4"
                    style={isNext ? { borderColor: '#c0161c', borderWidth: 1 } : {}}>
                    <div className="flex items-start gap-3">
                      {d && (
                        <div className="text-center flex-shrink-0 w-10">
                          <div className="font-heading text-2xl text-white leading-none">{d.getDate()}</div>
                          <div className="text-[10px] text-[#666] uppercase">{d.toLocaleDateString('en-NZ', { month: 'short' })}</div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading text-lg text-white">vs {m.opponent}</span>
                          {isNext && (
                            <span className="text-[10px] font-ui font-bold px-2 py-0.5 rounded bg-[#c0161c] text-white tracking-wider">NEXT</span>
                          )}
                        </div>
                        <div className="text-xs text-[#888] font-ui mt-0.5">
                          Rd {m.round} · {m.home_away === 'H' ? 'Home' : 'Away'}
                          {m.kickoff_time ? ` · ⏰ ${m.kickoff_time}` : ''}
                        </div>
                        {m.venue && (
                          <div className="text-xs text-[#e8b84b] font-ui mt-0.5">📍 {m.venue}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Results timeline */}
        <section>
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">RESULTS</div>
          <div className="space-y-2">
            {played.map(m => {
              const badge = scoreBadge(m)
              const d = m.date ? new Date(m.date + 'T00:00:00') : null
              const isBye = m.result === 'BYE' || m.result === 'X'
              const isOpen = expanded === m.id
              const dotColor = RESULT_COLOR[m.result] || '#444'

              return (
                <div key={m.id}>
                  <div
                    className="card p-4 cursor-pointer active:opacity-80 transition-opacity"
                    onClick={() => !isBye && toggleExpand(m)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Date */}
                      {d ? (
                        <div className="text-center flex-shrink-0 w-10">
                          <div className="font-heading text-2xl leading-none" style={{ color: dotColor }}>{d.getDate()}</div>
                          <div className="text-[10px] text-[#666] uppercase">{d.toLocaleDateString('en-NZ', { month: 'short' })}</div>
                        </div>
                      ) : <div className="w-10" />}

                      {/* Match info */}
                      <div className="flex-1 min-w-0">
                        {isBye ? (
                          <div className="font-heading text-lg text-[#555]">BYE WEEK</div>
                        ) : (
                          <div className="font-heading text-lg text-white truncate">vs {m.opponent}</div>
                        )}
                        {!isBye && (
                          <div className="text-xs text-[#666] font-ui mt-0.5">
                            Rd {m.round} · {m.home_away === 'H' ? 'Home' : 'Away'}
                          </div>
                        )}
                        {!isBye && m.scorers?.length > 0 && (
                          <div className="text-xs text-[#888] font-ui mt-1">
                            ⚽ {m.scorers.map(s => `${s.player.split(' ')[0]}${s.goals > 1 ? ` (${s.goals})` : ''}`).join(', ')}
                          </div>
                        )}
                        {!isBye && m.player_of_day && (
                          <div className="text-xs text-[#e8b84b] font-ui mt-0.5">⭐ {m.player_of_day.split(' ')[0]}</div>
                        )}
                      </div>

                      {/* Score badge */}
                      {badge && !isBye && (
                        <div className="flex-shrink-0 font-heading text-xl"
                          style={{ color: badge.color }}>
                          {badge.label}
                        </div>
                      )}
                      {isBye && (
                        <div className="flex-shrink-0 text-xs font-ui text-[#444] border border-[#333] rounded px-2 py-1">BYE</div>
                      )}
                    </div>
                  </div>

                  {/* Expanded match report */}
                  {isOpen && (
                    <div className="card mt-1 p-4 border-t-0 rounded-t-none text-sm font-ui text-[#ccc] leading-relaxed">
                      {reportLoading ? (
                        <p className="text-[#666] italic">Generating match report...</p>
                      ) : (
                        <>
                          <p>{report}</p>
                          {(m.goalie_1 || m.goalie_2) && (
                            <p className="mt-2 text-[#777]">
                              GK: {[m.goalie_1, m.goalie_2].filter(Boolean).map(n => n.split(' ')[0]).join(' & ')}
                            </p>
                          )}
                          {m.coach_rostered && <p className="text-[#777]">Coach: {m.coach_rostered}</p>}
                          {m.notes && <p className="mt-2 text-[#555] italic">{m.notes}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
