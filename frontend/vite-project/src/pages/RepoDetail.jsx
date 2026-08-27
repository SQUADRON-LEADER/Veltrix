import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, GitFork, Eye, Code2, AlertCircle, Settings, Folder, File,
  Clock, Lock, Play, GitPullRequest, ShieldCheck, Tag, Terminal
} from 'lucide-react';
import { repoAPI } from '../api';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import PipelinesTab from '../components/PipelinesTab';
import PullRequestsTab from '../components/PullRequestsTab';
import SecurityTab from '../components/SecurityTab';
import ReleasesTab from '../components/ReleasesTab';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', green2: '#3fb950',
};

export default function RepoDetail() {
  const { owner, name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('code');
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starring, setStarring] = useState(false);
  const isOwner = user?.username === owner;

  useEffect(() => { loadRepo(); }, [owner, name]);

  const loadRepo = async () => {
    try {
      setLoading(true);
      const [repoRes, filesRes, commitsRes] = await Promise.allSettled([
        repoAPI.get(owner, name),
        repoAPI.getFiles(owner, name),
        repoAPI.getCommits(owner, name),
      ]);
      if (repoRes.status === 'fulfilled') {
        const rData = repoRes.value.data;
        const fetchedRepo = rData.repo || rData.repository || (Array.isArray(rData) ? rData[0] : rData);
        setRepo(fetchedRepo);
      }
      if (filesRes.status === 'fulfilled') setFiles(filesRes.value.data.files || []);
      if (commitsRes.status === 'fulfilled') setCommits(commitsRes.value.data.commits || []);
    } catch (e) {
      console.error('Failed to load repository:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async () => {
    try {
      setStarring(true);
      if (repo?.starred) {
        await repoAPI.unstar(owner, name);
        setRepo({ ...repo, starred: false, stars: (repo.stars || 1) - 1 });
      } else {
        await repoAPI.star(owner, name);
        setRepo({ ...repo, starred: true, stars: (repo.stars || 0) + 1 });
      }
    } catch (e) {
      console.error('Failed to star repository:', e);
    } finally {
      setStarring(false);
    }
  };

  const ActionBtn = ({ icon: Icon, label, onClick, filled }) => (
    <button
      onClick={onClick}
      disabled={starring}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: GH.surface, border: `1px solid ${GH.border}`,
        borderRadius: 6, padding: '5px 14px',
        color: GH.text, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#30363d'}
      onMouseLeave={e => e.currentTarget.style.background = GH.surface}
    >
      <Icon className="w-4 h-4" style={{ fill: filled ? GH.text : 'none', stroke: GH.text }} />
      {label}
    </button>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: GH.bg }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ height: 200, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );

  if (!repo) return (
    <div style={{ minHeight: '100vh', background: GH.bg }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 48, textAlign: 'center' }}>
          <AlertCircle className="w-12 h-12" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: GH.text, marginBottom: 8 }}>Repository not found</h2>
          <p style={{ fontSize: 14, color: GH.muted, marginBottom: 20 }}>
            This repository doesn't exist or you don't have permission to view it.
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ background: GH.green, color: '#fff', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, padding: '5px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'issues', label: 'Issues', icon: AlertCircle, count: repo.openIssuesCount || 0 },
    { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'actions', label: 'Actions (CI/CD)', icon: Play },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'releases', label: 'Releases', icon: Tag },
  ];

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>

        {/* ── Repo Header ────────────────────────────── */}
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${GH.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {repo.isPrivate ? <Lock className="w-4 h-4" style={{ color: GH.muted }} /> : <Folder className="w-4 h-4" style={{ color: GH.muted }} />}
            <Link to={`/repos/${owner}`} style={{ fontSize: 20, fontWeight: 600, color: GH.link, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >{owner}</Link>
            <span style={{ fontSize: 20, color: GH.muted }}>/</span>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: GH.link, margin: 0 }}>{name}</h1>
            <span style={{
              fontSize: 11, color: GH.muted,
              background: GH.surface, border: `1px solid ${GH.border}`,
              borderRadius: 20, padding: '1px 10px',
            }}>
              {repo.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          {repo.description && (
            <p style={{ fontSize: 14, color: GH.muted, marginBottom: 12 }}>{repo.description}</p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionBtn icon={Eye} label={`Watch ${repo.watchers || 0}`} />
            <ActionBtn icon={GitFork} label={`Fork ${repo.forks || 0}`} />
            <ActionBtn icon={Star} label={`${repo.starred ? 'Starred' : 'Star'} ${repo.stars || 0}`} onClick={handleStar} filled={repo.starred} />
            {isOwner && (
              <Link to={`/repos/${owner}/${name}/settings`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '5px 14px', color: GH.text, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                <Settings className="w-4 h-4" /> Settings
              </Link>
            )}
          </div>
        </div>

        {/* ── Tab Bar ───────────────────────────────── */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${GH.border}`, marginBottom: 24, gap: 4, overflowX: 'auto' }}>
          {tabs.map(({ id, label, icon: Icon, count }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (id === 'issues') {
                    navigate(`/repos/${owner}/${name}/issues`);
                  } else {
                    setActiveTab(id);
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', fontSize: 14, fontWeight: active ? 600 : 400,
                  color: active ? GH.text : GH.muted,
                  borderBottom: active ? '2px solid #f78166' : '2px solid transparent',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
                {count !== undefined && count > 0 && (
                  <span style={{ fontSize: 11, background: GH.surface, padding: '1px 7px', borderRadius: 10, color: GH.muted }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Views ────────────────────────────── */}
        {activeTab === 'code' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

            {/* Files Table */}
            <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: GH.surface, borderBottom: `1px solid ${GH.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 13, fontWeight: 500, color: GH.text }}>
                    main
                  </span>
                  <span style={{ fontSize: 12, color: GH.muted }}>
                    {commits.length} commit{commits.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Clock className="w-4 h-4" style={{ color: GH.subtle }} />
              </div>

              {files.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <Code2 className="w-10 h-10" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, color: GH.muted }}>
                    No files yet. Push your first commit to get started.
                  </p>
                </div>
              ) : (
                <div>
                  {files.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 16px',
                        borderBottom: i < files.length - 1 ? `1px solid ${GH.border}` : 'none',
                        transition: 'background 0.1s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = GH.surface}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {file.type === 'folder'
                        ? <Folder className="w-4 h-4" style={{ color: '#58a6ff', flexShrink: 0 }} />
                        : <File className="w-4 h-4" style={{ color: GH.muted, flexShrink: 0 }} />
                      }
                      <span style={{ flex: 1, fontSize: 14, color: file.type === 'folder' ? GH.link : GH.text }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: 12, color: GH.subtle }}>–</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* About */}
              <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '16px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${GH.border}` }}>About</h3>
                <p style={{ fontSize: 13, color: GH.muted, marginBottom: 14, lineHeight: 1.5 }}>
                  {repo.description || 'No description, website, or topics provided.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: GH.muted }}>
                    <Star className="w-4 h-4" /> <strong style={{ color: GH.text }}>{repo.stars || 0}</strong> stars
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: GH.muted }}>
                    <Eye className="w-4 h-4" /> <strong style={{ color: GH.text }}>{repo.watchers || 0}</strong> watching
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: GH.muted }}>
                    <GitFork className="w-4 h-4" /> <strong style={{ color: GH.text }}>{repo.forks || 0}</strong> forks
                  </span>
                </div>
              </div>

              {/* Recent Commits */}
              {commits.length > 0 && (
                <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: `1px solid ${GH.border}` }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: GH.text, margin: 0 }}>Commits</h3>
                  </div>
                  {commits.slice(0, 5).map((c, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: i < Math.min(4, commits.length - 1) ? `1px solid ${GH.border}` : 'none' }}>
                      <p style={{ fontSize: 13, color: GH.text, marginBottom: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                        {c.message}
                      </p>
                      <span style={{ fontSize: 11, color: GH.subtle }}>
                        {new Date(c.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pulls' && <PullRequestsTab owner={owner} repo={name} />}
        {activeTab === 'actions' && <PipelinesTab owner={owner} repo={name} />}
        {activeTab === 'security' && <SecurityTab owner={owner} repo={name} />}
        {activeTab === 'releases' && <ReleasesTab owner={owner} repo={name} />}

      </div>
    </div>
  );
}
