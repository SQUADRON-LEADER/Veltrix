import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Folder, Star, GitFork, Clock, TrendingUp, Code2, GitBranch, Lock } from 'lucide-react';
import { useAuth } from '../authContext';
import { repoAPI } from '../api';
import Navbar from '../components/Navbar';

const GH = {
  bg:      '#0d1117',
  canvas:  '#161b22',
  surface: '#21262d',
  border:  '#30363d',
  text:    '#e6edf3',
  muted:   '#8b949e',
  subtle:  '#6e7681',
  link:    '#58a6ff',
  green:   '#238636',
  green2:  '#3fb950',
};

function RepoCard({ repo, owner }) {
  return (
    <Link
      to={`/repos/${owner}/${repo.name}`}
      style={{ textDecoration: 'none' }}
    >
      <motion.div
        whileHover={{ borderColor: '#484f58' }}
        style={{
          background: GH.canvas,
          border: `1px solid ${GH.border}`,
          borderRadius: 6,
          padding: '16px 20px',
          transition: 'border-color 0.2s',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {repo.isPrivate
            ? <Lock className="w-4 h-4" style={{ color: GH.muted }} />
            : <Folder className="w-4 h-4" style={{ color: GH.muted }} />
          }
          <span style={{ fontSize: 14, fontWeight: 600, color: GH.link }}>{repo.name}</span>
          <span style={{
            fontSize: 11, color: GH.muted,
            background: GH.surface, border: `1px solid ${GH.border}`,
            borderRadius: 20, padding: '0 8px', lineHeight: '20px',
          }}>
            {repo.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
        {repo.description && (
          <p style={{ fontSize: 13, color: GH.muted, marginBottom: 12, lineHeight: 1.4 }}>
            {repo.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: GH.subtle }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star className="w-3.5 h-3.5" /> {repo.stars || 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <GitFork className="w-3.5 h-3.5" /> {repo.forks || 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock className="w-3.5 h-3.5" />
            Updated {new Date(repo.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reposRes, trendingRes] = await Promise.allSettled([
        repoAPI.list(user?.username),
        repoAPI.trending(),
      ]);
      if (reposRes.status === 'fulfilled') setRepos(reposRes.value.data.repos || []);
      if (trendingRes.status === 'fulfilled') setTrending(trendingRes.value.data.repos || []);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

          {/* ── Left: Main Feed ────────────────────────── */}
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: GH.text, margin: 0 }}>
                Home
              </h1>
              <Link to="/repos/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500,
                textDecoration: 'none', padding: '5px 16px', borderRadius: 6,
                border: '1px solid rgba(240,246,252,0.1)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#2ea043'}
                onMouseLeave={e => e.currentTarget.style.background = GH.green}
              >
                <Plus className="w-4 h-4" /> New repository
              </Link>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { icon: Folder,    label: 'Repositories', value: repos.length },
                { icon: Star,      label: 'Stars received', value: '0' },
                { icon: GitFork,   label: 'Forks',         value: '0' },
                { icon: GitBranch, label: 'Commits',       value: '0' },
              ].map((s, i) => (
                <div key={i} style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <s.icon className="w-4 h-4" style={{ color: GH.muted }} />
                    <span style={{ fontSize: 12, color: GH.muted }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: GH.text }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Your Repos */}
            <div style={{ marginBottom: 24, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${GH.border}` }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: GH.text, margin: 0 }}>
                  Your repositories
                </h2>
                <Link to={`/repos/${user?.username}`} style={{ fontSize: 13, color: GH.link, textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>

              {loading ? (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ height: 80, background: GH.surface, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : repos.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <Folder className="w-12 h-12" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, marginBottom: 8 }}>No repositories yet</h3>
                  <p style={{ fontSize: 14, color: GH.muted, marginBottom: 16 }}>
                    Create your first repository to get started
                  </p>
                  <Link to="/repos/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '5px 16px', borderRadius: 6 }}>
                    <Plus className="w-4 h-4" /> New repository
                  </Link>
                </div>
              ) : (
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {repos.slice(0, 6).map(repo => (
                    <RepoCard key={repo._id} repo={repo} owner={user?.username} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

            {/* Trending */}
            <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${GH.border}` }}>
                <TrendingUp className="w-4 h-4" style={{ color: GH.muted }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: GH.text, margin: 0 }}>Trending</h3>
              </div>

              {trending.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: GH.muted }}>No trending repositories right now.</p>
                </div>
              ) : (
                <div>
                  {trending.slice(0, 5).map((repo, i) => (
                    <Link
                      key={i}
                      to={`/repos/${repo.owner?.username}/${repo.name}`}
                      style={{ display: 'block', textDecoration: 'none', padding: '10px 16px', borderBottom: i < 4 ? `1px solid ${GH.border}` : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = GH.surface}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #238636, #1f6feb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: GH.link }}>
                          {repo.owner?.username}/{repo.name}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: GH.muted, margin: '0 0 6px 28px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {repo.description || 'No description'}
                      </p>
                      <div style={{ display: 'flex', gap: 12, paddingLeft: 28, fontSize: 11, color: GH.subtle }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star className="w-3 h-3" /> {repo.stars || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${GH.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: GH.text, margin: 0 }}>Quick links</h3>
              </div>
              <div>
                {[
                  { to: '/repos/new', icon: Plus,   label: 'New repository',    sub: 'Start a new project' },
                  { to: '/explore',   icon: Code2,  label: 'Explore',           sub: 'Discover repositories' },
                  { to: '/settings',  icon: Folder, label: 'Your repositories', sub: 'Manage your code' },
                ].map(({ to, icon: Icon, label, sub }, i) => (
                  <Link
                    key={i}
                    to={to}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', textDecoration: 'none', borderBottom: i < 2 ? `1px solid ${GH.border}` : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = GH.surface}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: GH.surface, border: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon className="w-4 h-4" style={{ color: GH.muted }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: GH.text }}>{label}</div>
                      <div style={{ fontSize: 12, color: GH.muted }}>{sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
