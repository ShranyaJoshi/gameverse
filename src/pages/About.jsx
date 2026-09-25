export default function About() {
  return (
    <div
      style={{
        backgroundColor: '#fdfbf7',
        minHeight: 'calc(100vh - 80px)',
        padding: '40px 20px',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
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
          ABOUT GAMEVERSE
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: '0 0 16px 0' }}>
          Real-Time Mini-Gaming Platform
        </h1>

        <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '15px', marginBottom: '24px' }}>
          GameVerse is a full-stack multiplayer gaming web portal combining retro arcade fun with modern cloud architecture. Players can practice against responsive AI bots or create temporary 4-letter room codes to duel live with opponents across the web.
        </p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '14px' }}>
          Tech Architecture
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '22px' }}>⚛️</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px', color: '#1f2937' }}>React & Vite</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Blazing fast single-page client rendering with HTML5 Canvas 2D game loops.
            </p>
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '22px' }}>⚡</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px', color: '#1f2937' }}>Supabase Realtime</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Websocket broadcast channels for instantaneous peer-to-peer physics & spell sync.
            </p>
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '22px' }}>🏆</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px', color: '#1f2937' }}>PostgreSQL Leaderboard</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Live score replication and ranking tables linked directly with user profiles.
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '10px' }}>
          Current Games
        </h2>
        <ul style={{ color: '#4b5563', lineHeight: '1.8', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
          <li><strong>Snake:</strong> Classic arcade food chase with 2-player head-to-head survival.</li>
          <li><strong>Tic Tac Toe:</strong> Heuristic AI opponent + instant room code matchmaking.</li>
          <li><strong>Connect 4:</strong> Strategy gravity-grid match with win detection & live sync.</li>
          <li><strong>Battle Arena:</strong> Harry Potter vs. Lord Voldemort pixel combat with Mario-style jitter jumping, spell casting, and Protego defense.</li>
        </ul>
      </div>
    </div>
  );
}