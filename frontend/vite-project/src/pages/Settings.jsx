import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { userAPI } from '../api';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';
import Modal from '../components/common/Modal';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', red: '#f85149',
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, loadUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await userAPI.updateProfile(profileData);
      await loadUser();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete account' });
      setShowDeleteModal(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 12px',
    background: GH.bg,
    border: `1px solid ${GH.border}`,
    borderRadius: 6,
    color: GH.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: GH.bg, color: GH.text }}>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 24px 48px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: GH.text, marginBottom: 24 }}>Account Settings</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 4 }}>
            {[
              { id: 'profile', label: 'Public profile' },
              { id: 'password', label: 'Password' },
              { id: 'danger', label: 'Danger zone' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', borderRadius: 6, fontSize: 14,
                  fontWeight: activeTab === t.id ? 600 : 400,
                  background: activeTab === t.id ? GH.surface : 'transparent',
                  color: t.id === 'danger' && activeTab === t.id ? GH.red : GH.text,
                  border: 'none', cursor: 'pointer',
                  borderLeft: activeTab === t.id ? '2px solid #f78166' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Main Area */}
          <div>
            {message.text && (
              <div style={{
                padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16,
                background: message.type === 'success' ? 'rgba(35,134,54,0.15)' : 'rgba(248,81,73,0.15)',
                border: `1px solid ${message.type === 'success' ? 'rgba(35,134,54,0.4)' : 'rgba(248,81,73,0.4)'}`,
                color: message.type === 'success' ? '#3fb950' : GH.red,
              }}>
                {message.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: GH.text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${GH.border}` }}>
                  Public Profile
                </h2>
                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Username</label>
                    <input type="text" value={profileData.username} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Email</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Bio</label>
                    <textarea value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Location</label>
                    <input type="text" value={profileData.location} onChange={e => setProfileData({ ...profileData, location: e.target.value })} placeholder="City, Country" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Website</label>
                    <input type="url" value={profileData.website} onChange={e => setProfileData({ ...profileData, website: e.target.value })} placeholder="https://example.com" style={inputStyle} />
                  </div>
                  <div>
                    <button type="submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)', cursor: 'pointer' }}>
                      <Save className="w-4 h-4" /> Save profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: GH.text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${GH.border}` }}>
                  Change Password
                </h2>
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Old password</label>
                    <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>New password</label>
                    <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: GH.text, marginBottom: 6 }}>Confirm new password</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <button type="submit" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GH.green, color: '#fff', fontSize: 14, fontWeight: 500, padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)', cursor: 'pointer' }}>
                      <Save className="w-4 h-4" /> Update password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'danger' && (
              <div style={{ background: GH.canvas, border: `1px solid rgba(248,81,73,0.4)`, borderRadius: 6, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: GH.red, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${GH.border}` }}>
                  Delete Account
                </h2>
                <p style={{ fontSize: 14, color: GH.muted, marginBottom: 16, lineHeight: 1.5 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#da3633', color: '#fff', fontSize: 14, fontWeight: 500, padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(240,246,252,0.1)', cursor: 'pointer' }}
                >
                  <Trash2 className="w-4 h-4" /> Delete account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: GH.text, margin: 0 }}>
            Are you sure you want to delete your account? All repositories and data will be permanently erased.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setShowDeleteModal(false)} style={{ padding: '6px 16px', background: GH.surface, border: `1px solid ${GH.border}`, borderRadius: 6, color: GH.text, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleDeleteAccount} style={{ padding: '6px 16px', background: '#da3633', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Delete my account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
