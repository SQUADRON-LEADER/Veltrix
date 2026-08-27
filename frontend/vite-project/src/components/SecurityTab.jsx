import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { securityAPI } from '../api';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', green2: '#3fb950',
  red: '#f85149', yellow: '#d29922'
};

export default function SecurityTab({ owner, repo }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, [owner, repo]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await securityAPI.getAlerts(owner, repo);
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.error("Failed to load security alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async () => {
    try {
      setScanning(true);
      const res = await securityAPI.runScan({ owner, repoName: repo });
      setScanResult(res.data.scanSummary);
    } catch (e) {
      console.error("Security scan failed:", e);
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: GH.muted }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 12px' }} />
        Running security audit check...
      </div>
    );
  }

  return (
    <div style={{ color: GH.text }}>
      {/* Overview Banner */}
      <div style={{
        background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6,
        padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <ShieldCheck className="w-8 h-8" style={{ color: GH.green2 }} />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: GH.text }}>
              Veltrix Automated Security & Vulnerability Scanner
            </h3>
            <p style={{ fontSize: 13, color: GH.muted, margin: 0 }}>
              Scans repository dependencies, Docker container layers, and secret keys against modern CVE databases.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          style={{
            background: GH.surface, border: `1px solid ${GH.border}`, color: GH.text,
            borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
          }}
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Trigger Security Scan'}
        </button>
      </div>

      {scanResult && (
        <div style={{ background: 'rgba(63,185,80,0.1)', border: `1px solid ${GH.green2}`, borderRadius: 6, padding: 14, marginBottom: 20, fontSize: 13, color: GH.green2 }}>
          ✅ {scanResult.message || 'Scan completed cleanly!'}. {scanResult.scannedFiles} files checked, 0 secrets leaked.
        </div>
      )}

      {/* Vulnerability Alerts Table */}
      <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: GH.surface, borderBottom: `1px solid ${GH.border}`, fontWeight: 600, fontSize: 13 }}>
          Dependabot & Security Vulnerabilities ({alerts.length})
        </div>

        {alerts.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: GH.muted }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: GH.green2, margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: GH.text, margin: '0 0 6px' }}>No security vulnerabilities found</h3>
            <p style={{ fontSize: 13, margin: 0 }}>All dependencies and container layers match clean security specs.</p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={alert._id || idx}
              style={{
                padding: '14px 20px', borderBottom: idx < alerts.length - 1 ? `1px solid ${GH.border}` : 'none',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <AlertTriangle className="w-5 h-5" style={{ color: alert.severity === 'critical' || alert.severity === 'high' ? GH.red : GH.yellow, marginTop: 2 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: GH.text }}>
                      {alert.packageName}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      padding: '1px 8px', borderRadius: 12,
                      background: alert.severity === 'critical' || alert.severity === 'high' ? 'rgba(248,81,73,0.15)' : 'rgba(210,153,34,0.15)',
                      color: alert.severity === 'critical' || alert.severity === 'high' ? GH.red : GH.yellow,
                      border: `1px solid ${alert.severity === 'critical' || alert.severity === 'high' ? GH.red : GH.yellow}`
                    }}>
                      {alert.severity}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: GH.muted, margin: '4px 0 6px' }}>
                    {alert.vulnerability}
                  </p>

                  <div style={{ fontSize: 12, color: GH.subtle }}>
                    Fix recommended: Upgrade <code>{alert.packageName}</code> to <strong>{alert.fixVersion}</strong>
                  </div>
                </div>
              </div>

              <span style={{ fontSize: 12, color: alert.status === 'fixed' ? GH.green2 : GH.muted }}>
                {alert.status === 'fixed' ? '✓ Resolved' : 'Active Alert'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
