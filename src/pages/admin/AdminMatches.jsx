import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const EMPTY = {
  date: '', round: '', opponent: '', home_away: 'H', result: '',
  our_score: '', their_score: '', scorers: [], goalie_1: '', goalie_2: '',
  player_of_day: '', coach_rostered: '', notes: ''
}

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('list')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from('matches').select('*').order('date'),
      supabase.from('players').select('*').eq('active', true).order('first_name'),
    ])
    if (m) setMatches(m)
    if (p) setPlayers(p)
  }

  function startNew() {
    setForm(EMPTY)
    setEditId(null)
    setView('form')
  }

  function startEdit(match) {
    setForm({ ...match, scorers: match.scorers || [] })
    setEditId(match.id)
    setView('form')
  }

  async function save() {
    const payload = {
      ...form,
      round: form.round ? parseInt(form.round) : null,
      our_score: form.our_score !== '' ? parseInt(form.our_score) : null,
      their_score: form.their_score !== '' ? parseInt(form.their_score) : null,
      scorers: form.scorers || [],
    }
    if (editId) {
      await supabase.from('matches').update(payload).eq('id', editId)
    } else {
      await supabase.from('matches').insert(payload)
    }
    await fetchAll()
    setView('list')
  }

  async function remove(id) {
    if (!confirm('Delete this match?')) return
    await supabase.from('matches').delete().eq('id', id)
    fetchAll()
  }

  function updateScorer(playerName, goals) {
    const existing = form.scorers.filter(s => s.player !== playerName)
    if (goals > 0) setForm({ ...form, scorers: [...existing, { player: playerName, goals }] })
    else setForm({ ...form, scorers: existing })
  }

  function getScorerGoals(playerName) {
    return form.scorers.find(s => s.player === playerName)?.goals || 0
  }

  if (view === 'form') return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div className="font-heading text-3xl text-white">{editId ? 'EDIT MATCH' : 'NEW MATCH'}</div>
        <button onClick={() => setView('list')} className="text-white/70 text-sm font-ui">Cancel</button>
      </div>
      <div className="px-4 py-4 space-y-3">
        <Row label="Date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} /></Row>
        <Row label="Round"><input type="number" value={form.round} onChange={e => setForm({ ...form, round: e.target.value })} placeholder="1" className={inputCls} /></Row>
        <Row label="Opponent"><input value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} placeholder="OM8 Jaguars" className={inputCls} /></Row>
        <Row label="H/A">
          <select value={form.home_away} onChange={e => setForm({ ...form, home_away: e.target.value })} className={inputCls}>
            <option value="H">Home</option>
            <option value="A">Away</option>
          </select>
        </Row>
        <Row label="Result">
          <select value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} className={inputCls}>
            <option value="">Upcoming</option>
            <option value="W">Win</option>
            <option value="L">Loss</option>
            <option value="D">Draw</option>
            <option value="A">Abandoned</option>
            <option value="BYE">Bye</option>
          </select>
        </Row>
        <Row label="Score">
          <div className="flex gap-2 items-center flex-1">
            <input type="number" value={form.our_score} onChange={e => setForm({ ...form, our_score: e.target.value })} placeholder="Us" className={inputCls + ' w-20'} />
            <span className="text-[#666]">–</span>
            <input type="number" value={form.their_score} onChange={e => setForm({ ...form, their_score: e.target.value })} placeholder="Them" className={inputCls + ' w-20'} />
          </div>
        </Row>

        {/* Scorers */}
        <div className="card p-4">
          <div className="font-heading text-lg text-[#e8b84b] mb-3">SCORERS</div>
          {players.map(p => {
            const name = `${p.first_name} ${p.last_name}`
            const g = getScorerGoals(name)
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                <span className="text-sm font-ui text-white">{name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateScorer(name, Math.max(0, g - 1))} className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white text-lg flex items-center justify-center">−</button>
                  <span className={`font-heading text-xl w-6 text-center ${g > 0 ? 'text-[#e8b84b]' : 'text-[#444]'}`}>{g}</span>
                  <button onClick={() => updateScorer(name, g + 1)} className="w-7 h-7 rounded-full bg-[#c0161c] text-white text-lg flex items-center justify-center">+</button>
                </div>
              </div>
            )
          })}
        </div>

        <Row label="Goalie 1">
          <select value={form.goalie_1} onChange={e => setForm({ ...form, goalie_1: e.target.value })} className={inputCls}>
            <option value="">None</option>
            {players.map(p => <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name}</option>)}
          </select>
        </Row>
        <Row label="Goalie 2">
          <select value={form.goalie_2} onChange={e => setForm({ ...form, goalie_2: e.target.value })} className={inputCls}>
            <option value="">None</option>
            {players.map(p => <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name}</option>)}
          </select>
        </Row>
        <Row label="Player of Day">
          <select value={form.player_of_day} onChange={e => setForm({ ...form, player_of_day: e.target.value })} className={inputCls}>
            <option value="">None</option>
            {players.map(p => <option key={p.id} value={`${p.first_name} ${p.last_name}`}>{p.first_name} {p.last_name}</option>)}
          </select>
        </Row>
        <Row label="Coach">
          <select value={form.coach_rostered} onChange={e => setForm({ ...form, coach_rostered: e.target.value })} className={inputCls}>
            <option value="">None / Away</option>
            <option value="Ben">Ben</option>
            <option value="Matt">Matt</option>
            <option value="Both">Both</option>
          </select>
        </Row>
        <Row label="Notes"><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional" className={inputCls} /></Row>

        <button onClick={save} className="w-full bg-[#c0161c] text-white font-heading text-2xl py-3 rounded-lg">
          SAVE MATCH
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div>
          <Link to="/admin" className="text-white/60 text-sm font-ui">← Admin</Link>
          <div className="font-heading text-4xl text-white mt-1">MATCHES</div>
        </div>
        <button onClick={startNew} className="bg-white text-[#c0161c] font-heading text-lg px-4 py-1.5 rounded-lg">+ NEW</button>
      </div>
      <div className="px-4 py-4 space-y-3">
        {matches.map(m => (
          <div key={m.id} className="card p-3 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#666] font-ui">Rd {m.round} · {m.date}</div>
              <div className="font-heading text-lg text-white leading-tight">vs {m.opponent || 'BYE'}</div>
              <div className="text-xs text-[#888] font-ui">{m.result || 'Upcoming'} {m.our_score != null ? `${m.our_score}–${m.their_score}` : ''}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(m)} className="text-[#e8b84b] text-sm font-ui">Edit</button>
              <button onClick={() => remove(m.id)} className="text-[#c0161c] text-sm font-ui">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-[#666] text-sm font-ui w-24 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

const inputCls = 'w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white font-ui text-sm focus:outline-none focus:border-[#c0161c]'
