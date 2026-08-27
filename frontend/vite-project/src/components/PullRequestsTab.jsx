import { useState, useEffect } from 'react';
import { GitPullRequest, CheckCircle2, MessageSquare, Plus, GitMerge, RefreshCw } from 'lucide-react';
import { prAPI } from '../api';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', green2: '#3fb950',
  purple: '#a371f7'
};

export default function PullRequestsTab({ owner, repo }) {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceBranch, setSourceBranch] = useState('feature/aws-terraform');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPRs();
  }, [owner, repo]);

  const loadPRs = async () => {
    try {
      setLoading(true);
      const res = await prAPI.getPullRequests(owner, repo);
      setPrs(res.data.pullRequests || []);
    } catch (e) {
      console.error("Failed to load pull requests:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      setCreating(true);
      const res = await prAPI.createPullRequest({
        owner,
        repoName: repo,
        title,
        description,
        sourceBranch,
        targetBranch: 'main',
        author: owner || 'devops-user'
      });
      if (res.data?.pullRequest) {
        setPrs([res.data.pullRequest, ...prs]);
      }
      setShowModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error("Failed to create PR:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleMergePR = async (id) => {
    try {
      await prAPI.mergePullRequest(id);
      setPrs(prs.map(p => p._id === id ? { ...p, status: 'merged' } : p));
    } catch (e) {
      console.error("Failed to merge PR:", e);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: GH.muted }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 12px' }} />
        Loading Pull Requests...
      </div>
    );
  }

  return (
    <div style={{ color: GH.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: GH.text }}>
            <GitPullRequest className="w-4 h-4" style={{ display: 'inline', marginRight: 6, color: GH.green2 }} />
            {prs.filter(p => p.status === 'open').length} Open Pull Requests
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: GH.green, color: '#fff', border: '1px solid rgba(240,246,252,0.1)',
            borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
          }}
        >
          <Plus className="w-4 h-4" /> New Pull Request
        </button>
      </div>

      {/* PRs List */}
      <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
        {prs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: GH.muted }}>
            <GitPullRequest className="w-10 h-10" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, margin: '0 0 6px' }}>There are no open pull requests</h3>
            <p style={{ fontSize: 13, margin: 0 }}>Create a new pull request to merge changes into the main branch.</p>
          </div>
        ) : (
          prs.map((pr, idx) => (
            <div
              key={pr._id || idx}
              style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '14px 20px', borderBottom: idx < prs.length - 1 ? `1px solid ${GH.border}` : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <GitPullRequest className="w-5 h-5" style={{ color: pr.status === 'merged' ? GH.purple : GH.green2, marginTop: 2 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <a href="#" style={{ fontSize: 15, fontWeight: 600, color: GH.text, textDecoration: 'none' }}>
                      {pr.title}
                    </a>
                    <span style={{ fontSize: 11, background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 12, padding: '1px 8px', color: GH.muted }}>
                      #{pr.number || idx + 1}
                    </span>
                    {pr.status === 'merged' && (
                      <span style={{ fontSize: 11, background: 'rgba(163,113,247,0.15)', color: GH.purple, border: `1px solid ${GH.purple}`, borderRadius: 12, padding: '1px 8px', fontWeight: 600 }}>
                        Merged
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: GH.muted, margin: '4px 0 6px' }}>
                    {pr.description || 'No description provided.'}
                  </p>

                  <div style={{ fontSize: 12, color: GH.subtle, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span>Opened by <strong>{pr.author}</strong></span>
                    <span>wants to merge <code>{pr.sourceBranch}</code> into <code>{pr.targetBranch}</code></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: GH.green2 }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checks passed
                    </span>
                  </div>
                </div>
              </div>

              {pr.status === 'open' && (
                <button
                  onClick={() => handleMergePR(pr._id)}
                  style={{
                    background: GH.surface, color: GH.text, border: `1px solid ${GH.border}`,
                    borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0
                  }}
                >
                  <GitMerge className="w-3.5 h-3.5" style={{ color: GH.purple }} /> Merge PR
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* New PR Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 8, padding: 24, width: 480 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: GH.text }}>Create New Pull Request</h3>
            <form onSubmit={handleCreatePR}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: GH.muted, marginBottom: 4 }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., feat: Add AWS Multi-stage Docker automation"
                  required
                  style={{ width: '100%', background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '8px 12px', color: GH.text, fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: GH.muted, marginBottom: 4 }}>Source Branch</label>
                <input
                  type="text"
                  value={sourceBranch}
                  onChange={e => setSourceBranch(e.target.value)}
                  style={{ width: '100%', background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '8px 12px', color: GH.text, fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: GH.muted, marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your code changes and continuous integration tests..."
                  style={{ width: '100%', background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, padding: '8px 12px', color: GH.text, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: GH.surface, border: `1px solid ${GH.border}`, color: GH.text, borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ background: GH.green, border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {creating ? 'Creating...' : 'Create Pull Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
