import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Account created successfully!');
      if (data?.session) {
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '24px', border: '1px solid #374151', borderRadius: '8px' }}>
      <h2>Create Your Account</h2>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input
          type="text"
          placeholder="Player Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #4b5563' }}
        />
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
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #4b5563' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', borderRadius: '4px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      {errorMsg && <p style={{ color: '#ef4444', marginTop: '12px' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: '#10b981', marginTop: '12px' }}>{successMsg}</p>}

      <p style={{ marginTop: '16px', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: '#3b82f6' }}>Log In</Link>
      </p>
    </div>
  );
}