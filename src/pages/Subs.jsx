import { useSubs } from '../lib/SubsContext'

function fmt(secs) {
  const s = Math.max(0, Math.round(secs))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const SQUAD = ['Charlie', 'Finn', 'Levi', 'Kingston', 'Jai', 'Eddie', 'Tristan', 'James', 'Callum', 'Noah']

export default function Subs() {
  const {
    players, sorted, onField, setOnField,
    halfSecs, halfRunning, halfDone, flash,
    presentCount, targetSecs,
    toggleHalf, restartHalf,
    togglePlayer, toggleGoalie, togglePresent, addGoal,
    scoreDragons, scoreOpp, adjustScore,
    resetMatch,
  } = useSubs()

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-10 pb-4">
        <div className="font-heading text-4xl text-white">SUBS</div>
        <div className="text-xs text-white/60 font-ui">Match day substitution timer</div>
      </div>

      <div className="px-3 pt-3 pb-24 space-y-3">

        {/* SCOREBOARD */}
        <div className="card p-4">
          <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest text-center mb-3">Score</div>
          <div className="flex items-center justify-between gap-2">

            {/* Dragons */}
            <div className="flex items-center gap-2 flex-1 justify-start">
              <button onClick={() => adjustScore('dragons', -1)}
                className="w-9 h-9 rounded-full bg-[#1a1a1a] font-heading text-2xl text-[#888] flex items-center justify-center active:bg-[#333]">−</button>
              <div className="text-center w-8">
                <div className="font-heading text-5xl text-white leading-none">{scoreDragons}</div>
              </div>
              <button onClick={() => adjustScore('dragons', 1)}
                className="w-9 h-9 rounded-full bg-[#c0161c] font-heading text-2xl text-white flex items-center justify-center active:bg-[#a01010]">+</button>
            </div>

            {/* Divider */}
            <div className="flex flex-col items-center flex-shrink-0 px-2">
              <div className="font-heading text-2xl text-[#444]">–</div>
              <div className="text-[9px] text-[#333] font-ui uppercase tracking-wider mt-0.5">DRG · OPP</div>
            </div>

            {/* Opposition */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button onClick={() => adjustScore('opp', -1)}
                className="w-9 h-9 rounded-full bg-[#1a1a1a] font-heading text-2xl text-[#888] flex items-center justify-center active:bg-[#333]">−</button>
              <div className="text-center w-8">
                <div className="font-heading text-5xl text-[#888] leading-none">{scoreOpp}</div>
              </div>
              <button onClick={() => adjustScore('opp', 1)}
                className="w-9 h-9 rounded-full bg-[#333] font-heading text-2xl text-white flex items-center justify-center active:bg-[#444]">+</button>
            </div>

          </div>
        </div>

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

        {/* PLAYER TIMERS */}
        <div className="card overflow-hidden">
          <div className="px-3 pt-2 pb-1">
            <div className="text-[10px] font-ui text-[#555] uppercase tracking-widest">Tap name = 🧤 goalie toggle</div>
          </div>
          <div>
            {sorted.map(name => {
              const p = players[name]
              const pct = targetSecs > 0 ? (p.elapsed / targetSecs) * 100 : 0
              const barColor = pct > 100 ? '#a855f7' : pct >= 75 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'
              const absent = !p.present
              const goals = p.goals || 0

              return (
                <div key={name}
                  className="px-3 border-t border-[#1a1a1a] first:border-0"
                  style={{ opacity: absent ? 0.3 : 1 }}>

                  <div className="flex items-center gap-1.5" style={{ height: 44 }}>

                    {/* Name + goalie toggle */}
                    <button
                      onClick={() => !absent && toggleGoalie(name)}
                      className="flex items-center gap-1 min-w-0"
                      style={{ width: 80, flexShrink: 0 }}
                    >
                      <span className="font-heading text-lg text-white leading-none">{name}</span>
                      {p.isGoalie && <span className="text-xs leading-none">🧤</span>}
                    </button>

                    {/* Goal counter */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => !absent && addGoal(name, -1)}
                        disabled={absent || goals === 0}
                        className="w-6 h-6 rounded-full flex items-center justify-center font-heading text-sm disabled:opacity-30"
                        style={{ backgroundColor: '#1a1a1a', color: '#888' }}
                      >−</button>
                      <span
                        className="font-heading text-base w-5 text-center"
                        style={{ color: goals > 0 ? '#e8b84b' : '#444' }}
                      >
                        {goals > 0 ? goals : '⚽'}
                      </span>
                      <button
                        onClick={() => !absent && addGoal(name, 1)}
                        disabled={absent}
                        className="w-6 h-6 rounded-full flex items-center justify-center font-heading text-sm disabled:opacity-30"
                        style={{ backgroundColor: goals > 0 ? '#e8b84b22' : '#1a1a1a', color: goals > 0 ? '#e8b84b' : '#888', border: goals > 0 ? '1px solid #e8b84b55' : 'none' }}
                      >+</button>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Elapsed */}
                    <span
                      className="font-ui text-sm tabular-nums w-11 text-right flex-shrink-0"
                      style={{ color: p.running ? '#e8b84b' : '#666' }}
                    >
                      {fmt(p.elapsed)}
                    </span>

                    {/* Start/Stop */}
                    <button
                      onClick={() => !absent && togglePlayer(name)}
                      disabled={absent}
                      className="font-heading text-sm flex-shrink-0 rounded-lg disabled:opacity-20 transition-colors"
                      style={{
                        width: 52, height: 30,
                        backgroundColor: absent ? 'transparent' : p.running ? '#c0161c' : '#22c55e1a',
                        color: absent ? '#333' : p.running ? '#fff' : '#22c55e',
                        border: `1px solid ${absent ? '#222' : p.running ? 'transparent' : '#22c55e44'}`,
                      }}
                    >
                      {p.running ? 'STOP' : 'GO'}
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden mb-2 -mt-0.5">
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

        {/* ON FIELD + TARGET */}
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
