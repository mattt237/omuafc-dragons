import { useState } from 'react'
import { generateText } from '../lib/anthropic'

export default function PlayerCard({ player }) {
  const [expanded, setExpanded] = useState(false)
  const [blurb, setBlurb] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleExpand() {
    setExpanded(!expanded)
    if (!expanded && !blurb) {
      setLoading(true)
      const text = await generateText(
        `Write a short 2-sentence player profile for ${player.first_name} ${player.last_name} on the OMUAFC Dragons. They have scored ${player.goals} goals, been player of the day ${player.player_of_day_count} times, and played in goal ${player.goalie_count} times this season.${player.notes ? ' Notes: ' + player.notes : ''}`
      )
      setBlurb(text)
      setLoading(false)
    }
  }

  const initials = `${player.first_name[0]}${player.last_name[0]}`

  return (
    <div className="card p-4 cursor-pointer select-none" onClick={handleExpand}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#c0161c] flex items-center justify-center flex-shrink-0">
          <span className="font-heading text-white text-lg">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading text-xl text-white leading-tight">
            {player.first_name} {player.last_name}
          </div>
          <div className="flex gap-3 mt-1">
            <Stat label="Goals" value={player.goals} />
            <Stat label="POD" value={player.player_of_day_count} gold />
            <Stat label="GK" value={player.goalie_count} />
          </div>
        </div>
        <div className="text-[#666] text-sm">{expanded ? '▲' : '▼'}</div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#2a2a2a] text-sm text-[#ccc] leading-relaxed font-ui">
          {loading ? (
            <div className="text-[#666] italic">Generating profile...</div>
          ) : (
            blurb || 'No profile available.'
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, gold }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`font-heading text-lg leading-none ${gold ? 'text-[#e8b84b]' : 'text-white'}`}>{value}</span>
      <span className="text-[10px] text-[#666] uppercase tracking-wider">{label}</span>
    </div>
  )
}
