import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { issueAPI } from '../api';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', purple: '#bc8cff',
};

export default function IssueDetail() {
  const { owner, name, number } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => { loadIssue(); }, [owner, name, number]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const [issueRes, commentsRes] = await Promise.all([
        issueAPI.get(owner, name, number),
        issueAPI.getComments(owner, name, number),
      ]);
      setIssue(issueRes.data.issue);
      setComments(commentsRes.data.comments || []);
    } catch (e) {
      console.error('Failed to load issue:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      await issueAPI.addComment(owner, name, number, newComment);
      setNewComment('');
      loadIssue();
    } catch (e) {
      console.error('Failed to add comment:', e);
    } finally {
      setCommenting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (issue.status === 'open') {
        await issueAPI.close(owner, name, number);
      } else {
        await issueAPI.reopen(owner, name, number);
      }
      loadIssue();
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: GH.bg }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ height: 180, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );

  if (!issue) return (
    <div style={{ minHeight: '100vh', background: GH.bg }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 48, textAlign: 'center' }}>
          <AlertCircle className="w-12 h-12" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: GH.text }}>Issue not found</h2>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px 48px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: GH.muted, marginBottom: 16 }}>
          <Link to={`/repos/${owner}/${name}`} style={{ color: GH.link, textDecoration: 'none' }}>{owner}/{name}</Link>
          <span>/</span>
          <Link to={`/repos/${owner}/${name}/issues`} style={{ color: GH.link, textDecoration: 'none' }}>Issues</Link>
          <span>/</span>
          <span style={{ color: GH.text }}>#{number}</span>
        </div>

        {/* Issue Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${GH.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: GH.text, margin: '0 0 12px' }}>
              {issue.title} <span style={{ color: GH.muted, fontWeight: 400 }}>#{issue.number}</span>
            </h1>
            {user?.username === owner && (
              <button
                onClick={handleToggleStatus}
                style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: issue.status === 'open' ? GH.surface : GH.green,
                  color: GH.text, border: `1px solid ${GH.border}`,
                }}
              >
                {issue.status === 'open' ? 'Close issue' : 'Reopen issue'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: GH.muted, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: issue.status === 'open' ? 'rgba(35,134,54,0.15)' : 'rgba(188,140,255,0.15)',
              border: `1px solid ${issue.status === 'open' ? 'rgba(35,134,54,0.4)' : 'rgba(188,140,255,0.4)'}`,
              color: issue.status === 'open' ? '#3fb950' : GH.purple,
              borderRadius: 20, padding: '2px 12px', fontSize: 13, fontWeight: 500,
            }}>
              {issue.status === 'open' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {issue.status === 'open' ? 'Open' : 'Closed'}
            </span>
            <span>opened by <strong style={{ color: GH.text }}>{issue.author?.username || 'user'}</strong> on {new Date(issue.createdAt).toLocaleDateString()}</span>
            <span>· {comments.length} comments</span>
          </div>
        </div>

        {/* Original Issue Description Card */}
        <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: GH.surface, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #238636, #1f6feb)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
              {issue.author?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <strong style={{ fontSize: 14, color: GH.text }}>{issue.author?.username || 'user'}</strong>
            <span style={{ fontSize: 12, color: GH.muted }}>commented on {new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{ padding: 16, fontSize: 14, color: GH.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {issue.description || <em>No description provided.</em>}
          </div>
        </div>

        {/* Comment Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {comments.map((comment) => (
            <div key={comment._id} style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', background: GH.surface, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #238636, #1f6feb)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                  {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <strong style={{ fontSize: 14, color: GH.text }}>{comment.author?.username || 'user'}</strong>
                <span style={{ fontSize: 12, color: GH.muted }}>commented on {new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ padding: 16, fontSize: 14, color: GH.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {comment.comment}
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Box */}
        <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: GH.text, margin: '0 0 12px' }}>Add a comment</h3>
          <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Leave a comment"
              rows={4}
              required
              style={{ width: '100%', padding: '8px 12px', background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={commenting || !newComment.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, padding: '5px 16px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)', cursor: commenting ? 'not-allowed' : 'pointer' }}
              >
                <Send className="w-3.5 h-3.5" />
                {commenting ? 'Commenting…' : 'Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
