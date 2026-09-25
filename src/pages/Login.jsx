import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #374151', borderRadius: '8px' }}>
      <h2>Sign In to GameVerse</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #4b5563' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #4b5563' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', borderRadius: '4px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      {errorMsg && <p style={{ color: '#ef4444', marginTop: '12px' }}>{errorMsg}</p>}

      <p style={{ marginTop: '16px', fontSize: '14px' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#3b82f6' }}>Sign Up</Link>
      </p>
    </div>
  );
}