import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen to live auth changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 40px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#a7d7c5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          🎮
        </div>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
          GameVerse
        </span>
      </Link>

      {/* Main Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[
          { label: 'Home', path: '/' },
          { label: 'Games', path: '/games' },
          { label: 'Leaderboard', path: '/leaderboard' },
          { label: 'About', path: '/about' },
        ].map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                color: active ? '#1e3a24' : '#4b5563',
                backgroundColor: active ? '#c6dfcb' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Auth State Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <span>👤</span>
              <span>{username}</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#f87171',
              }}
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}