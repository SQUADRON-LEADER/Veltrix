import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Link as LinkIcon, Calendar, Users, Star, Folder, GitFork, UserPlus, UserMinus } from 'lucide-react';
import { userAPI, repoAPI } from '../api';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636',
};

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, repos: 0 });
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => { loadProfile(); }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, reposRes] = await Promise.all([
        userAPI.getProfile(username),
        repoAPI.list(username),
      ]);
      setUser(profileRes.data.user);
      setRepos(reposRes.data.repos || []);
      setFollowing(profileRes.data.user?.isFollowing || false);
      setStats({
        followers: profileRes.data.user?.followers || 0,
        following: profileRes.data.user?.following || 0,
        repos: reposRes.data.repos?.length || 0,
      });
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      if (following) {
        await userAPI.unfollowUser(username);
        setFollowing(false);
        setStats(s => ({ ...s, followers: s.followers - 1 }));
      } else {
        await userAPI.followUser(username);
        setFollowing(true);
        setStats(s => ({ ...s, followers: s.followers + 1 }));
      }
    } catch (e) {
      console.error('Failed to toggle follow:', e);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: GH.bg }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ height: 300, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 32, alignItems: 'start' }}>

          {/* ── Left Profile Sidebar ───────────────────── */}
          <div>
            {/* Avatar */}
            <div style={{
              width: 260, height: 260, borderRadius: '50%',
              background: 'linear-gradient(135deg, #238636, #1f6feb)',
              border: `1px solid ${GH.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 96, fontWeight: 700, color: '#fff', marginBottom: 16,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, color: GH.text, margin: '0 0 4px' }}>{user?.username}</h1>
            <p style={{ fontSize: 20, color: GH.muted, margin: '0 0 16px', fontWeight: 300 }}>{user?.username}</p>

            {/* Follow / Edit Button */}
            {!isOwnProfile ? (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                style={{
                  width: '100%', padding: '6px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  background: following ? GH.surface : GH.canvas,
                  color: GH.text, border: `1px solid ${GH.border}`, cursor: 'pointer',
                  marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {following ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
              </button>
            ) : (
              <Link to="/settings" style={{ display: 'block', width: '100%', marginBottom: 20, textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '6px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500, background: GH.surface, color: GH.text, border: `1px solid ${GH.border}`, cursor: 'pointer' }}>
                  Edit profile
                </button>
              </Link>
            )}

            {/* Bio & Details */}
            {user?.bio && <p style={{ fontSize: 14, color: GH.text, marginBottom: 16, lineHeight: 1.5 }}>{user.bio}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: GH.muted, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users className="w-4 h-4" />
                <span><strong style={{ color: GH.text }}>{stats.followers}</strong> followers · <strong style={{ color: GH.text }}>{stats.following}</strong> following</span>
              </div>
              {user?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin className="w-4 h-4" /> {user.location}
                </div>
              )}
              {user?.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LinkIcon className="w-4 h-4" />
                  <a href={user.website} target="_blank" rel="noreferrer" style={{ color: GH.link, textDecoration: 'none' }}>{user.website}</a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar className="w-4 h-4" /> Joined {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* ── Right Content ─────────────────────────── */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${GH.border}`, marginBottom: 24, gap: 0 }}>
              <span style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: GH.text, borderBottom: '2px solid #f78166' }}>
                Overview & Repositories ({repos.length})
              </span>
            </div>

            {/* GitHub Contribution Grid */}
            <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 20, marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 16 }}>
                182 contributions in the last year
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(26, 1fr)', gap: 3 }}>
                {[...Array(182)].map((_, i) => {
                  const level = (i % 7 === 0 || i % 11 === 0) ? (i % 4) + 1 : 0;
                  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
                  return (
                    <div
                      key={i}
                      style={{ height: 11, background: colors[level], borderRadius: 2, border: level === 0 ? `1px solid ${GH.border}` : 'none' }}
                      title={`${level * 3} contributions`}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 11, color: GH.muted, marginTop: 12 }}>
                <span>Less</span>
                {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c, idx) => (
                  <span key={idx} style={{ width: 10, height: 10, background: c, borderRadius: 2, display: 'inline-block' }} />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Repositories */}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, marginBottom: 16 }}>Popular repositories</h3>
            {repos.length === 0 ? (
              <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 32, textAlign: 'center', color: GH.muted }}>
                No public repositories yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {repos.slice(0, 6).map((repo) => (
                  <div key={repo._id} style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 16, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Folder className="w-4 h-4" style={{ color: GH.muted }} />
                        <Link to={`/repos/${username}/${repo.name}`} style={{ fontSize: 14, fontWeight: 600, color: GH.link, textDecoration: 'none' }}>
                          {repo.name}
                        </Link>
                      </div>
                      <p style={{ fontSize: 12, color: GH.muted, marginBottom: 12, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {repo.description || 'No description'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: GH.subtle }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star className="w-3.5 h-3.5" /> {repo.stars || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GitFork className="w-3.5 h-3.5" /> {repo.forks || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
