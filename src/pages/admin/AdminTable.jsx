import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const EMPTY = { team: '', played: 0, won: 0, drawn: 0, lost: 0 }

function pts(t) {
  return (parseInt(t.won) || 0) * 3 + (parseInt(t.drawn) || 0)
}

export default function AdminTable() {
  const [teams, setTeams] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('list')

  useEffect(() => { fetchTeams() }, [])

  async function fetchTeams() {
    const { data } = await supabase.from('standings').select('*')
    if (data) {
      setTeams([...data].sort((a, b) => pts(b) - pts(a) || b.won - a.won))
    }
  }

  async function save() {
    const payload = {
      team:   form.team,
      played: parseInt(form.played) || 0,
      won:    parseInt(form.won)    || 0,
      drawn:  parseInt(form.drawn)  || 0,
      lost:   parseInt(form.lost)   || 0,
      // always write computed points back so DB stays consistent
      points: pts(form),
    }

    if (editId) {
      await supabase.from('standings').update(payload).eq('id', editId)
    } else {
      await supabase.from('standings').insert(payload)
    }

    // stamp last-updated time
    await supabase.from('settings').upsert(
      { key: 'standings_updated', value: new Date().toISOString() },
      { onConflict: 'key' }
    )

    await fetchTeams()
    setView('list')
  }

  async function remove(id) {
    if (!confirm('Delete team?')) return
    await supabase.from('standings').delete().eq('id', id)
    fetchTeams()
  }

  const n = (field) => ({
    type: 'number',
    value: form[field],
    onChange: e => setForm({ ...form, [field]: e.target.value }),
    className: inputCls,
  })

  if (view === 'form') return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div className="font-heading text-3xl text-white">{editId ? 'EDIT TEAM' : 'NEW TEAM'}</div>
        <button onClick={() => setView('list')} className="text-white/70 text-sm font-ui">Cancel</button>
      </div>
      <div className="px-4 py-4 space-y-3">
        <Row label="Team">
          <input value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} className={inputCls} />
        </Row>
        <Row label="Played"><input {...n('played')} /></Row>
        <Row label="Won"><input {...n('won')} /></Row>
        <Row label="Drawn"><input {...n('drawn')} /></Row>
        <Row label="Lost"><input {...n('lost')} /></Row>

        {/* Live points preview */}
        <div className="card p-3 flex items-center justify-between">
          <span className="text-[#666] text-sm font-ui">Points (auto-calculated)</span>
          <span className="font-heading text-2xl text-[#e8b84b]">{pts(form)}</span>
        </div>

        <button onClick={save} className="w-full bg-[#c0161c] text-white font-heading text-2xl py-3 rounded-lg">
          SAVE
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div>
          <Link to="/admin" className="text-white/60 text-sm font-ui">← Admin</Link>
          <div className="font-heading text-4xl text-white mt-1">TABLE</div>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setView('form') }}
          className="bg-white text-[#c0161c] font-heading text-lg px-4 py-1.5 rounded-lg">+ NEW</button>
      </div>
      <div className="px-4 py-4 space-y-2">
        {teams.map((t, i) => (
          <div key={t.id} className="card p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[#666] text-xs w-4">{i + 1}</span>
              <div>
                <div className={`font-ui font-medium ${t.team.toLowerCase().includes('dragons') ? 'text-[#e8b84b]' : 'text-white'}`}>
                  {t.team}
                </div>
                <div className="text-xs text-[#666] font-ui">
                  P{t.played} W{t.won} D{t.drawn} L{t.lost} · <span className="text-white">{pts(t)}pts</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setForm(t); setEditId(t.id); setView('form') }} className="text-[#e8b84b] text-sm font-ui">Edit</button>
              <button onClick={() => remove(t.id)} className="text-[#c0161c] text-sm font-ui">Del</button>
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
