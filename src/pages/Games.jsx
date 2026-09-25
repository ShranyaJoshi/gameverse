import { Link } from 'react-router-dom';

export default function Games() {
  const games = [
    {
      title: 'Snake',
      category: 'Retro Arcade',
      description: 'Classic arcade feeding frenzy with 2-player head-to-head racing on the same grid.',
      path: '/games/snake',
      icon: '🐍',
      tag: '1P Solo & 2P Duel',
      color: '#10b981',
      bgLight: '#ecfdf5',
    },
    {
      title: 'Tic Tac Toe',
      category: 'Classic Strategy',
      description: 'Play solo against our smart AI bot or invite a friend via real-time 4-letter room code.',
      path: '/games/tictactoe',
      icon: '❌⭕',
      tag: 'Smart AI & 2P Code',
      color: '#3b82f6',
      bgLight: '#eff6ff',
    },
    {
      title: 'Connect 4',
      category: 'Vertical Strategy',
      description: 'Connect four chips in a row against an AI bot or an online opponent over Realtime.',
      path: '/games/connect4',
      icon: '🔴🟡',
      tag: '1P Bot & 2P Code',
      color: '#f59e0b',
      bgLight: '#fffbeb',
    },
    {
      title: 'Battle Arena',
      category: 'Action Combat',
      description: 'Harry vs. Voldemort wand duel with Mario-style jitter jumps, Protego shields, and spell beams.',
      path: '/games/battle',
      icon: '⚡',
      tag: 'Pixel Wand Duel',
      color: '#ef4444',
      bgLight: '#fef2f2',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#fdfbf7',
        minHeight: 'calc(100vh - 80px)',
        padding: '40px 20px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#f87171',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            GAME ARCADE
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
            All Mini-Games
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '6px 0 0 0' }}>
            Choose a game to play solo against an automated bot, or host/join a live multiplayer room.
          </p>
        </div>

        {/* Game Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {games.map((game) => (
            <div
              key={game.title}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '28px 24px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #f3f4f6',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '16px',
                      backgroundColor: game.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    {game.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: game.color,
                      backgroundColor: game.bgLight,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                    }}
                  >
                    {game.tag}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {game.title}
                </h3>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                  {game.category}
                </span>

                <p style={{ margin: '12px 0 24px 0', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                  {game.description}
                </p>
              </div>

              <Link
                to={game.path}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 0',
                  borderRadius: '9999px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                Launch Game 🎮
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}