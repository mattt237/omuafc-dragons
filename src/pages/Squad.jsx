import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard'

export default function Squad() {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .eq('active', true)
      .order('goals', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data) })
  }, [])

  return (
    <div className="page-content">
      <div className="bg-[#c0161c] px-4 pt-12 pb-5">
        <div className="font-heading text-5xl text-white">SQUAD</div>
        <div className="text-sm text-white/70 font-ui">2025 Season · {players.length} players</div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {players.map(p => <PlayerCard key={p.id} player={p} />)}
        {players.length === 0 && (
          <div className="text-center text-[#666] py-12 font-ui">Loading squad...</div>
        )}
      </div>
    </div>
  )
}
