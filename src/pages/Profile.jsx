import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      // 1. Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // 2. Fetch public profile record
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      setProfileData(profile);

      // 3. Fetch all scores submitted by this user
      const { data: scores, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (!error && scores) {
        setUserScores(scores);
      }

      setLoading(false);
    }

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 80px)',
          backgroundColor: '#fdfbf7',
          color: '#6b7280',
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
        }}
      >
        Loading player profile...
      </div>
    );
  }

  const username =
    profileData?.username ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Player';

  // Compute aggregate stats
  const totalPoints = userScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const totalGamesPlayed = userScores.length;

  const getHighScoreForGame = (gameName) => {
    const scores = userScores
      .filter((s) => s.game?.toLowerCase() === gameName.toLowerCase())
      .map((s) => s.score);
    return scores.length > 0 ? Math.max(...scores) : 0;
  };

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
          padding: '36px 32px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Header Profile Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            borderBottom: '1px solid #f3f4f6',
            paddingBottom: '24px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              backgroundColor: '#c6dfcb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              flexShrink: 0,
            }}
          >
            🎮
          </div>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#f87171',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              PLAYER PROFILE
            </span>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1f2937' }}>
              {username}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
              {user?.email} • Member since {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Aggregate Stats Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #f3f4f6',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
              Total Points
            </span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>
              {totalPoints}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #f3f4f6',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
              Matches Played
            </span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#3b82f6', marginTop: '6px' }}>
              {totalGamesPlayed}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #f3f4f6',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
              Snake High
            </span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#f59e0b', marginTop: '6px' }}>
              {getHighScoreForGame('Snake')}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #f3f4f6',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
              Arena High
            </span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#8b5cf6', marginTop: '6px' }}>
              {getHighScoreForGame('BattleArena')}
            </div>
          </div>
        </div>

        {/* Activity Feed / Match History */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            Recent Match History
          </h2>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Latest 10 matches
          </span>
        </div>

        {userScores.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 16px',
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            No matches played yet. Head over to <strong>Games</strong> to start scoring points!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userScores.slice(0, 10).map((record) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #f3f4f6',
                }}
              >
                <div>
                  <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '15px' }}>
                    {record.game}
                  </span>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {new Date(record.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontWeight: '800', color: '#10b981', fontSize: '16px' }}>
                  +{record.score} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}