import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('All');

  const fetchScores = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);

    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(25);

    if (selectedGame !== 'All') {
      query = query.eq('game', selectedGame);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard:', error.message);
    } else {
      setPlayers(data || []);
    }

    setLoading(false);
  }, [selectedGame]);

  useEffect(() => {
    fetchScores();

    const channel = supabase
      .channel('realtime_leaderboard_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leaderboard' },
        (payload) => {
          const newEntry = payload.new;
          if (selectedGame === 'All' || newEntry.game === selectedGame) {
            setPlayers((prev) => {
              const updated = [...prev, newEntry];
              return updated.sort((a, b) => b.score - a.score).slice(0, 25);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchScores, selectedGame]);

  const renderRankBadge = (index) => {
    if (index === 0) return <span style={{ fontSize: '18px' }}>👑</span>;
    if (index === 1) return <span style={{ fontSize: '18px' }}>⭐</span>;
    if (index === 2) return <span style={{ fontSize: '18px' }}>🔥</span>;
    return (
      <span style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>
        #{index + 1}
      </span>
    );
  };

  const gameFilters = ['All', 'Snake', 'TicTacToe', 'Connect4', 'BattleArena'];

  return (
    <div
      style={{
        backgroundColor: '#fdfbf7',
        minHeight: 'calc(100vh - 80px)',
        padding: '40px 16px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '32px 28px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
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
              ALL PLAYERS
            </span>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
              }}
            >
              Player Rankings
            </h1>
          </div>

          <div
            style={{
              backgroundColor: '#c6dfcb',
              color: '#1e3a24',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            This Season
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '22px',
          }}
        >
          {gameFilters.map((gameName) => {
            const isSelected = selectedGame === gameName;
            return (
              <button
                key={gameName}
                onClick={() => setSelectedGame(gameName)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: isSelected ? '1px solid #10b981' : '1px solid #e5e7eb',
                  backgroundColor: isSelected ? '#e8f5ed' : '#ffffff',
                  color: isSelected ? '#065f46' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {gameName}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Loading player rankings...
          </div>
        ) : players.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            No scores submitted yet for <strong>{selectedGame}</strong>. Play a round to rank up!
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 110px 80px',
                padding: '10px 14px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '12px',
                fontWeight: '700',
                color: '#6b7280',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              <span>RANK</span>
              <span>PLAYER</span>
              <span style={{ textAlign: 'center' }}>GAME</span>
              <span style={{ textAlign: 'right' }}>POINTS</span>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {players.map((item, index) => {
                const isCurrentPlayer = currentUser && item.user_id === currentUser.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 110px 80px',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      backgroundColor: isCurrentPlayer ? '#e8f5ed' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderRankBadge(index)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          flexShrink: 0,
                        }}
                      >
                        🎮
                      </div>
                      <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>
                        {item.username}
                      </span>
                      {isCurrentPlayer && (
                        <span
                          style={{
                            backgroundColor: '#9ad0b1',
                            color: '#12381f',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                      {item.game}
                    </div>

                    <div
                      style={{
                        textAlign: 'right',
                        fontWeight: '800',
                        color: '#111827',
                        fontSize: '15px',
                      }}
                    >
                      {item.score}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}