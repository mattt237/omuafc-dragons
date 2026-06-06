import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function About() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    supabase
      .from('training_sessions')
      .select('*')
      .then(({ data }) => { if (data) setSessions(data) })
  }, [])

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">ABOUT</div>
        <div className="text-sm text-white/70 font-ui">OMUAFC Dragons · Grade 8 · 2026</div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Team staff */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">TEAM STAFF</div>
          <StaffRow name="Matt Thompson"  role="Co-Coach" phone="021 292 2022" />
          <StaffRow name="Ben Thompson"   role="Co-Coach" phone="0274 567 551" />
          <StaffRow name="Sharnie Warren" role="Manager"  phone="021 242 3375" />
        </div>

        {/* Training schedule */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">TRAINING</div>
          {sessions.length === 0 ? (
            <div className="text-[#666] text-sm font-ui">Loading schedule...</div>
          ) : (
            sessions.map(s => (
              <div key={s.id} className="flex items-start gap-3 py-3 border-b border-[#1f1f1f] last:border-0">
                <div className="w-2 mt-1.5 h-6 bg-[#c0161c] rounded-full flex-shrink-0" />
                <div>
                  <div className="font-heading text-lg text-white">{s.title}</div>
                  <div className="text-[#e8b84b] font-ui text-sm">{s.day_of_week}{s.start_time ? ` · ${s.start_time}` : ''}</div>
                  {s.detail && <div className="text-[#aaa] font-ui text-sm mt-1">{s.detail}</div>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Match day info */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">MATCH DAY</div>
          <div className="space-y-2 text-sm text-[#aaa] font-ui leading-relaxed">
            <p>Saturday matches — please arrive <span className="text-white font-medium">30 minutes before kickoff</span> for warm-up.</p>
            <p>Check the Matches tab for your fixture details including venue and kickoff time.</p>
            <p>Please wear your full kit and bring water and a positive attitude! 🐉</p>
          </div>
        </div>

        {/* Team values */}
        <div className="card p-4">
          <div className="font-heading text-2xl text-[#e8b84b] mb-3">OUR VALUES</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { word: 'Focus', emoji: '🎯', desc: 'Give your best every session' },
              { word: 'Fire',  emoji: '🔥', desc: 'Play with passion and energy' },
              { word: 'Fair',  emoji: '🤝', desc: 'Respect teammates and opponents' },
              { word: 'Fun',   emoji: '⚡', desc: 'Enjoy every moment of the game' },
            ].map(({ word, emoji, desc }) => (
              <div key={word} className="bg-[#0f0f0f] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{emoji}</span>
                  <span className="font-heading text-xl text-[#c0161c]">{word}</span>
                </div>
                <div className="text-xs text-[#666] font-ui">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors */}
        <div className="card p-4">
          <div className="font-heading text-lg text-[#666] mb-4">OUR SPONSORS</div>
          <div className="flex items-center justify-around gap-4">
            <img src="/logos/manukora-logo.png" alt="Manukora" className="h-10 w-auto object-contain opacity-90" />
            <img src="/logos/pulse-energy-logo.png" alt="Pulse Energy" className="h-10 w-auto object-contain opacity-90 brightness-0 invert" />
          </div>
        </div>

      </div>
    </div>
  )
}

function StaffRow({ name, role, phone }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1f1f1f] last:border-0">
      <div>
        <div className="font-ui text-white font-medium">{name}</div>
        <div className="text-xs text-[#666]">{role}</div>
      </div>
      <a href={`tel:${phone.replace(/\s/g, '')}`}
        className="text-[#e8b84b] text-sm font-ui font-medium">
        {phone}
      </a>
    </div>
  )
}
