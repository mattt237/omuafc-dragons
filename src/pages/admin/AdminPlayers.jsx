import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const EMPTY = { first_name: '', last_name: '', goals: 0, player_of_day_count: 0, goalie_count: 0, active: true, notes: '' }

export default function AdminPlayers() {
  const [players, setPlayers] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('list')

  useEffect(() => { fetch() }, [])

  async function fetch() {
    const { data } = await supabase.from('players').select('*').order('first_name')
    if (data) setPlayers(data)
  }

  function startEdit(p) { setForm(p); setEditId(p.id); setView('form') }
  function startNew() { setForm(EMPTY); setEditId(null); setView('form') }

  async function save() {
    const payload = { ...form, goals: parseInt(form.goals) || 0, player_of_day_count: parseInt(form.player_of_day_count) || 0, goalie_count: parseInt(form.goalie_count) || 0 }
    if (editId) await supabase.from('players').update(payload).eq('id', editId)
    else await supabase.from('players').insert(payload)
    await fetch()
    setView('list')
  }

  async function remove(id) {
    if (!confirm('Delete player?')) return
    await supabase.from('players').delete().eq('id', id)
    fetch()
  }

  if (view === 'form') return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div className="font-heading text-3xl text-white">{editId ? 'EDIT PLAYER' : 'NEW PLAYER'}</div>
        <button onClick={() => setView('list')} className="text-white/70 text-sm font-ui">Cancel</button>
      </div>
      <div className="px-4 py-4 space-y-3">
        <Row label="First Name"><input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className={inputCls} /></Row>
        <Row label="Last Name"><input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className={inputCls} /></Row>
        <Row label="Goals"><input type="number" value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} className={inputCls} /></Row>
        <Row label="POD Count"><input type="number" value={form.player_of_day_count} onChange={e => setForm({ ...form, player_of_day_count: e.target.value })} className={inputCls} /></Row>
        <Row label="GK Count"><input type="number" value={form.goalie_count} onChange={e => setForm({ ...form, goalie_count: e.target.value })} className={inputCls} /></Row>
        <Row label="Active">
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 accent-[#c0161c]" />
        </Row>
        <Row label="Notes"><input value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional" className={inputCls} /></Row>
        <button onClick={save} className="w-full bg-[#c0161c] text-white font-heading text-2xl py-3 rounded-lg">SAVE PLAYER</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div>
          <Link to="/admin" className="text-white/60 text-sm font-ui">← Admin</Link>
          <div className="font-heading text-4xl text-white mt-1">PLAYERS</div>
        </div>
        <button onClick={startNew} className="bg-white text-[#c0161c] font-heading text-lg px-4 py-1.5 rounded-lg">+ NEW</button>
      </div>
      <div className="px-4 py-4 space-y-2">
        {players.map(p => (
          <div key={p.id} className="card p-3 flex items-center justify-between">
            <div>
              <div className="font-ui text-white font-medium">{p.first_name} {p.last_name}</div>
              <div className="text-xs text-[#666] font-ui">{p.goals}G · {p.player_of_day_count} POD · {p.goalie_count} GK {!p.active ? '· Inactive' : ''}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(p)} className="text-[#e8b84b] text-sm font-ui">Edit</button>
              <button onClick={() => remove(p.id)} className="text-[#c0161c] text-sm font-ui">Del</button>
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
