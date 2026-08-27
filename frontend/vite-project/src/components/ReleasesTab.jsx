import { useState, useEffect } from 'react';
import { Tag, Download, Package, Plus, RefreshCw } from 'lucide-react';
import { releasesAPI } from '../api';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', green2: '#3fb950'
};

export default function ReleasesTab({ owner, repo }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReleases();
  }, [owner, repo]);

  const loadReleases = async () => {
    try {
      setLoading(true);
      const res = await releasesAPI.getReleases(owner, repo);
      setReleases(res.data.releases || []);
    } catch (e) {
      console.error("Failed to load releases:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: GH.muted }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 12px' }} />
        Loading software releases...
      </div>
    );
  }

  return (
    <div style={{ color: GH.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag className="w-5 h-5" style={{ color: GH.link }} />
          Software Releases & Version Tags ({releases.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {releases.length === 0 ? (
          <div style={{ padding: 48, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, textAlign: 'center', color: GH.muted }}>
            <Package className="w-10 h-10" style={{ color: GH.subtle, margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, margin: '0 0 6px' }}>No releases published</h3>
            <p style={{ fontSize: 13, margin: 0 }}>Tag commits to create new production software releases.</p>
          </div>
        ) : (
          releases.map((rel, idx) => (
            <div
              key={rel._id || idx}
              style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, background: GH.surface, border: `1px solid ${GH.border}`, padding: '2px 10px', borderRadius: 12, color: GH.green2 }}>
                  {rel.tagName}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{rel.title}</h3>
              </div>

              <p style={{ fontSize: 13, color: GH.muted, margin: '8px 0 16px', lineHeight: 1.5 }}>
                {rel.description}
              </p>

              {/* Release Assets */}
              <div style={{ borderTop: `1px solid ${GH.border}`, paddingTop: 12 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: GH.muted, marginBottom: 8, textTransform: 'uppercase' }}>Assets</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    style={{ fontSize: 13, color: GH.link, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: GH.surface, padding: '6px 12px', borderRadius: 6, border: `1px solid ${GH.border}` }}
                  >
                    <Download className="w-4 h-4" /> Source code (zip)
                  </a>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    style={{ fontSize: 13, color: GH.link, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: GH.surface, padding: '6px 12px', borderRadius: 6, border: `1px solid ${GH.border}` }}
                  >
                    <Download className="w-4 h-4" /> Source code (tar.gz)
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
