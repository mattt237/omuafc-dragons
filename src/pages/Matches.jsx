import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateText } from '../lib/anthropic'

const RESULT_COLOR = { W: '#22c55e', L: '#c0161c', D: '#e8b84b', A: '#e8b84b', BYE: '#444', X: '#444' }
const RESULTS = ['W', 'D', 'L', 'ABD', 'BYE']

function displayResult(result, ourScore, theirScore) {
  if (!result) return null
  if (result === 'BYE' || result === 'X') return { label: 'BYE', color: '#444' }
  if (result === 'A') return { label: 'ABD', color: '#e8b84b' }
  const c = RESULT_COLOR[result] || '#666'
  return { label: `${ourScore}–${theirScore}`, color: c }
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [report, setReport] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('matches').select('*').order('date', { ascending: false }),
      supabase.from('players').select('*').eq('active', true).order('first_name'),
    ]).then(([{ data: m }, { data: p }]) => {
      if (m) setMatches(m)
      if (p) setPlayers(p)
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = [...matches].filter(m => !m.result).sort((a, b) => a.date > b.date ? 1 : -1)
  const played = matches.filter(m => m.result)
  const nextId = upcoming.find(m => m.date >= today)?.id

  function startEdit(match) {
    setEditingId(match.id)
    setExpandedId(null)
    setEditForm({
      result: match.result || '',
      our_score: match.our_score ?? '',
      their_score: match.their_score ?? '',
      scorers: match.scorers || [],
      goalie_1: match.goalie_1 || '',
      goalie_2: match.goalie_2 || '',
      player_of_day: match.player_of_day || '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  async function saveEdit(match) {
    setSaving(true)
    const resultCode = editForm.result === 'ABD' ? 'A' : editForm.result === 'BYE' ? 'BYE' : editForm.result
    await supabase.from('matches').update({
      result: resultCode || null,
      our_score: editForm.our_score !== '' ? parseInt(editForm.our_score) : null,
      their_score: editForm.their_score !== '' ? parseInt(editForm.their_score) : null,
      scorers: editForm.scorers,
      goalie_1: editForm.goalie_1 || null,
      goalie_2: editForm.goalie_2 || null,
      player_of_day: editForm.player_of_day || null,
    }).eq('id', match.id)

    // Refresh
    const { data } = await supabase.from('matches').select('*').order('date', { ascending: false })
    if (data) setMatches(data)
    setSaving(false)
    setEditingId(null)
    setEditForm(null)
  }

  function getScorerGoals(playerName) {
    return editForm.scorers.find(s => s.player === playerName)?.goals || 0
  }

  function updateScorer(playerName, goals) {
    const rest = editForm.scorers.filter(s => s.player !== playerName)
    setEditForm({
      ...editForm,
      scorers: goals > 0 ? [...rest, { player: playerName, goals }] : rest,
    })
  }

  async function toggleExpand(match) {
    if (editingId === match.id) return
    if (expandedId === match.id) { setExpandedId(null); return }
    setExpandedId(match.id)
    setReport('')
    if (['W', 'L', 'D', 'A'].includes(match.result)) {
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
                const isEditing = editingId === m.id
                return (
                  <div key={m.id}>
                    <div className="card p-4" style={isNext ? { borderColor: '#c0161c', borderWidth: 1 } : {}}>
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
                            {isNext && <span className="text-[10px] font-ui font-bold px-2 py-0.5 rounded bg-[#c0161c] text-white tracking-wider">NEXT</span>}
                          </div>
                          <div className="text-xs text-[#888] font-ui mt-0.5">
                            Rd {m.round} · {m.home_away === 'H' ? 'Home' : 'Away'}
                            {m.kickoff_time ? ` · ⏰ ${m.kickoff_time}` : ''}
                          </div>
                          {m.venue && <div className="text-xs text-[#e8b84b] font-ui mt-0.5">📍 {m.venue}</div>}
                        </div>
                        <button onClick={() => startEdit(m)}
                          className="text-xs text-[#666] font-ui border border-[#333] rounded px-2 py-1 flex-shrink-0">
                          Edit
                        </button>
                      </div>
                    </div>
                    {isEditing && editForm && (
                      <EditPanel
                        form={editForm} setForm={setEditForm}
                        players={players} getScorerGoals={getScorerGoals}
                        updateScorer={updateScorer} saving={saving}
                        onSave={() => saveEdit(m)} onCancel={cancelEdit}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Results */}
        <section>
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">RESULTS</div>
          <div className="space-y-2">
            {played.map(m => {
              const badge = displayResult(m.result, m.our_score, m.their_score)
              const d = m.date ? new Date(m.date + 'T00:00:00') : null
              const isBye = m.result === 'BYE' || m.result === 'X'
              const isOpen = expandedId === m.id
              const isEditing = editingId === m.id
              const dotColor = RESULT_COLOR[m.result] || '#444'

              return (
                <div key={m.id}>
                  <div className="card p-4">
                    <div className="flex items-center gap-3">
                      {d ? (
                        <div className="text-center flex-shrink-0 w-10 cursor-pointer" onClick={() => !isBye && toggleExpand(m)}>
                          <div className="font-heading text-2xl leading-none" style={{ color: dotColor }}>{d.getDate()}</div>
                          <div className="text-[10px] text-[#666] uppercase">{d.toLocaleDateString('en-NZ', { month: 'short' })}</div>
                        </div>
                      ) : <div className="w-10" />}

                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isBye && toggleExpand(m)}>
                        {isBye ? (
                          <div className="font-heading text-lg text-[#555]">BYE WEEK</div>
                        ) : (
                          <div className="font-heading text-lg text-white truncate">vs {m.opponent}</div>
                        )}
                        {!isBye && (
                          <div className="text-xs text-[#666] font-ui mt-0.5">
                            Rd {m.round} · {m.home_away === 'H' ? 'Home' : 'Away'}
                            {m.kickoff_time ? ` · ${m.kickoff_time}` : ''}
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

                      {badge && !isBye ? (
                        <div className="font-heading text-xl flex-shrink-0" style={{ color: badge.color }}>{badge.label}</div>
                      ) : isBye ? (
                        <div className="text-xs font-ui text-[#444] border border-[#333] rounded px-2 py-1">BYE</div>
                      ) : null}

                      <button onClick={() => isEditing ? cancelEdit() : startEdit(m)}
                        className="text-xs font-ui border border-[#333] rounded px-2 py-1 flex-shrink-0 ml-1"
                        style={{ color: isEditing ? '#c0161c' : '#666' }}>
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  {/* Edit panel */}
                  {isEditing && editForm && (
                    <EditPanel
                      form={editForm} setForm={setEditForm}
                      players={players} getScorerGoals={getScorerGoals}
                      updateScorer={updateScorer} saving={saving}
                      onSave={() => saveEdit(m)} onCancel={cancelEdit}
                    />
                  )}

                  {/* Expanded report */}
                  {isOpen && !isEditing && (
                    <div className="card mt-1 p-4 text-sm font-ui text-[#ccc] leading-relaxed">
                      {reportLoading ? (
                        <p className="text-[#666] italic">Generating match report...</p>
                      ) : (
                        <>
                          <p>{report}</p>
                          {(m.goalie_1 || m.goalie_2) && (
                            <p className="mt-2 text-[#777]">GK: {[m.goalie_1, m.goalie_2].filter(Boolean).map(n => n.split(' ')[0]).join(' & ')}</p>
                          )}
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

function EditPanel({ form, setForm, players, getScorerGoals, updateScorer, saving, onSave, onCancel }) {
  const selectCls = 'w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2.5 text-white font-ui text-sm focus:outline-none focus:border-[#c0161c]'
  const inputCls  = 'bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2.5 text-white font-ui text-sm focus:outline-none focus:border-[#c0161c] w-24 text-center'

  return (
    <div className="bg-[#141414] border border-[#c0161c]/30 rounded-b-xl p-4 space-y-4 -mt-1">

      {/* Result toggle */}
      <div>
        <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Result</div>
        <div className="flex gap-2">
          {['W', 'D', 'L', 'ABD', 'BYE'].map(r => (
            <button key={r}
              onClick={() => setForm({ ...form, result: r })}
              className="flex-1 py-2.5 rounded-lg font-heading text-sm transition-all"
              style={{
                backgroundColor: form.result === r
                  ? (r === 'W' ? '#22c55e' : r === 'L' ? '#c0161c' : r === 'D' ? '#e8b84b33' : '#33333388')
                  : '#0f0f0f',
                color: form.result === r
                  ? (r === 'D' ? '#e8b84b' : '#fff')
                  : '#666',
                border: `1px solid ${form.result === r ? 'transparent' : '#333'}`,
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Score */}
      <div>
        <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Score</div>
        <div className="flex items-center gap-3">
          <input type="number" value={form.our_score} onChange={e => setForm({ ...form, our_score: e.target.value })}
            placeholder="Us" className={inputCls} />
          <span className="text-[#666] font-heading text-xl">–</span>
          <input type="number" value={form.their_score} onChange={e => setForm({ ...form, their_score: e.target.value })}
            placeholder="Them" className={inputCls} />
        </div>
      </div>

      {/* Scorers */}
      <div>
        <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Goal Scorers</div>
        <div className="space-y-1">
          {players.map(p => {
            const name = `${p.first_name} ${p.last_name}`
            const g = getScorerGoals(name)
            return (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-[#1a1a1a] last:border-0">
                <span className="text-sm font-ui text-white">{p.first_name} {p.last_name}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateScorer(name, Math.max(0, g - 1))}
                    className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white text-lg flex items-center justify-center active:bg-[#333]">−</button>
                  <span className={`font-heading text-xl w-6 text-center ${g > 0 ? 'text-[#e8b84b]' : 'text-[#444]'}`}>{g}</span>
                  <button onClick={() => updateScorer(name, g + 1)}
                    className="w-8 h-8 rounded-full bg-[#c0161c] text-white text-lg flex items-center justify-center active:bg-[#a01010]">+</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Goalie 1 */}
      <div>
        <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Goalie 1</div>
        <select value={form.goalie_1} onChange={e => setForm({ ...form, goalie_1: e.target.value })} className={selectCls}>
          <option value="">None</option>
          {players.map(p => <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name}</option>)}
        </select>
      </div>

      {/* Goalie 2 */}
      <div>
        <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Goalie 2</div>
        <select value={form.goalie_2} onChange={e => setForm({ ...form, goalie_2: e.target.value })} className={selectCls}>
          <option value="">None</option>
          {players.map(p => <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name}</option>)}
        </select>
      </div>

      {/* Player of the Day */}
      <div>
        <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Player of the Day</div>
        <select value={form.player_of_day} onChange={e => setForm({ ...form, player_of_day: e.target.value })} className={selectCls}>
          <option value="">None</option>
          {players.map(p => <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name}</option>)}
        </select>
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-heading text-lg text-[#666] border border-[#333]">
          CANCEL
        </button>
        <button onClick={onSave} disabled={saving}
          className="flex-2 flex-grow-[2] py-3 rounded-xl font-heading text-lg text-white bg-[#c0161c] disabled:opacity-50">
          {saving ? 'SAVING...' : 'SAVE'}
        </button>
      </div>
    </div>
  )
}
