import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle, GitBranch } from 'lucide-react';
import { useAuth } from '../authContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '', general: '' });
  };

  const validate = () => {
    const errs = {};
    if (formData.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData);
      if (result.success) navigate('/dashboard');
      else setErrors({ general: result.error });
    } catch {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    padding: '5px 12px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required
        style={{ ...fieldStyle, borderColor: errors[name] ? '#f85149' : '#30363d' }}
        onFocus={e => { e.target.style.borderColor = errors[name] ? '#f85149' : '#58a6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(31,111,235,0.3)'; }}
        onBlur={e => { e.target.style.borderColor = errors[name] ? '#f85149' : '#30363d'; e.target.style.boxShadow = 'none'; }}
      />
      {errors[name] && <p style={{ fontSize: 12, color: '#f85149', marginTop: 4 }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 360 }}
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
            Create your account
          </h1>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', borderRadius: 6, marginBottom: 16 }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f85149' }} />
              <p style={{ fontSize: 13, color: '#f85149', margin: 0 }}>{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Username" name="username" placeholder="johndoe" />
            <Field label="Email address" name="email" type="email" placeholder="you@example.com" />
            <Field label="Password" name="password" type="password" placeholder="••••••••" />
            <Field label="Confirm password" name="confirmPassword" type="password" placeholder="••••••••" />

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: '#8b949e' }}>
              <input type="checkbox" required style={{ marginTop: 2, accentColor: '#238636' }} />
              <span>
                I agree to the{' '}
                <a href="#" style={{ color: '#58a6ff' }}>Terms of Service</a> and{' '}
                <a href="#" style={{ color: '#58a6ff' }}>Privacy Policy</a>
              </span>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                lineHeight: '28px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2ea043'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#238636'; }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#8b949e' }}>Already have an account? </span>
          <Link to="/login" style={{ fontSize: 14, color: '#58a6ff', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
