import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Leaderboard from './Leaderboard';

export default function Dashboard() {
  const [username, setUsername] = useState('Player');

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        setUsername(
          profile?.username ||
            session.user.user_metadata?.username ||
            session.user.email?.split('@')[0] ||
            'Player'
        );
      }
    }
    getUser();
  }, []);

  const games = [
    {
      title: 'Snake',
      category: 'Retro Arcade',
      description: 'Classic arcade feeding frenzy with 2-player head-to-head racing.',
      path: '/games/snake',
      icon: '🐍',
      tag: '1P Solo & 2P Duel',
      color: '#10b981',
      bgLight: '#ecfdf5',
    },
    {
      title: 'Tic Tac Toe',
      category: 'Classic Strategy',
      description: 'Play solo against our smart AI bot or invite a friend via room code.',
      path: '/games/tictactoe',
      icon: '❌⭕',
      tag: 'Smart AI & 2P Code',
      color: '#3b82f6',
      bgLight: '#eff6ff',
    },
    {
      title: 'Connect 4',
      category: 'Vertical Strategy',
      description: 'Connect four chips in a row against an AI bot or an online opponent.',
      path: '/games/connect4',
      icon: '🔴🟡',
      tag: '1P Bot & 2P Code',
      color: '#f59e0b',
      bgLight: '#fffbeb',
    },
    {
      title: 'Battle Arena',
      category: 'Action Combat',
      description: 'Harry vs. Voldemort wand duel with Mario-style jitter jumps and spells.',
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
        padding: '36px 20px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px 32px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
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
              PORTAL DASHBOARD
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              Welcome back, {username}! 👋
            </h1>
            <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Jump into solo practice or create a room code to duel a friend live!
            </p>
          </div>

          <Link
            to="/profile"
            style={{
              padding: '10px 22px',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            View Your Profile →
          </Link>
        </div>

        {/* Section Heading: Mini Games */}
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
            Featured Mini-Games
          </h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 0' }}>
            Choose a game to play solo or generate a 4-letter room code for 2-player multiplayer.
          </p>
        </div>

        {/* 4 Games Grid Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '44px',
          }}
        >
          {games.map((game) => (
            <div
              key={game.title}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '24px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #f3f4f6',
                transition: 'transform 0.15s ease',
              }}
            >
              <div>
                {/* Icon & Mode Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: game.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
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

                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                  {game.title}
                </h3>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                  {game.category}
                </span>

                <p style={{ margin: '10px 0 20px 0', color: '#6b7280', fontSize: '13px', lineHeight: '1.45' }}>
                  {game.description}
                </p>
              </div>

              <Link
                to={game.path}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px 0',
                  borderRadius: '12px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                }}
              >
                Play Game 🎮
              </Link>
            </div>
          ))}
        </div>

        {/* Embedded Live Leaderboard Section */}
        <div style={{ marginTop: '10px' }}>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}