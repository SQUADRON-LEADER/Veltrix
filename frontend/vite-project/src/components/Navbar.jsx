import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Plus, Menu, X, 
  User, Settings, LogOut,
  Star, Folder, GitBranch
} from 'lucide-react';
import { useAuth } from '../authContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  if (!isAuthenticated) return null;

  const initials = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <nav
      style={{
        background: '#161b22',
        borderBottom: '1px solid #30363d',
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto px-4" style={{ maxWidth: '1280px' }}>
        <div className="flex items-center gap-4 h-14">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 shrink-0"
            style={{ color: '#e6edf3', textDecoration: 'none' }}
          >
            <img src="/log.png" alt="Veltrix Logo" style={{ height: 26, width: 'auto', borderRadius: 4, objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Veltrix
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xs">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: '#8b949e', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search or jump to…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 4,
                  paddingBottom: 4,
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#e6edf3',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#58a6ff'}
                onBlur={e => e.target.style.borderColor = '#30363d'}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 11,
                  color: '#8b949e',
                  background: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: 4,
                  padding: '0 4px',
                  lineHeight: '18px',
                  pointerEvents: 'none',
                }}
              >/</span>
            </div>
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              style={{
                color: '#e6edf3',
                fontSize: 14,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Dashboard
            </Link>
            <Link
              to="/explore"
              style={{
                color: '#e6edf3',
                fontSize: 14,
                fontWeight: 500,
                padding: '4px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Explore
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* New Repo */}
            <Link
              to="/repos/new"
              className="hidden md:flex items-center gap-1 btn btn-secondary"
              style={{ padding: '4px 12px', fontSize: 14 }}
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </Link>

            {/* Notifications */}
            <button
              style={{
                position: 'relative',
                padding: 8,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                color: '#e6edf3',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bell className="w-4 h-4" />
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  background: '#238636',
                  borderRadius: '50%',
                  border: '1px solid #161b22',
                }}
              />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #238636, #1f6feb)',
                  border: '2px solid #30363d',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#8b949e'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
              >
                {initials}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: 220,
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: 8,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        zIndex: 50,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #21262d' }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#e6edf3', margin: 0 }}>
                          {user?.username}
                        </p>
                        <p style={{ fontSize: 12, color: '#8b949e', margin: 0 }}>
                          {user?.email}
                        </p>
                      </div>

                      <div style={{ padding: '4px 0' }}>
                        {[
                          { to: `/profile/${user?.username}`, icon: User, label: 'Your Profile' },
                          { to: `/repos/${user?.username}`, icon: Folder, label: 'Your Repositories' },
                          { to: '/settings', icon: Settings, label: 'Settings' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '6px 16px',
                              color: '#e6edf3',
                              fontSize: 14,
                              textDecoration: 'none',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Icon className="w-4 h-4" style={{ color: '#8b949e' }} />
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid #21262d', padding: '4px 0' }}>
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '6px 16px',
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#f85149',
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'background 0.1s',
                            textAlign: 'left',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                color: '#e6edf3',
                cursor: 'pointer',
              }}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ borderTop: '1px solid #21262d' }}
              className="md:hidden py-3"
            >
              <form onSubmit={handleSearch} className="mb-3 px-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b949e' }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: 32,
                      paddingRight: 12,
                      paddingTop: 5,
                      paddingBottom: 5,
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: 6,
                      color: '#e6edf3',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </form>
              <div>
                {[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/explore', label: 'Explore' },
                  { to: '/repos/new', label: 'New Repository' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      color: '#e6edf3',
                      fontSize: 14,
                      textDecoration: 'none',
                      borderRadius: 6,
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
