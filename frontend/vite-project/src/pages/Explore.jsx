import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, TrendingUp, Star, GitFork, User, Folder } from 'lucide-react';
import { repoAPI, userAPI } from '../api';
import Navbar from '../components/Navbar';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636',
};

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('repositories');
  const [repos, setRepos] = useState([]);
  const [users, setUsers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery);
    else loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const response = await repoAPI.trending();
      setTrending(response.data.repos || []);
    } catch (e) {
      console.error('Failed to load trending:', e);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) { loadTrending(); return; }
    try {
      setLoading(true);
      const [reposRes, usersRes] = await Promise.allSettled([
        repoAPI.search(query),
        userAPI.searchUsers(query),
      ]);
      if (reposRes.status === 'fulfilled') setRepos(reposRes.value.data.repos || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.users || []);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
    performSearch(searchQuery);
  };

  const showResults = searchQuery.trim() !== '';

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        {/* Header & Search */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: GH.text, marginBottom: 16 }}>
            {showResults ? 'Search Results' : 'Explore Veltrix'}
          </h1>
          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 540 }}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GH.muted, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search repositories and users…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6,
                color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = GH.link}
              onBlur={e => e.target.style.borderColor = GH.border}
            />
          </form>
        </div>

        {showResults ? (
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${GH.border}`, marginBottom: 20, gap: 16 }}>
              <button
                onClick={() => setActiveTab('repositories')}
                style={{
                  padding: '8px 12px', fontSize: 14, fontWeight: activeTab === 'repositories' ? 600 : 400,
                  color: activeTab === 'repositories' ? GH.text : GH.muted,
                  borderBottom: activeTab === 'repositories' ? '2px solid #f78166' : '2px solid transparent',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                Repositories ({repos.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                style={{
                  padding: '8px 12px', fontSize: 14, fontWeight: activeTab === 'users' ? 600 : 400,
                  color: activeTab === 'users' ? GH.text : GH.muted,
                  borderBottom: activeTab === 'users' ? '2px solid #f78166' : '2px solid transparent',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                Users ({users.length})
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: 80, background: GH.canvas, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <>
                {activeTab === 'repositories' && (
                  repos.length === 0 ? (
                    <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 48, textAlign: 'center', color: GH.muted }}>
                      No repositories found for "{searchQuery}".
                    </div>
                  ) : (
                    <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
                      {repos.map((repo, i) => (
                        <div
                          key={repo._id}
                          style={{ padding: '16px 20px', borderBottom: i < repos.length - 1 ? `1px solid ${GH.border}` : 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Folder className="w-4 h-4" style={{ color: GH.muted }} />
                            <Link to={`/repos/${repo.owner?.username}/${repo.name}`} style={{ fontSize: 15, fontWeight: 600, color: GH.link, textDecoration: 'none' }}>
                              {repo.owner?.username}/{repo.name}
                            </Link>
                          </div>
                          {repo.description && (
                            <p style={{ fontSize: 13, color: GH.muted, margin: '0 0 8px 24px', lineHeight: 1.4 }}>{repo.description}</p>
                          )}
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: GH.subtle, paddingLeft: 24 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star className="w-3.5 h-3.5" /> {repo.stars || 0}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GitFork className="w-3.5 h-3.5" /> {repo.forks || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {activeTab === 'users' && (
                  users.length === 0 ? (
                    <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 48, textAlign: 'center', color: GH.muted }}>
                      No users found for "{searchQuery}".
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {users.map(u => (
                        <Link key={u._id} to={`/profile/${u.username}`} style={{ textDecoration: 'none' }}>
                          <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 20, textAlign: 'center', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#484f58'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = GH.border}
                          >
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #238636, #1f6feb)', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: GH.text, marginBottom: 4 }}>{u.username}</div>
                            {u.bio && <p style={{ fontSize: 12, color: GH.muted, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{u.bio}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#3fb950' }} />
              <h2 style={{ fontSize: 18, fontWeight: 600, color: GH.text, margin: 0 }}>Trending Repositories</h2>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: 80, background: GH.canvas, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : trending.length === 0 ? (
              <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 32, textAlign: 'center', color: GH.muted }}>
                No trending repositories right now.
              </div>
            ) : (
              <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
                {trending.map((repo, i) => (
                  <div key={repo._id} style={{ padding: '16px 20px', borderBottom: i < trending.length - 1 ? `1px solid ${GH.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GH.muted, minWidth: 20 }}>{i + 1}</span>
                      <Folder className="w-4 h-4" style={{ color: GH.muted }} />
                      <Link to={`/repos/${repo.owner?.username}/${repo.name}`} style={{ fontSize: 15, fontWeight: 600, color: GH.link, textDecoration: 'none' }}>
                        {repo.owner?.username}/{repo.name}
                      </Link>
                    </div>
                    {repo.description && (
                      <p style={{ fontSize: 13, color: GH.muted, margin: '0 0 8px 48px', lineHeight: 1.4 }}>{repo.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: GH.subtle, paddingLeft: 48 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star className="w-3.5 h-3.5" /> {repo.stars || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GitFork className="w-3.5 h-3.5" /> {repo.forks || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
