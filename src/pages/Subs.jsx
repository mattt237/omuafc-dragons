import { useEffect, useState, useRef } from 'react'

const HALF_SECS = 22 * 60
const SQUAD = ['Charlie', 'Finn', 'Levi', 'Kingston', 'Jai', 'Eddie', 'Tristan', 'James', 'Callum', 'Noah']

function initPlayers() {
  const m = {}
  SQUAD.forEach(name => {
    m[name] = { present: true, running: false, elapsed: 0, baseElapsed: 0, startedAt: null, isGoalie: false }
  })
  return m
}

function fmt(secs) {
  const s = Math.max(0, Math.round(secs))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Subs() {
  const [players, setPlayers] = useState(initPlayers)
  const [onField, setOnField] = useState(7)
  const [halfSecs, setHalfSecs] = useState(HALF_SECS)
  const [halfRunning, setHalfRunning] = useState(false)
  const [halfDone, setHalfDone] = useState(false)
  const [flash, setFlash] = useState(false)
  const lastTickRef = useRef(null)
  const halfRunningRef = useRef(false)

  halfRunningRef.current = halfRunning

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const delta = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0.25
      lastTickRef.current = now

      if (halfRunningRef.current) {
        setHalfSecs(prev => {
          if (prev <= 0) return 0
          const next = prev - delta
          if (next <= 0) {
            setHalfRunning(false)
            setHalfDone(true)
            setFlash(true)
            setTimeout(() => setFlash(false), 3000)
            return 0
          }
          return next
        })
      }

      setPlayers(prev => {
        let changed = false
        const next = {}
        SQUAD.forEach(name => {
          const p = prev[name]
          if (p.running) {
            next[name] = { ...p, elapsed: p.baseElapsed + (now - p.startedAt) / 1000 }
            changed = true
          } else {
            next[name] = p
          }
        })
        return changed ? next : prev
      })
    }, 250)
    return () => clearInterval(id)
  }, [])

  const presentCount = SQUAD.filter(n => players[n].present).length
  const targetSecs = presentCount > 0 ? (44 * 60 * onField) / presentCount : 0

  function toggleHalf() {
    if (halfDone) return
    lastTickRef.current = Date.now()
    setHalfRunning(r => !r)
  }

  function restartHalf() {
    setHalfSecs(HALF_SECS)
    setHalfRunning(false)
    setHalfDone(false)
    setFlash(false)
    lastTickRef.current = null
  }

  function togglePlayer(name) {
    setPlayers(prev => {
      const p = prev[name]
      if (!p.present) return prev
      const now = Date.now()
      if (p.running) {
        const elapsed = p.baseElapsed + (now - p.startedAt) / 1000
        return { ...prev, [name]: { ...p, running: false, elapsed, baseElapsed: elapsed, startedAt: null } }
      }
      return { ...prev, [name]: { ...p, running: true, startedAt: now, baseElapsed: p.elapsed } }
    })
  }

  function toggleGoalie(name) {
    setPlayers(prev => ({ ...prev, [name]: { ...prev[name], isGoalie: !prev[name].isGoalie } }))
  }

  function togglePresent(name) {
    setPlayers(prev => {
      const p = prev[name]
      if (p.present && p.running) {
        const now = Date.now()
        const elapsed = p.baseElapsed + (now - p.startedAt) / 1000
        return { ...prev, [name]: { ...p, present: false, running: false, elapsed, baseElapsed: elapsed, startedAt: null } }
      }
      return { ...prev, [name]: { ...p, present: !p.present } }
    })
  }

  function resetMatch() {
    setPlayers(initPlayers())
    setHalfSecs(HALF_SECS)
    setHalfRunning(false)
    setHalfDone(false)
    setFlash(false)
    lastTickRef.current = null
  }

  const sorted = [...SQUAD].sort((a, b) => {
    const pa = players[a], pb = players[b]
    if (pa.present !== pb.present) return pa.present ? -1 : 1
    return pb.elapsed - pa.elapsed
  })

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-10 pb-4">
        <div className="font-heading text-4xl text-white">SUBS</div>
        <div className="text-xs text-white/60 font-ui">Match day substitution timer</div>
      </div>

      <div className="px-3 pt-3 pb-24 space-y-3">

        {/* GAME TIMER */}
        <div className="card p-4 text-center">
          <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest mb-1">Half Timer</div>
          <div
            className="font-heading leading-none"
            style={{
              fontSize: 80,
              color: halfDone
                ? (flash ? '#c0161c' : '#444')
                : halfSecs < 120 ? '#e8b84b' : '#fff',
              transition: flash ? 'color 0.3s' : 'none',
            }}
          >
            {fmt(halfSecs)}
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            <button
              onClick={toggleHalf}
              disabled={halfDone}
              className="px-6 py-2.5 rounded-xl font-heading text-xl disabled:opacity-30 transition-colors"
              style={{ backgroundColor: halfRunning ? '#c0161c' : '#22c55e', color: '#fff' }}
            >
              {halfRunning ? 'PAUSE' : halfDone ? 'DONE' : 'START'}
            </button>
            <button
              onClick={restartHalf}
              className="px-5 py-2.5 rounded-xl font-heading text-xl border border-[#333] text-[#888]"
            >
              RESTART HALF
            </button>
          </div>
        </div>

        {/* SETTINGS + TARGET */}
        <div className="flex gap-3">
          <div className="card p-3 flex-1 text-center">
            <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest mb-2">On Field</div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setOnField(n => Math.max(1, n - 1))}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white font-heading text-xl">−</button>
              <span className="font-heading text-3xl text-white w-8 text-center">{onField}</span>
              <button onClick={() => setOnField(n => Math.min(10, n + 1))}
                className="w-8 h-8 rounded-full bg-[#c0161c] text-white font-heading text-xl">+</button>
            </div>
          </div>
          <div className="card p-3 flex-1 text-center">
            <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest mb-1">Present / Target</div>
            <div className="font-heading text-3xl text-white">{presentCount}</div>
            <div className="text-sm text-[#e8b84b] font-ui font-medium">{fmt(targetSecs)} ea</div>
          </div>
        </div>

        {/* ATTENDANCE */}
        <div className="card p-3">
          <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest mb-2">Attendance — tap to toggle</div>
          <div className="flex flex-wrap gap-2">
            {SQUAD.map(name => {
              const present = players[name].present
              return (
                <button key={name} onClick={() => togglePresent(name)}
                  className="px-3 py-1 rounded-full font-ui text-sm font-medium transition-all"
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
        </div>

        {/* PLAYER TIMERS */}
        <div className="card overflow-hidden">
          <div className="px-3 pt-2 pb-0.5">
            <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest">Players — tap name for 🧤 goalie</div>
          </div>
          <div>
            {sorted.map(name => {
              const p = players[name]
              const pct = targetSecs > 0 ? (p.elapsed / targetSecs) * 100 : 0
              const barColor = pct > 100 ? '#a855f7' : pct >= 75 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'
              const absent = !p.present

              return (
                <div key={name}
                  className="px-3 border-t border-[#1a1a1a] first:border-0"
                  style={{ opacity: absent ? 0.3 : 1 }}>
                  <div className="flex items-center gap-2" style={{ height: 44 }}>
                    {/* Name */}
                    <button
                      onClick={() => !absent && toggleGoalie(name)}
                      className="flex-1 text-left min-w-0 flex items-center gap-1"
                    >
                      <span className="font-heading text-lg text-white">{name}</span>
                      {p.isGoalie && <span className="text-sm leading-none">🧤</span>}
                    </button>

                    {/* Elapsed */}
                    <span
                      className="font-ui text-sm tabular-nums w-11 text-right flex-shrink-0"
                      style={{ color: p.running ? '#e8b84b' : '#777', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {fmt(p.elapsed)}
                    </span>

                    {/* Start/Stop */}
                    <button
                      onClick={() => !absent && togglePlayer(name)}
                      disabled={absent}
                      className="w-14 rounded-lg font-heading text-sm flex-shrink-0 transition-all"
                      style={{
                        height: 30,
                        backgroundColor: absent ? 'transparent' : p.running ? '#c0161c' : '#22c55e1a',
                        color: absent ? '#333' : p.running ? '#fff' : '#22c55e',
                        border: `1px solid ${absent ? '#222' : p.running ? 'transparent' : '#22c55e44'}`,
                      }}
                    >
                      {p.running ? 'STOP' : 'START'}
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden mb-1.5 -mt-1">
                    {!absent && pct > 0 && (
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RESET */}
        <button
          onClick={resetMatch}
          className="w-full py-3 rounded-xl font-heading text-xl text-[#c0161c] border border-[#c0161c33] active:bg-[#c0161c11]"
        >
          RESET MATCH
        </button>

      </div>
    </div>
  )
}
