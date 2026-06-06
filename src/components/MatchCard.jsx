function resultBadge(result, ourScore, theirScore) {
  if (result === 'BYE') return { label: 'BYE', color: '#666' }
  if (result === 'A') return { label: 'ABD', color: '#e8b84b' }
  if (result === 'X') return { label: 'BYE', color: '#666' }
  if (!result) return { label: 'UPCOMING', color: '#444' }
  if (result === 'W') return { label: `W ${ourScore}–${theirScore}`, color: '#22c55e' }
  if (result === 'L') return { label: `L ${ourScore}–${theirScore}`, color: '#c0161c' }
  if (result === 'D') return { label: `D ${ourScore}–${theirScore}`, color: '#e8b84b' }
  return { label: result, color: '#666' }
}

export default function MatchCard({ match }) {
  const badge = resultBadge(match.result, match.our_score, match.their_score)
  const dateStr = match.date ? new Date(match.date + 'T00:00:00').toLocaleDateString('en-NZ', {
    weekday: 'short', day: 'numeric', month: 'short'
  }) : ''

  const isBye = match.result === 'BYE' || match.result === 'X'
  const isUpcoming = !match.result

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#666] uppercase tracking-wider mb-1">
            Rd {match.round} · {dateStr} · {match.home_away === 'H' ? 'Home' : 'Away'}
          </div>
          {isBye ? (
            <div className="font-heading text-xl text-[#666]">BYE WEEK</div>
          ) : isUpcoming ? (
            <div className="font-heading text-xl text-white">vs {match.opponent}</div>
          ) : (
            <div className="font-heading text-xl text-white">vs {match.opponent}</div>
          )}
          {!isBye && !isUpcoming && match.player_of_day && (
            <div className="text-xs text-[#e8b84b] mt-1">⭐ POD: {match.player_of_day}</div>
          )}
          {!isBye && !isUpcoming && match.scorers && match.scorers.length > 0 && (
            <div className="text-xs text-[#aaa] mt-1">
              ⚽ {match.scorers.map(s => `${s.player} ${s.goals > 1 ? `(${s.goals})` : ''}`).join(', ')}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="font-heading text-sm px-3 py-1 rounded-full text-white whitespace-nowrap"
            style={{ backgroundColor: badge.color + '33', color: badge.color, border: `1px solid ${badge.color}` }}>
            {badge.label}
          </span>
        </div>
      </div>
    </div>
  )
}
