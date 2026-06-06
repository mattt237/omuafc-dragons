import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const EMPTY = { day_of_week: 'Wednesday', start_time: '', title: '', detail: '' }

export default function AdminTraining() {
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [view, setView] = useState('list')

  useEffect(() => { fetch() }, [])
  async function fetch() {
    const { data } = await supabase.from('training_sessions').select('*')
    if (data) setSessions(data)
  }

  function startEdit(s) { setForm(s); setEditId(s.id); setView('form') }
  function startNew() { setForm(EMPTY); setEditId(null); setView('form') }

  async function save() {
    if (editId) await supabase.from('training_sessions').update(form).eq('id', editId)
    else await supabase.from('training_sessions').insert(form)
    await fetch(); setView('list')
  }

  async function remove(id) {
    if (!confirm('Delete session?')) return
    await supabase.from('training_sessions').delete().eq('id', id)
    fetch()
  }

  if (view === 'form') return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div className="font-heading text-3xl text-white">{editId ? 'EDIT SESSION' : 'NEW SESSION'}</div>
        <button onClick={() => setView('list')} className="text-white/70 text-sm font-ui">Cancel</button>
      </div>
      <div className="px-4 py-4 space-y-3">
        <Row label="Day"><input value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })} className={inputCls} /></Row>
        <Row label="Time"><input value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} placeholder="5:00pm" className={inputCls} /></Row>
        <Row label="Title"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></Row>
        <Row label="Detail"><textarea value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} rows={3} className={inputCls} /></Row>
        <button onClick={save} className="w-full bg-[#c0161c] text-white font-heading text-2xl py-3 rounded-lg">SAVE</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5 flex items-end justify-between">
        <div>
          <Link to="/admin" className="text-white/60 text-sm font-ui">← Admin</Link>
          <div className="font-heading text-4xl text-white mt-1">TRAINING</div>
        </div>
        <button onClick={startNew} className="bg-white text-[#c0161c] font-heading text-lg px-4 py-1.5 rounded-lg">+ NEW</button>
      </div>
      <div className="px-4 py-4 space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="card p-3 flex items-center justify-between">
            <div>
              <div className="font-heading text-xl text-white">{s.title}</div>
              <div className="text-xs text-[#888] font-ui">{s.day_of_week} · {s.start_time}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(s)} className="text-[#e8b84b] text-sm font-ui">Edit</button>
              <button onClick={() => remove(s.id)} className="text-[#c0161c] text-sm font-ui">Del</button>
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
