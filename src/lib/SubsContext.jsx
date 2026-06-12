import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

const HALF_SECS = 22 * 60
const SQUAD = ['Charlie', 'Finn', 'Levi', 'Kingston', 'Jai', 'Eddie', 'Tristan', 'James', 'Callum', 'Noah']

function initPlayers() {
  const m = {}
  SQUAD.forEach(name => {
    m[name] = { present: true, running: false, elapsed: 0, baseElapsed: 0, startedAt: null, isGoalie: false, goals: 0 }
  })
  return m
}

const SubsContext = createContext(null)

export function SubsProvider({ children }) {
  const [players, setPlayers]           = useState(initPlayers)
  const [onField, setOnField]           = useState(7)
  const [halfSecs, setHalfSecs]         = useState(HALF_SECS)
  const [halfRunning, setHalfRunning]   = useState(false)
  const [halfDone, setHalfDone]         = useState(false)
  const [flash, setFlash]               = useState(false)
  const [scoreDragons, setScoreDragons] = useState(0)
  const [scoreOpp, setScoreOpp]         = useState(0)
  const [matches, setMatches]           = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [toast, setToast]               = useState(null) // { text, ok }

  const halfRunningRef = useRef(false)
  const lastTickRef    = useRef(null)
  halfRunningRef.current = halfRunning

  // Load matches for selector (recent + upcoming, ordered by date desc)
  useEffect(() => {
    supabase
      .from('matches')
      .select('id, round, opponent, date, home_away, result')
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        setMatches(data)
        // Auto-select next upcoming match (no result, nearest future date)
        const today = new Date().toISOString().split('T')[0]
        const upcoming = [...data]
          .filter(m => !m.result && m.date >= today)
          .sort((a, b) => a.date > b.date ? 1 : -1)
        if (upcoming.length) setSelectedMatchId(upcoming[0].id)
        else if (data.length) setSelectedMatchId(data[0].id) // fallback: most recent
      })
  }, [])

  // Global interval — runs forever regardless of active page
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

  function showToast(text, ok = true) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

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

  function addGoal(name, delta) {
    setPlayers(prev => ({
      ...prev,
      [name]: { ...prev[name], goals: Math.max(0, (prev[name].goals || 0) + delta) }
    }))
  }

  function adjustScore(side, delta) {
    if (side === 'dragons') setScoreDragons(s => Math.max(0, s + delta))
    else setScoreOpp(s => Math.max(0, s + delta))
  }

  async function saveToMatch() {
    if (!selectedMatchId) { showToast('No match selected', false); return }
    const snapshot = { ...players }
    const playerMinutes = SQUAD
      .filter(name => snapshot[name].elapsed > 0)
      .map(name => ({ player: name, seconds: Math.round(snapshot[name].elapsed) }))

    const { error } = await supabase
      .from('matches')
      .update({ player_minutes: playerMinutes })
      .eq('id', selectedMatchId)

    if (error) { showToast('Save failed', false); return }

    const match = matches.find(m => m.id === selectedMatchId)
    const label = match ? `Rd ${match.round}` : 'match'
    showToast(`Minutes saved to ${label} ✓`)
  }

  function resetMatch() {
    setPlayers(initPlayers())
    setHalfSecs(HALF_SECS)
    setHalfRunning(false)
    setHalfDone(false)
    setFlash(false)
    setScoreDragons(0)
    setScoreOpp(0)
    lastTickRef.current = null
  }

  const presentCount = SQUAD.filter(n => players[n].present).length
  const targetSecs   = presentCount > 0 ? (44 * 60 * onField) / presentCount : 0

  const sorted = [...SQUAD].sort((a, b) => {
    const pa = players[a], pb = players[b]
    if (pa.present !== pb.present) return pa.present ? -1 : 1
    return pb.elapsed - pa.elapsed
  })

  return (
    <SubsContext.Provider value={{
      players, sorted, onField, setOnField,
      halfSecs, halfRunning, halfDone, flash,
      presentCount, targetSecs,
      toggleHalf, restartHalf,
      togglePlayer, toggleGoalie, togglePresent, addGoal,
      scoreDragons, scoreOpp, adjustScore,
      matches, selectedMatchId, setSelectedMatchId,
      saveToMatch, toast,
      resetMatch,
      SQUAD,
    }}>
      {children}
    </SubsContext.Provider>
  )
}

export function useSubs() {
  return useContext(SubsContext)
}
