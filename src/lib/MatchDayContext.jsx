import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

const HALF_SECS = 22 * 60
export const SQUAD = ['Charlie', 'Finn', 'Levi', 'Kingston', 'Jai', 'Eddie', 'Tristan', 'James', 'Callum', 'Noah']

function initPlayers() {
  const m = {}
  SQUAD.forEach(name => {
    m[name] = { present: true, running: false, elapsed: 0, baseElapsed: 0, startedAt: null, isGoalie: false, goals: 0 }
  })
  return m
}

const MatchDayContext = createContext(null)

export function MatchDayProvider({ children }) {
  // Timer state
  const [players, setPlayers]         = useState(initPlayers)
  const [onField, setOnField]         = useState(7)
  const [halfSecs, setHalfSecs]       = useState(HALF_SECS)
  const [halfRunning, setHalfRunning] = useState(false)
  const [halfDone, setHalfDone]       = useState(false)
  const [flash, setFlash]             = useState(false)

  // Match selection
  const [matches, setMatches]                   = useState([])
  const [selectedMatchId, setSelectedMatchId]   = useState(null)

  // End-of-game fields
  const [ourScore, setOurScore]           = useState('')
  const [theirScore, setTheirScore]       = useState('')
  const [resultOverride, setResultOverride] = useState('')
  const [podPlayer, setPodPlayer]         = useState('')
  const [goalie1, setGoalie1]             = useState('')
  const [goalie2, setGoalie2]             = useState('')
  const [endGameOpen, setEndGameOpen]     = useState(false)

  // DB players (for updating stats on submit)
  const [supaPlayers, setSupaPlayers] = useState([])

  // UI state
  const [toast, setToast]               = useState(null)
  const [submitPending, setSubmitPending] = useState(false)

  const halfRunningRef = useRef(false)
  const lastTickRef    = useRef(null)
  halfRunningRef.current = halfRunning

  // Load matches + players on mount
  useEffect(() => {
    supabase.from('matches')
      .select('id, round, opponent, date, home_away, result, venue, kickoff_time')
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (!data) return
        setMatches(data)
        const today = new Date().toISOString().split('T')[0]
        const upcoming = data
          .filter(m => !m.result && m.date >= today)
          .sort((a, b) => a.date > b.date ? 1 : -1)
        if (upcoming.length) setSelectedMatchId(upcoming[0].id)
        else if (data.length) setSelectedMatchId(data[data.length - 1].id)
      })
    supabase.from('players')
      .select('*').eq('active', true).order('first_name')
      .then(({ data }) => { if (data) setSupaPlayers(data) })
  }, [])

  // Global interval — runs forever, persists across navigation
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
    setTimeout(() => setToast(null), 3500)
  }

  function toggleHalf() {
    if (halfDone) return
    lastTickRef.current = Date.now()
    setHalfRunning(r => !r)
  }

  // Resets countdown only — player timers keep running
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

  function addGoal(name, delta) {
    setPlayers(prev => {
      const p = prev[name]
      if (!p.present) return prev
      return { ...prev, [name]: { ...p, goals: Math.max(0, (p.goals || 0) + delta) } }
    })
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

  function setMatchGoals(fullName, goals) {
    setMatchGoalsState(prev => ({ ...prev, [fullName]: Math.max(0, goals) }))
  }

  // Auto-calculate result from scores
  const os = ourScore !== '' ? parseInt(ourScore) : null
  const ts = theirScore !== '' ? parseInt(theirScore) : null
  const autoResult = (os !== null && ts !== null)
    ? (os > ts ? 'W' : os < ts ? 'L' : 'D')
    : null
  const effectiveResult = resultOverride || autoResult

  async function submitMatch() {
    if (!selectedMatchId) { showToast('No match selected', false); return }
    if (!effectiveResult) { showToast('Enter the score in Step 4', false); return }

    setSubmitPending(true)
    try {
      // Re-fetch players for accurate current values
      const { data: freshPlayers } = await supabase.from('players').select('*').eq('active', true)
      if (!freshPlayers) throw new Error('Could not load players')

      const playerMinutes = SQUAD
        .filter(n => players[n].elapsed > 0)
        .map(n => ({ player: n, seconds: Math.round(players[n].elapsed) }))

      const scorers = SQUAD
        .filter(n => (players[n].goals || 0) > 0)
        .map(n => {
          const dbP = freshPlayers.find(p => p.first_name === n)
          return dbP ? { player: `${dbP.first_name} ${dbP.last_name}`, goals: players[n].goals } : null
        })
        .filter(Boolean)

      // 1. Update match record
      const { error: matchError } = await supabase.from('matches').update({
        result: effectiveResult,
        our_score: os,
        their_score: ts,
        scorers,
        player_of_day: podPlayer || null,
        goalie_1: goalie1 || null,
        goalie_2: goalie2 || null,
        player_minutes: playerMinutes,
      }).eq('id', selectedMatchId)
      if (matchError) throw matchError

      // 2. Update each present player's stats
      const presentFirstNames = SQUAD.filter(n => players[n].present)
      for (const firstName of presentFirstNames) {
        const dbPlayer = freshPlayers.find(p => p.first_name === firstName)
        if (!dbPlayer) continue
        const fullName = `${dbPlayer.first_name} ${dbPlayer.last_name}`
        const goalsScored = players[firstName]?.goals || 0
        const isPOD = podPlayer === fullName
        const isGoalie = [goalie1, goalie2].includes(fullName)
        await supabase.from('players').update({
          appearances:          (dbPlayer.appearances || 0) + 1,
          goals:                (dbPlayer.goals || 0) + goalsScored,
          player_of_day_count:  (dbPlayer.player_of_day_count || 0) + (isPOD ? 1 : 0),
          goalie_count:         (dbPlayer.goalie_count || 0) + (isGoalie ? 1 : 0),
        }).eq('id', dbPlayer.id)
      }

      showToast('Match submitted! ✓')
      doReset()
    } catch (err) {
      console.error(err)
      showToast('Submit failed. Try again.', false)
    } finally {
      setSubmitPending(false)
    }
  }

  function doReset() {
    setPlayers(initPlayers())
    setHalfSecs(HALF_SECS)
    setHalfRunning(false)
    setHalfDone(false)
    setFlash(false)
    setOurScore('')
    setTheirScore('')
    setResultOverride('')
    setPodPlayer('')
    setGoalie1('')
    setGoalie2('')
    setEndGameOpen(false)
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
    <MatchDayContext.Provider value={{
      players, sorted, onField, setOnField,
      halfSecs, halfRunning, halfDone, flash,
      presentCount, targetSecs,
      toggleHalf, restartHalf, togglePlayer, toggleGoalie, togglePresent, addGoal,
      matches, selectedMatchId, setSelectedMatchId,
      ourScore, setOurScore, theirScore, setTheirScore,
      resultOverride, setResultOverride, autoResult, effectiveResult,
      podPlayer, setPodPlayer,
      goalie1, setGoalie1, goalie2, setGoalie2,
      supaPlayers,
      endGameOpen, setEndGameOpen,
      submitMatch, submitPending, doReset,
      toast,
      SQUAD,
    }}>
      {children}
    </MatchDayContext.Provider>
  )
}

export function useMatchDay() {
  return useContext(MatchDayContext)
}
