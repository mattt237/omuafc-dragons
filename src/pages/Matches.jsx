import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateText } from '../lib/anthropic'
import MatchCard from '../components/MatchCard'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [selected, setSelected] = useState(null)
  const [report, setReport] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data }) => { if (data) setMatches(data) })
  }, [])

  async function selectMatch(match) {
    if (selected?.id === match.id) { setSelected(null); return }
    setSelected(match)
    setReport('')
    const hasResult = match.result && match.result !== 'BYE' && match.result !== 'X' && match.result !== 'A'
    if (hasResult || match.result === 'A') {
      setReportLoading(true)
      const scorersText = match.scorers && match.scorers.length > 0
        ? 'Scorers: ' + match.scorers.map(s => `${s.player} (${s.goals})`).join(', ') + '.'
        : 'Individual scorers not recorded.'
      const prompt = `Write a short match report (3-4 sentences) for OMUAFC Dragons vs ${match.opponent} on ${match.date}. ${match.result === 'A' ? 'The match was abandoned.' : `Result: ${match.result === 'W' ? 'Win' : match.result === 'L' ? 'Loss' : 'Draw'} ${match.our_score}–${match.their_score}.`} ${scorersText} ${match.player_of_day ? `Player of the day: ${match.player_of_day}.` : ''} ${match.notes || ''}`
      const text = await generateText(prompt)
      setReport(text)
      setReportLoading(false)
    }
  }

  const past = matches.filter(m => m.result)
  const upcoming = matches.filter(m => !m.result)

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">MATCHES</div>
        <div className="text-sm text-white/70 font-ui">Season 2026 · May – October</div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {upcoming.length > 0 && (
          <section>
            <div className="font-heading text-2xl text-[#e8b84b] mb-3">UPCOMING</div>
            <div className="space-y-3">
              {upcoming.map(m => (
                <div key={m.id} onClick={() => selectMatch(m)}>
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">RESULTS</div>
          <div className="space-y-3">
            {[...past].reverse().map(m => (
              <div key={m.id}>
                <div onClick={() => selectMatch(m)} className="cursor-pointer">
                  <MatchCard match={m} />
                </div>
                {selected?.id === m.id && (
                  <div className="card mt-1 p-4 text-sm font-ui text-[#ccc] leading-relaxed">
                    {m.result === 'BYE' || m.result === 'X' ? (
                      <p>Bye week — no match played.</p>
                    ) : reportLoading ? (
                      <p className="text-[#666] italic">Generating match report...</p>
                    ) : (
                      <>
                        <p>{report}</p>
                        {m.goalie_1 && <p className="mt-2 text-[#888]">Goalies: {m.goalie_1}{m.goalie_2 ? ` & ${m.goalie_2}` : ''}</p>}
                        {m.coach_rostered && <p className="text-[#888]">Coach: {m.coach_rostered}</p>}
                        {m.notes && <p className="mt-2 text-[#666] italic">{m.notes}</p>}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
