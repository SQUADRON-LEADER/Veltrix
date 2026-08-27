import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, GitBranch } from 'lucide-react';
import { useAuth } from '../authContext';
import Input from '../components/common/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(formData);
      if (result.success) navigate('/dashboard');
      else setError(result.error);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 340 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#e6edf3' }}>
            <GitBranch className="w-8 h-8" />
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em' }}>Veltrix</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '20px', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#e6edf3', textAlign: 'center', marginBottom: 20 }}>
            Sign in to Veltrix
          </h1>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', borderRadius: 6, marginBottom: 16 }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f85149' }} />
              <p style={{ fontSize: 13, color: '#f85149', margin: 0 }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>
                Username or email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '5px 12px',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#e6edf3',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#58a6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(31,111,235,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: '#58a6ff', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >Forgot password?</a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '5px 12px',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#e6edf3',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#58a6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(31,111,235,0.3)'; }}
                onBlur={e => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '5px 16px',
                background: loading ? '#196c2e' : '#238636',
                border: '1px solid rgba(240,246,252,0.1)',
                borderRadius: 6,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                lineHeight: '28px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2ea043'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#238636'; }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 16, height: 16 }} />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#8b949e' }}>New to Veltrix? </span>
          <Link to="/signup" style={{ fontSize: 14, color: '#58a6ff', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            Create an account
          </Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#6e7681', marginTop: 16 }}>
          By signing in you agree to our{' '}
          <a href="#" style={{ color: '#58a6ff' }}>Terms</a> and{' '}
          <a href="#" style={{ color: '#58a6ff' }}>Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
