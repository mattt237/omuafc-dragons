import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateText } from '../lib/anthropic'

export default function Training() {
  const [sessions, setSessions] = useState([])
  const [focusNote, setFocusNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('training_sessions')
      .select('*')
      .then(({ data }) => { if (data) setSessions(data) })

    loadFocus()
  }, [])

  async function loadFocus() {
    setLoading(true)
    const text = await generateText('Write a 2-sentence training focus note for the OMUAFC Dragons for this week. Make it motivational and relevant to youth football development.')
    setFocusNote(text)
    setLoading(false)
  }

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">TRAINING</div>
        <div className="text-sm text-white/70 font-ui">Weekly schedule</div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* AI focus note */}
        <div className="card p-4 border-[#e8b84b]/30">
          <div className="font-heading text-lg text-[#e8b84b] mb-2">THIS WEEK'S FOCUS</div>
          {loading ? (
            <div className="text-[#666] text-sm italic font-ui">Loading focus note...</div>
          ) : (
            <div className="text-sm text-[#ccc] font-ui leading-relaxed">{focusNote}</div>
          )}
          <button onClick={loadFocus} className="mt-3 text-xs text-[#666] underline font-ui">Refresh</button>
        </div>

        {/* Sessions */}
        {sessions.map(s => (
          <div key={s.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-full bg-[#c0161c] rounded-full flex-shrink-0 mt-1" style={{ minHeight: '40px' }} />
              <div>
                <div className="font-heading text-xl text-white">{s.title}</div>
                <div className="text-[#e8b84b] font-ui text-sm">{s.day_of_week} · {s.start_time}</div>
                <div className="text-[#aaa] font-ui text-sm mt-1">{s.detail}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Notes */}
        <div className="card p-4">
          <div className="font-heading text-lg text-[#666] mb-2">MATCH DAY</div>
          <div className="text-sm text-[#aaa] font-ui leading-relaxed">
            Saturday matches — please arrive 30 minutes before kickoff for warm-up. Bring your full kit, boots, and water bottle.
          </div>
        </div>
      </div>
    </div>
  )
}
