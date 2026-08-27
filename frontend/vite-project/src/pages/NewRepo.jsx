import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, AlertCircle, Lock, Globe } from 'lucide-react';
import { repoAPI } from '../api';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', red: '#f85149',
};

export default function NewRepo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', description: '', isPrivate: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Repository name is required'); return; }
    if (!/^[a-zA-Z0-9-_]+$/.test(formData.name)) {
      setError('Repository name can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    setLoading(true);
    try {
      const ownerId = user?._id || user?.id || localStorage.getItem('userId');
      const payload = {
        name: formData.name.trim(),
        description: formData.description,
        isPrivate: formData.isPrivate,
        visibility: !formData.isPrivate,
        owner: ownerId,
      };
      const response = await repoAPI.create(payload);
      const createdRepo = response.data.repo || response.data.repository;
      const targetUsername = user?.username || createdRepo?.owner?.username || 'user';
      const repoName = createdRepo?.name || formData.name;
      navigate(`/repos/${targetUsername}/${repoName}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 48px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: GH.text, margin: '0 0 8px' }}>
          Create a new repository
        </h1>
        <p style={{ fontSize: 14, color: GH.muted, margin: '0 0 24px', paddingBottom: 16, borderBottom: `1px solid ${GH.border}` }}>
          A repository contains all project files, including revision history.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(248,81,73,0.15)', border: '1px solid rgba(248,81,73,0.4)', borderRadius: 6, color: GH.red, fontSize: 13 }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Repo Name input */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 8 }}>
              Repository name <span style={{ color: GH.red }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: GH.muted, fontWeight: 500 }}>{user?.username} /</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="my-awesome-project"
                required
                style={{
                  flex: 1, padding: '6px 12px', background: GH.canvas,
                  border: `1px solid ${GH.border}`, borderRadius: 6,
                  color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = GH.link}
                onBlur={e => e.target.style.borderColor = GH.border}
              />
            </div>
            <p style={{ fontSize: 12, color: GH.subtle, marginTop: 6 }}>
              Great repository names are short and memorable.
            </p>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 8 }}>
              Description <span style={{ fontSize: 12, color: GH.subtle, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description of your project"
              rows={3}
              style={{
                width: '100%', padding: '8px 12px', background: GH.canvas,
                border: `1px solid ${GH.border}`, borderRadius: 6,
                color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = GH.link}
              onBlur={e => e.target.style.borderColor = GH.border}
            />
          </div>

          {/* Visibility options */}
          <div style={{ borderTop: `1px solid ${GH.border}`, paddingTop: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 12 }}>
              Visibility
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label
                onClick={() => setFormData({ ...formData, isPrivate: false })}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                  background: !formData.isPrivate ? GH.surface : GH.canvas,
                  border: `1px solid ${!formData.isPrivate ? GH.link : GH.border}`,
                  borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <input type="radio" name="isPrivate" checked={!formData.isPrivate} onChange={() => {}} style={{ marginTop: 3, accentColor: GH.green }} />
                <Globe className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GH.text }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GH.text }}>Public</div>
                  <div style={{ fontSize: 12, color: GH.muted }}>Anyone on the internet can see this repository.</div>
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, isPrivate: true })}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                  background: formData.isPrivate ? GH.surface : GH.canvas,
                  border: `1px solid ${formData.isPrivate ? GH.link : GH.border}`,
                  borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <input type="radio" name="isPrivate" checked={formData.isPrivate} onChange={() => {}} style={{ marginTop: 3, accentColor: GH.green }} />
                <Lock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GH.text }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GH.text }}>Private</div>
                  <div style={{ fontSize: 12, color: GH.muted }}>You choose who can see and commit to this repository.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div style={{ borderTop: `1px solid ${GH.border}`, paddingTop: 20, display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500,
                padding: '6px 20px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2ea043'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = GH.green; }}
            >
              <Folder className="w-4 h-4" />
              {loading ? 'Creating repository…' : 'Create repository'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ padding: '6px 16px', background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
