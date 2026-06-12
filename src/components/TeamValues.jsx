const VALUES = [
  { word: 'Focus', emoji: '🎯', desc: 'Give your best every session' },
  { word: 'Fire',  emoji: '🔥', desc: 'Play with passion and energy' },
  { word: 'Fair',  emoji: '🤝', desc: 'Respect teammates and opponents' },
  { word: 'Fun',   emoji: '⚡', desc: 'Enjoy every moment of the game' },
]

export default function TeamValues() {
  return (
    <div className="card p-4">
      <div className="font-heading text-2xl text-[#e8b84b] mb-3">OUR VALUES</div>
      <div className="grid grid-cols-2 gap-3">
        {VALUES.map(({ word, emoji, desc }) => (
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
  )
}
