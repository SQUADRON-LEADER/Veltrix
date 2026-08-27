import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, Plus, Search, CheckCircle2, Clock } from 'lucide-react';
import { issueAPI } from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/common/Modal';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', purple: '#bc8cff',
};

export default function IssueList() {
  const { owner, name } = useParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadIssues(); }, [owner, name]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.list(owner, name);
      setIssues(response.data.issues || []);
    } catch (e) {
      console.error('Failed to load issues:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssue.title.trim()) return;
    setCreating(true);
    try {
      await issueAPI.create(owner, name, newIssue);
      setShowNewIssue(false);
      setNewIssue({ title: '', description: '' });
      loadIssues();
    } catch (e) {
      console.error('Failed to create issue:', e);
    } finally {
      setCreating(false);
    }
  };

  const filteredIssues = issues
    .filter(i => filter === 'all' ? true : i.status === filter)
    .filter(i =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const openCount = issues.filter(i => i.status === 'open').length;
  const closedCount = issues.filter(i => i.status === 'closed').length;

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: GH.muted, marginBottom: 16 }}>
          <Link to={`/repos/${owner}/${name}`} style={{ color: GH.link, textDecoration: 'none' }}>{owner}/{name}</Link>
          <span>/</span>
          <span style={{ color: GH.text, fontWeight: 600 }}>Issues</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: GH.text, margin: 0 }}>Issues</h1>
          <button
            onClick={() => setShowNewIssue(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, padding: '5px 16px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)', cursor: 'pointer' }}
          >
            <Plus className="w-4 h-4" /> New issue
          </button>
        </div>

        {/* Main Panel */}
        <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
          {/* Filter Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: GH.surface, borderBottom: `1px solid ${GH.border}`, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => setFilter('open')}
                style={{ background: 'transparent', border: 'none', color: filter === 'open' ? GH.text : GH.muted, fontWeight: filter === 'open' ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
              >
                <AlertCircle className="w-4 h-4" style={{ color: '#3fb950' }} />
                {openCount} Open
              </button>
              <button
                onClick={() => setFilter('closed')}
                style={{ background: 'transparent', border: 'none', color: filter === 'closed' ? GH.text : GH.muted, fontWeight: filter === 'closed' ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: GH.purple }} />
                {closedCount} Closed
              </button>
              <button
                onClick={() => setFilter('all')}
                style={{ background: 'transparent', border: 'none', color: filter === 'all' ? GH.text : GH.muted, fontWeight: filter === 'all' ? 600 : 400, cursor: 'pointer', fontSize: 14 }}
              >
                All ({issues.length})
              </button>
            </div>

            <div style={{ position: 'relative', width: 260 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GH.muted }} />
              <input
                type="text"
                placeholder="Search all issues…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 4, paddingBottom: 4, background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div style={{ padding: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 60, background: GH.surface, borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : filteredIssues.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <AlertCircle className="w-12 h-12" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, marginBottom: 8 }}>
                {searchQuery ? 'No issues matched your search.' : `No ${filter} issues`}
              </h3>
              <p style={{ fontSize: 14, color: GH.muted }}>
                {searchQuery ? 'Try searching for something else.' : 'Create an issue to start tracking work.'}
              </p>
            </div>
          ) : (
            <div>
              {filteredIssues.map((issue, i) => (
                <div
                  key={issue._id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: i < filteredIssues.length - 1 ? `1px solid ${GH.border}` : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = GH.surface}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ marginTop: 2 }}>
                    {issue.status === 'open' ? (
                      <AlertCircle className="w-4 h-4" style={{ color: '#3fb950' }} />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" style={{ color: GH.purple }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Link
                        to={`/repos/${owner}/${name}/issues/${issue.number}`}
                        style={{ fontSize: 15, fontWeight: 600, color: GH.text, textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = GH.link}
                        onMouseLeave={e => e.currentTarget.style.color = GH.text}
                      >
                        {issue.title}
                      </Link>
                      {issue.labels?.map((l, idx) => (
                        <span key={idx} style={{ fontSize: 11, background: 'rgba(56,139,253,0.15)', border: '1px solid rgba(56,139,253,0.3)', color: '#58a6ff', borderRadius: 20, padding: '0 8px' }}>
                          {l}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: GH.muted, marginTop: 4 }}>
                      #{issue.number} opened on {new Date(issue.createdAt).toLocaleDateString()} by {issue.author?.username || 'user'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showNewIssue} onClose={() => setShowNewIssue(false)} title="New Issue" size="lg">
        <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Title</label>
            <input
              type="text"
              placeholder="Title"
              value={newIssue.title}
              onChange={e => setNewIssue({ ...newIssue, title: e.target.value })}
              required
              style={{ width: '100%', padding: '6px 12px', background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Description</label>
            <textarea
              placeholder="Leave a comment"
              value={newIssue.description}
              onChange={e => setNewIssue({ ...newIssue, description: e.target.value })}
              rows={6}
              style={{ width: '100%', padding: '8px 12px', background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => setShowNewIssue(false)} style={{ padding: '5px 16px', background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={creating} style={{ padding: '5px 16px', background: GH.green, border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              {creating ? 'Submitting…' : 'Submit new issue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
