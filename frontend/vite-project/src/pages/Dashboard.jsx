import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Code2,
  FolderGit2,
  GitFork,
  GitPullRequest,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../authContext';
import { repoAPI } from '../api';
import Navbar from '../components/Navbar';
import '../components/dashboard/dashboard.css';

const getRepositories = (data) => {
  if (Array.isArray(data)) return data;
  return data?.repositories || data?.repos || [];
};

const getOwnerName = (repo, fallback) => {
  if (typeof repo.owner === 'string') return repo.owner;
  return repo.owner?.username || repo.owner?.name || fallback || 'unknown';
};

const formatDate = (date) => {
  if (!date) return 'Recently';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? 'Recently'
    : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

function RepositoryCard({ repo, username }) {
  const owner = getOwnerName(repo, username);
  const isPrivate = repo.isPrivate ?? repo.visibility === false;

  return (
    <Link className="dashboard-repo-card" to={`/repos/${owner}/${repo.name}`}>
      <div className="repo-card-heading">
        <div className="repo-card-icon">
          <Code2 size={17} />
        </div>
        <div className="repo-card-title">
          <strong>{repo.name}</strong>
          <span className={isPrivate ? 'repo-visibility private' : 'repo-visibility'}>
            {isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
        <ArrowUpRight className="repo-card-arrow" size={17} />
      </div>
      <p>{repo.description || 'No description added yet.'}</p>
      <div className="repo-card-meta">
        <span><Star size={14} /> {repo.stars || 0}</span>
        <span><GitFork size={14} /> {repo.forks || 0}</span>
        <span>Updated {formatDate(repo.updatedAt || repo.updated_at)}</span>
      </div>
    </Link>
  );
}

function TrendingItem({ repo, index }) {
  const owner = getOwnerName(repo);

  return (
    <Link className="trending-item" to={`/repos/${owner}/${repo.name}`}>
      <span className="trending-rank">{String(index + 1).padStart(2, '0')}</span>
      <span className="trending-copy">
        <strong>{owner}/{repo.name}</strong>
        <small>{repo.description || 'Community repository'}</small>
      </span>
      <Star size={14} />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      if (!user?.username) return;

      setLoading(true);
      setError('');
      try {
        const [ownedResponse, trendingResponse] = await Promise.all([
          repoAPI.list(user.username),
          repoAPI.trending(),
        ]);
        if (active) {
          setRepositories(getRepositories(ownedResponse.data));
          setTrending(getRepositories(trendingResponse.data));
        }
      } catch (requestError) {
        console.error('Failed to load dashboard repositories:', requestError);
        if (active) {
          setError(requestError.response?.data?.error || 'We could not load your repositories.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [refreshKey, user?.username]);

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return repositories;
    return repositories.filter((repo) =>
      `${repo.name} ${repo.description || ''}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query, repositories]);

  const stats = [
    { label: 'Repositories', value: repositories.length, icon: FolderGit2 },
    { label: 'Stars received', value: repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0), icon: Star },
    { label: 'Pull requests', value: '—', icon: GitPullRequest },
    { label: 'Security status', value: 'Ready', icon: ShieldCheck },
  ];

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Workspace overview</p>
            <h1>Good to see you, {user?.username || 'developer'}.</h1>
            <p className="hero-copy">Ship with confidence. Your projects, activity, and community signals are all in one place.</p>
          </div>
          <Link className="dashboard-primary-action" to="/repos/new">
            <Plus size={17} /> New repository
          </Link>
        </section>

        <section className="dashboard-stats" aria-label="Workspace statistics">
          {stats.map(({ label, value, icon: Icon }) => (
            <div className="dashboard-stat" key={label}>
              <span className="stat-icon"><Icon size={17} /></span>
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-panel repositories-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Your workspace</p>
                <h2>Repositories <span>{repositories.length}</span></h2>
              </div>
              <Link className="panel-link" to={`/repos/${user?.username}`}>View all <ArrowUpRight size={15} /></Link>
            </div>

            <div className="repository-search">
              <Search size={16} />
              <input
                aria-label="Search your repositories"
                placeholder="Search your repositories..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>/</kbd>
            </div>

            {error && (
              <div className="dashboard-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => setRefreshKey((key) => key + 1)}><RefreshCw size={14} /> Retry</button>
              </div>
            )}

            {loading ? (
              <div className="dashboard-loading"><LoaderCircle className="spin" size={24} /> Loading workspace...</div>
            ) : filteredRepositories.length > 0 ? (
              <div className="repository-list">
                {filteredRepositories.slice(0, 6).map((repo) => (
                  <RepositoryCard key={repo._id || repo.id || repo.name} repo={repo} username={user?.username} />
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <FolderGit2 size={30} />
                <h3>{query ? 'No repositories found' : 'Your workspace is empty'}</h3>
                <p>{query ? 'Try another search term.' : 'Create a repository to start building with your team.'}</p>
                {!query && <Link className="dashboard-secondary-action" to="/repos/new"><Plus size={15} /> Create repository</Link>}
              </div>
            )}
          </section>

          <aside className="dashboard-sidebar">
            <section className="dashboard-panel trending-panel">
              <div className="panel-heading compact">
                <div><p className="panel-kicker">Community pulse</p><h2><TrendingUp size={17} /> Trending now</h2></div>
                <Link className="icon-link" to="/explore" aria-label="Explore repositories"><ArrowUpRight size={16} /></Link>
              </div>
              {trending.length ? trending.slice(0, 5).map((repo, index) => (
                <TrendingItem key={repo._id || repo.id || repo.name} repo={repo} index={index} />
              )) : <p className="sidebar-empty">No trending repositories available yet.</p>}
            </section>

            <section className="dashboard-panel quick-panel">
              <p className="panel-kicker">Keep moving</p>
              <h2>Quick actions</h2>
              <Link to="/explore"><Code2 size={16} /> Explore projects <ArrowUpRight size={15} /></Link>
              <Link to="/settings"><ShieldCheck size={16} /> Review settings <ArrowUpRight size={15} /></Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
