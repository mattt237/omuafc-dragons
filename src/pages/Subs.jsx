import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Subs() {
  const [players, setPlayers] = useState([])
  const [playersToday, setPlayersToday] = useState(7)
  const [gameLength, setGameLength] = useState(44)
  const [goalieMode, setGoalieMode] = useState(true)
  const [timers, setTimers] = useState({}) // { playerId: { running, elapsed, startedAt, isGoalie } }
  const intervalRef = useRef(null)

  useEffect(() => {
    supabase.from('players').select('id, first_name, last_name').eq('active', true).order('first_name')
      .then(({ data }) => {
        if (data) {
          setPlayers(data)
          const init = {}
          data.forEach(p => { init[p.id] = { running: false, elapsed: 0, startedAt: null, isGoalie: false } })
          setTimers(init)
        }
      })
  }, [])

  // Tick every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prev => {
        const now = Date.now()
        const updated = { ...prev }
        let changed = false
        Object.keys(updated).forEach(id => {
          if (updated[id].running) {
            const extra = Math.floor((now - updated[id].startedAt) / 1000)
            updated[id] = { ...updated[id], elapsed: updated[id].baseElapsed + extra }
            changed = true
          }
        })
        return changed ? updated : prev
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  function toggleTimer(id) {
    setTimers(prev => {
      const t = prev[id]
      if (t.running) {
        // Stop: freeze elapsed
        const now = Date.now()
        const extra = Math.floor((now - t.startedAt) / 1000)
        return { ...prev, [id]: { ...t, running: false, elapsed: t.baseElapsed + extra, startedAt: null, baseElapsed: t.baseElapsed + extra } }
      } else {
        // Start
        return { ...prev, [id]: { ...t, running: true, startedAt: Date.now(), baseElapsed: t.elapsed } }
      }
    })
  }

  function toggleGoalie(id) {
    setTimers(prev => ({ ...prev, [id]: { ...prev[id], isGoalie: !prev[id].isGoalie } }))
  }

  function resetAll() {
    setTimers(prev => {
      const reset = {}
      Object.keys(prev).forEach(id => { reset[id] = { running: false, elapsed: 0, startedAt: null, baseElapsed: 0, isGoalie: false } })
      return reset
    })
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function getTarget(id) {
    const t = timers[id]
    if (!t) return gameLength * 60 / playersToday
    if (goalieMode && t.isGoalie) return (gameLength / 2) * 60
    const goalies = Object.values(timers).filter(x => x.isGoalie).length
    const fieldPlayers = goalieMode ? Math.max(1, playersToday - goalies) : playersToday
    return (gameLength * 60) / fieldPlayers
  }

  const anyRunning = Object.values(timers).some(t => t.running)

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">SUBS</div>
        <div className="text-sm text-white/70 font-ui">Equal time tracker</div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Controls */}
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Players today</div>
              <div className="flex gap-2">
                {[5, 6, 7].map(n => (
                  <button key={n} onClick={() => setPlayersToday(n)}
                    className="flex-1 py-2.5 rounded-lg font-heading text-xl transition-all"
                    style={{ backgroundColor: playersToday === n ? '#c0161c' : '#0f0f0f', color: playersToday === n ? '#fff' : '#666', border: '1px solid #333' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#666] font-ui uppercase tracking-wider mb-2">Game mins</div>
              <input type="number" value={gameLength} onChange={e => setGameLength(parseInt(e.target.value) || 44)}
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2.5 text-white font-heading text-xl text-center focus:outline-none focus:border-[#c0161c]" />
            </div>
          </div>

          {/* Goalie mode toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-ui">Goalies play full half</div>
              <div className="text-xs text-[#666] font-ui">Separate target for goalies</div>
            </div>
            <button onClick={() => setGoalieMode(!goalieMode)}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ backgroundColor: goalieMode ? '#c0161c' : '#333' }}>
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                style={{ left: goalieMode ? '26px' : '2px' }} />
            </button>
          </div>
        </div>

        {/* Player timers */}
        <div className="space-y-2">
          {players.map(p => {
            const t = timers[p.id] || { running: false, elapsed: 0, isGoalie: false }
            const target = getTarget(p.id)
            const pct = Math.min(100, (t.elapsed / target) * 100)
            const barColor = pct >= 100 ? '#c0161c' : pct >= 85 ? '#e8b84b' : '#22c55e'

            return (
              <div key={p.id} className="card p-3">
                <div className="flex items-center gap-3 mb-2">
                  {/* Name + goalie toggle */}
                  <div className="flex-1 min-w-0">
                    <div className="font-heading text-lg text-white leading-none">{p.first_name}</div>
                    <div className="text-xs text-[#666] font-ui">{p.last_name}</div>
                  </div>

                  {/* Time display */}
                  <div className="text-center">
                    <div className={`font-heading text-2xl leading-none ${t.running ? 'text-[#e8b84b]' : 'text-white'}`}>
                      {formatTime(t.elapsed)}
                    </div>
                    <div className="text-[9px] text-[#555] font-ui">of {formatTime(Math.round(target))}</div>
                  </div>

                  {/* Start/Stop */}
                  <button onClick={() => toggleTimer(p.id)}
                    className="w-16 py-2 rounded-xl font-heading text-sm flex-shrink-0 transition-all"
                    style={{ backgroundColor: t.running ? '#22c55e' : '#1a1a1a', color: t.running ? '#fff' : '#aaa', border: t.running ? 'none' : '1px solid #333' }}>
                    {t.running ? 'STOP' : 'START'}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>

                {/* Goalie toggle */}
                {goalieMode && (
                  <button onClick={() => toggleGoalie(p.id)}
                    className="mt-2 text-[10px] font-ui px-2 py-0.5 rounded transition-all"
                    style={{ backgroundColor: t.isGoalie ? '#e8b84b22' : 'transparent', color: t.isGoalie ? '#e8b84b' : '#444', border: `1px solid ${t.isGoalie ? '#e8b84b' : '#222'}` }}>
                    {t.isGoalie ? '🧤 Goalie' : 'Set as Goalie'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Reset */}
        <button onClick={resetAll}
          className="w-full py-3 rounded-xl font-heading text-xl border border-[#333] text-[#666] active:bg-[#1a1a1a]">
          RESET ALL
        </button>

      </div>
    </div>
  )
}
