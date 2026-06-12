import { useState } from 'react'
import { useMatchDay } from '../lib/MatchDayContext'

function fmt(secs) {
  const s = Math.max(0, Math.round(secs))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function matchLabel(m) {
  if (!m) return '—'
  const d = m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' }) : ''
  return `Rd ${m.round} · vs ${m.opponent}${d ? ' · ' + d : ''}${m.kickoff_time ? ' · ' + m.kickoff_time : ''}`
}

function StepHeader({ number, title, active = true }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: active ? '#c0161c' : '#1a1a1a', border: active ? 'none' : '1px solid #333' }}>
        <span className="font-heading text-sm leading-none" style={{ color: active ? '#fff' : '#555' }}>{number}</span>
      </div>
      <div className="font-heading text-lg" style={{ color: active ? '#e8b84b' : '#555' }}>{title}</div>
    </div>
  )
}

const selectCls = 'w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2.5 text-white font-ui text-sm focus:outline-none focus:border-[#c0161c]'

export default function MatchDay() {
  const {
    players, sorted, onField, setOnField,
    halfSecs, halfRunning, halfDone, flash,
    presentCount, targetSecs,
    toggleHalf, restartHalf, togglePlayer, toggleGoalie, togglePresent, addGoal,
    matches, selectedMatchId, setSelectedMatchId,
    scoreDragons, scoreOpp, adjustScore,
    resultOverride, setResultOverride, autoResult, effectiveResult,
    podPlayer, setPodPlayer,
    goalie1, setGoalie1, goalie2, setGoalie2,
    supaPlayers, SQUAD,
    endGameOpen, setEndGameOpen,
    submitMatch, submitPending, doReset,
    toast,
  } = useMatchDay()

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showResetModal, setShowResetModal]   = useState(false)

  const selectedMatch = matches.find(m => m.id === selectedMatchId)
  const oppName = selectedMatch?.opponent || 'Opposition'

  const presentSupaPlayers = supaPlayers.filter(p =>
    SQUAD.includes(p.first_name) && players[p.first_name]?.present
  )

  async function handleConfirmSubmit() {
    setShowSubmitModal(false)
    await submitMatch()
  }

  function handleConfirmReset() {
    setShowResetModal(false)
    doReset()
  }

  const resultColor = r => r === 'W' ? '#22c55e' : r === 'L' ? '#c0161c' : '#e8b84b'
  const resultLabel = r => r === 'W' ? 'WIN' : r === 'L' ? 'LOSS' : r === 'D' ? 'DRAW' : r

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-10 pb-4">
        <div className="font-heading text-4xl text-white">MATCH DAY</div>
        <div className="text-xs text-white/60 font-ui">Attendance · timers · result</div>
      </div>

      <div className="px-3 pt-3 pb-28 space-y-3">

        {/* ── STEP 1: SELECT FIXTURE ── */}
        <div className="card p-3">
          <StepHeader number={1} title="SELECT FIXTURE" />
          <select
            value={selectedMatchId || ''}
            onChange={e => setSelectedMatchId(e.target.value)}
            className={selectCls}
          >
            <option value="">— Select today's match —</option>
            {matches.map(m => (
              <option key={m.id} value={m.id}>{matchLabel(m)}</option>
            ))}
          </select>
          {selectedMatch && (
            <div className="mt-2 p-2 bg-[#0f0f0f] rounded-lg flex flex-wrap gap-x-4 gap-y-1 text-xs font-ui text-[#888]">
              <span>vs <span className="text-white font-medium">{selectedMatch.opponent}</span></span>
              {selectedMatch.home_away && <span>{selectedMatch.home_away === 'H' ? 'Home' : 'Away'}</span>}
              {selectedMatch.kickoff_time && <span>⏰ {selectedMatch.kickoff_time}</span>}
              {selectedMatch.venue && <span className="text-[#e8b84b]">📍 {selectedMatch.venue}</span>}
            </div>
          )}
        </div>

        {/* ── STEP 2: ATTENDANCE ── */}
        <div className="card p-3">
          <StepHeader number={2} title="ATTENDANCE" />

          {/* Presence chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {SQUAD.map(name => {
              const present = players[name].present
              return (
                <button key={name} onClick={() => togglePresent(name)}
                  className="px-3 py-1.5 rounded-full font-ui text-sm font-medium transition-all"
                  style={{
                    backgroundColor: present ? '#c0161c22' : '#1a1a1a',
                    color: present ? '#fff' : '#444',
                    border: `1px solid ${present ? '#c0161c' : '#2a2a2a'}`,
                  }}>
                  {name}
                </button>
              )
            })}
          </div>

          {/* On Field + Target + count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-xs text-[#555] font-ui">On field</div>
              <button onClick={() => setOnField(n => Math.max(1, n - 1))}
                className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white font-heading text-lg leading-none flex items-center justify-center">−</button>
              <span className="font-heading text-2xl text-white w-5 text-center">{onField}</span>
              <button onClick={() => setOnField(n => Math.min(10, n + 1))}
                className="w-7 h-7 rounded-full bg-[#c0161c] text-white font-heading text-lg leading-none flex items-center justify-center">+</button>
            </div>
            <div className="flex-1 text-right">
              <span className="font-heading text-xl text-[#e8b84b]">{fmt(targetSecs)}</span>
              <span className="text-xs text-[#555] font-ui ml-1">target ea</span>
            </div>
          </div>
          <div className="text-xs text-[#555] font-ui text-right mt-1">
            {presentCount} of {SQUAD.length} available
          </div>
        </div>

        {/* ── STEP 3: LIVE GAME ── */}
        <div className="card p-3">
          <StepHeader number={3} title="LIVE GAME" />

          {/* Live score counter */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Dragons */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-[10px] text-[#c0161c] font-ui uppercase tracking-widest mb-1.5">Dragons</div>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustScore('dragons', -1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-2xl"
                  style={{ backgroundColor: '#1a1a1a', color: '#888' }}>−</button>
                <span className="font-heading text-center tabular-nums" style={{ fontSize: 48, color: '#fff', width: 48, lineHeight: 1 }}>
                  {scoreDragons}
                </span>
                <button onClick={() => adjustScore('dragons', 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-2xl"
                  style={{ backgroundColor: '#c0161c', color: '#fff' }}>+</button>
              </div>
            </div>

            {/* Divider */}
            <div className="font-heading text-3xl text-[#333] flex-shrink-0 mt-4">–</div>

            {/* Opponent */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-[10px] text-[#555] font-ui uppercase tracking-widest mb-1.5 truncate max-w-full px-1 text-center">
                {oppName}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustScore('opp', -1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-2xl"
                  style={{ backgroundColor: '#1a1a1a', color: '#888' }}>−</button>
                <span className="font-heading text-center tabular-nums" style={{ fontSize: 48, color: '#888', width: 48, lineHeight: 1 }}>
                  {scoreOpp}
                </span>
                <button onClick={() => adjustScore('opp', 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-2xl"
                  style={{ backgroundColor: '#333', color: '#fff' }}>+</button>
              </div>
            </div>
          </div>

          {/* Half timer */}
          <div className="text-center mb-3">
            <div className="font-heading leading-none" style={{
              fontSize: 72,
              color: halfDone ? (flash ? '#c0161c' : '#444') : halfSecs < 120 ? '#e8b84b' : '#fff',
            }}>
              {fmt(halfSecs)}
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              <button onClick={toggleHalf} disabled={halfDone}
                className="px-6 py-2 rounded-xl font-heading text-xl disabled:opacity-30"
                style={{ backgroundColor: halfRunning ? '#c0161c' : '#22c55e', color: '#fff' }}>
                {halfRunning ? 'PAUSE' : halfDone ? 'DONE' : 'START'}
              </button>
              <button onClick={restartHalf}
                className="px-4 py-2 rounded-xl font-heading text-xl border border-[#333] text-[#888]">
                RESTART
              </button>
            </div>
          </div>

          {/* Player rows */}
          <div className="text-[9px] font-ui text-[#444] uppercase tracking-widest mb-1 px-0.5">
            Tap name = 🧤 goalie toggle
          </div>
          <div className="rounded-lg overflow-hidden border border-[#1a1a1a]">
            {sorted.map((name, i) => {
              const p = players[name]
              const pct = targetSecs > 0 ? (p.elapsed / targetSecs) * 100 : 0
              const barColor = pct > 100 ? '#a855f7' : pct >= 75 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'
              return (
                <div key={name} style={{ opacity: p.present ? 1 : 0.3, borderTop: i > 0 ? '1px solid #1a1a1a' : 'none' }}>
                  <div className="flex items-center gap-1.5 px-2" style={{ height: 44 }}>
                    {/* Name + goalie toggle */}
                    <button onClick={() => p.present && toggleGoalie(name)}
                      className="flex items-center gap-0.5 flex-shrink-0" style={{ width: 68 }}>
                      <span className="font-heading text-base text-white leading-none">{name}</span>
                      {p.isGoalie && <span className="text-xs ml-0.5">🧤</span>}
                    </button>
                    {/* Inline goal counter */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => p.present && addGoal(name, -1)}
                        disabled={!p.present || (p.goals || 0) === 0}
                        className="flex items-center justify-center rounded disabled:opacity-30"
                        style={{ width: 22, height: 22, backgroundColor: '#1a1a1a', color: '#666' }}>
                        <span className="font-heading text-sm leading-none">−</span>
                      </button>
                      <span className="font-heading text-base tabular-nums text-center"
                        style={{ width: 18, color: (p.goals || 0) > 0 ? '#e8b84b' : '#2a2a2a' }}>
                        {(p.goals || 0) > 0 ? p.goals : '·'}
                      </span>
                      <button
                        onClick={() => p.present && addGoal(name, 1)}
                        disabled={!p.present}
                        className="flex items-center justify-center rounded disabled:opacity-20"
                        style={{
                          width: 22, height: 22,
                          backgroundColor: (p.goals || 0) > 0 ? '#e8b84b22' : '#1a1a1a',
                          color: (p.goals || 0) > 0 ? '#e8b84b' : '#666',
                          border: (p.goals || 0) > 0 ? '1px solid #e8b84b44' : 'none',
                        }}>
                        <span className="font-heading text-sm leading-none">+</span>
                      </button>
                    </div>
                    <div className="flex-1" />
                    {/* Elapsed time */}
                    <span className="font-ui text-sm tabular-nums w-11 text-right flex-shrink-0"
                      style={{ color: p.running ? '#e8b84b' : '#555' }}>
                      {fmt(p.elapsed)}
                    </span>
                    {/* GO/STOP */}
                    <button onClick={() => p.present && togglePlayer(name)} disabled={!p.present}
                      className="font-heading text-sm flex-shrink-0 rounded-lg disabled:opacity-20 transition-colors"
                      style={{
                        width: 46, height: 28,
                        backgroundColor: p.running ? '#c0161c' : '#22c55e1a',
                        color: p.running ? '#fff' : '#22c55e',
                        border: `1px solid ${p.running ? 'transparent' : '#22c55e44'}`,
                      }}>
                      {p.running ? 'STOP' : 'GO'}
                    </button>
                  </div>
                  <div className="h-1 bg-[#111] mx-2 mb-1.5 rounded-full overflow-hidden">
                    {p.present && pct > 0 && (
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── STEP 4: END OF GAME (collapsible) ── */}
        <div className="card overflow-hidden">
          <button
            className="w-full p-3 flex items-center gap-2 text-left"
            onClick={() => setEndGameOpen(o => !o)}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: endGameOpen ? '#c0161c' : '#1a1a1a', border: endGameOpen ? 'none' : '1px solid #333' }}>
              <span className="font-heading text-sm leading-none" style={{ color: endGameOpen ? '#fff' : '#555' }}>4</span>
            </div>
            <div className="font-heading text-lg text-[#e8b84b] flex-1">END OF GAME</div>
            <span className="font-heading text-sm px-2 py-0.5 rounded mr-1" style={{
              color: resultColor(effectiveResult),
              backgroundColor: resultColor(effectiveResult) + '22',
            }}>
              {effectiveResult} {scoreDragons}–{scoreOpp}
            </span>
            <span className="text-[#555] text-sm">{endGameOpen ? '▲' : '▼'}</span>
          </button>

          {endGameOpen && (
            <div className="px-3 pb-4 space-y-4 border-t border-[#1a1a1a] pt-3">

              {/* Score summary (read-only — from live counter in Step 3) */}
              <div className="bg-[#0f0f0f] rounded-lg p-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center flex-1">
                    <div className="text-[10px] text-[#555] font-ui mb-1">Dragons</div>
                    <div className="font-heading text-5xl text-white">{scoreDragons}</div>
                  </div>
                  <div className="font-heading text-3xl text-[#333]">–</div>
                  <div className="text-center flex-1">
                    <div className="text-[10px] text-[#555] font-ui mb-1 truncate">{oppName}</div>
                    <div className="font-heading text-5xl text-[#888]">{scoreOpp}</div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="font-heading text-xl" style={{ color: resultColor(effectiveResult) }}>
                    {resultLabel(effectiveResult)}
                  </span>
                  {resultOverride && (
                    <span className="text-[10px] text-[#555] font-ui ml-2">(override)</span>
                  )}
                </div>
                <div className="text-[10px] text-[#444] font-ui text-center mt-1">
                  Adjust score with live counter in Step 3
                </div>
              </div>

              {/* Result override */}
              <div>
                <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Override Result</div>
                <div className="flex gap-2">
                  {['W', 'D', 'L', 'ABD'].map(r => (
                    <button key={r}
                      onClick={() => setResultOverride(resultOverride === r ? '' : r)}
                      className="flex-1 py-2 rounded-lg font-heading text-sm transition-all"
                      style={{
                        backgroundColor: resultOverride === r
                          ? (r === 'W' ? '#22c55e' : r === 'L' ? '#c0161c' : r === 'D' ? '#e8b84b33' : '#33333388')
                          : '#0f0f0f',
                        color: resultOverride === r ? (r === 'D' ? '#e8b84b' : '#fff') : '#555',
                        border: `1px solid ${resultOverride === r ? 'transparent' : '#2a2a2a'}`,
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player of the Day */}
              <div>
                <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Player of the Day</div>
                <div className="flex flex-wrap gap-2">
                  {presentSupaPlayers.map(p => {
                    const fullName = `${p.first_name} ${p.last_name}`
                    const selected = podPlayer === fullName
                    return (
                      <button key={p.id}
                        onClick={() => setPodPlayer(selected ? '' : fullName)}
                        className="px-3 py-1.5 rounded-full font-ui text-sm font-medium transition-all"
                        style={{
                          backgroundColor: selected ? '#e8b84b' : '#1a1a1a',
                          color: selected ? '#000' : '#666',
                          border: `1px solid ${selected ? '#e8b84b' : '#2a2a2a'}`,
                        }}>
                        {p.first_name}{selected ? ' ⭐' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Goalies */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-1.5">Goalie 1</div>
                  <select value={goalie1} onChange={e => setGoalie1(e.target.value)} className={selectCls}>
                    <option value="">None</option>
                    {presentSupaPlayers.map(p => (
                      <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-1.5">Goalie 2</div>
                  <select value={goalie2} onChange={e => setGoalie2(e.target.value)} className={selectCls}>
                    <option value="">None</option>
                    {presentSupaPlayers.map(p => (
                      <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── STEP 5: SUBMIT MATCH ── */}
        <div className="card p-3">
          <StepHeader number={5} title="SUBMIT MATCH" active />
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={!selectedMatchId || submitPending}
            className="w-full py-4 rounded-xl font-heading text-2xl text-white disabled:opacity-30 active:bg-[#a01010] transition-colors"
            style={{ backgroundColor: '#c0161c' }}
          >
            {submitPending ? 'SUBMITTING...' : 'SUBMIT MATCH'}
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full py-3 rounded-xl font-heading text-xl text-[#c0161c] border border-[#c0161c33] active:bg-[#c0161c0a]"
        >
          RESET MATCH
        </button>

      </div>

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="bg-[#141414] rounded-t-2xl p-6 w-full max-w-[500px] space-y-4"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <div className="font-heading text-2xl text-white text-center">Submit Result?</div>
            <div className="text-center space-y-1">
              <div className="font-heading text-5xl text-white">{scoreDragons} – {scoreOpp}</div>
              <div className="text-sm text-[#888] font-ui">Dragons vs {oppName}</div>
              <div className="font-heading text-2xl" style={{ color: resultColor(effectiveResult) }}>
                {resultLabel(effectiveResult)}
              </div>
              {podPlayer && (
                <div className="text-sm text-[#e8b84b] font-ui">⭐ {podPlayer.split(' ')[0]} — Player of the Day</div>
              )}
              <div className="text-xs text-[#555] font-ui">
                {presentCount} players · {SQUAD.reduce((s, n) => s + (players[n]?.goals || 0), 0)} goals recorded
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl font-heading text-xl text-[#666] border border-[#333]">
                CANCEL
              </button>
              <button onClick={handleConfirmSubmit}
                className="flex-1 py-3 rounded-xl font-heading text-xl text-white bg-[#c0161c] active:bg-[#a01010]">
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET CONFIRMATION MODAL ── */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="bg-[#141414] rounded-t-2xl p-6 w-full max-w-[500px] space-y-4"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <div className="font-heading text-2xl text-white text-center">Reset All Match Data?</div>
            <div className="text-sm text-[#888] font-ui text-center">
              Clears all timers, attendance, scores and goal tallies. This cannot be undone.
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-xl font-heading text-xl text-[#666] border border-[#333]">
                CANCEL
              </button>
              <button onClick={handleConfirmReset}
                className="flex-1 py-3 rounded-xl font-heading text-xl text-[#c0161c] border border-[#c0161c]">
                RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl font-ui text-sm font-medium shadow-lg"
          style={{
            backgroundColor: toast.ok ? '#22c55e' : '#c0161c',
            color: '#fff',
            maxWidth: 300,
            textAlign: 'center',
          }}>
          {toast.text}
        </div>
      )}
    </div>
  )
}
