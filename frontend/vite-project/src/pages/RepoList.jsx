import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Folder, Star, GitFork, Lock, Globe, Search, Plus, Clock } from 'lucide-react';
import { repoAPI } from '../api';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636',
};

export default function RepoList() {
  const { username } = useParams();
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isOwnProfile = user?.username === username;

  useEffect(() => { loadRepos(); }, [username]);

  const loadRepos = async () => {
    try {
      setLoading(true);
      const response = await repoAPI.list(username);
      setRepos(response.data.repos || []);
    } catch (e) {
      console.error('Failed to load repositories:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: GH.text, margin: 0 }}>
              {isOwnProfile ? 'Your repositories' : `${username}'s repositories`}
            </h1>
            <p style={{ fontSize: 14, color: GH.muted, marginTop: 4 }}>
              {repos.length} {repos.length === 1 ? 'repository' : 'repositories'}
            </p>
          </div>
          {isOwnProfile && (
            <Link to="/repos/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '5px 16px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2ea043'}
              onMouseLeave={e => e.currentTarget.style.background = GH.green}
            >
              <Plus className="w-4 h-4" /> New
            </Link>
          )}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GH.muted, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Find a repository…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 5, paddingBottom: 5, background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = GH.link}
              onBlur={e => e.target.style.borderColor = GH.border}
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 88, background: GH.canvas, borderRadius: 4, animation: 'pulse 1.5s infinite', marginBottom: 1 }} />
            ))}
          </div>
        ) : filteredRepos.length === 0 ? (
          <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 48, textAlign: 'center' }}>
            <Folder className="w-12 h-12" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, marginBottom: 8 }}>
              {searchQuery ? 'No repositories found' : 'No repositories yet'}
            </h3>
            <p style={{ fontSize: 14, color: GH.muted, marginBottom: 16 }}>
              {searchQuery ? 'Try adjusting your search query' : isOwnProfile ? 'Create your first repository to get started' : 'This user has no public repositories'}
            </p>
            {isOwnProfile && !searchQuery && (
              <Link to="/repos/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '5px 16px', borderRadius: 6 }}>
                <Plus className="w-4 h-4" /> New repository
              </Link>
            )}
          </div>
        ) : (
          <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
            {filteredRepos.map((repo, i) => (
              <div
                key={repo._id}
                style={{ padding: '16px 20px', borderBottom: i < filteredRepos.length - 1 ? `1px solid ${GH.border}` : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = GH.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Link
                        to={`/repos/${username}/${repo.name}`}
                        style={{ fontSize: 15, fontWeight: 600, color: GH.link, textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {repo.name}
                      </Link>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: GH.muted, background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 20, padding: '0 8px', lineHeight: '20px' }}>
                        {repo.isPrivate ? <><Lock className="w-3 h-3" /> Private</> : <><Globe className="w-3 h-3" /> Public</>}
                      </span>
                    </div>
                    {repo.description && (
                      <p style={{ fontSize: 13, color: GH.muted, marginBottom: 10, lineHeight: 1.4 }}>{repo.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: GH.subtle }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star className="w-3.5 h-3.5" /> {repo.stars || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GitFork className="w-3.5 h-3.5" /> {repo.forks || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock className="w-3.5 h-3.5" /> Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
