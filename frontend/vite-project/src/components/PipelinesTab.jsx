import { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, Clock, Terminal, Cpu, Cloud, RefreshCw } from 'lucide-react';
import { pipelinesAPI } from '../api';

const GH = {
  bg: '#0d1117', canvas: '#161b22', surface: '#21262d',
  border: '#30363d', text: '#e6edf3', muted: '#8b949e',
  subtle: '#6e7681', link: '#58a6ff', green: '#238636', green2: '#3fb950',
  red: '#f85149', yellow: '#d29922'
};

export default function PipelinesTab({ owner, repo }) {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    loadPipelines();
  }, [owner, repo]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const res = await pipelinesAPI.getPipelines(owner, repo);
      const list = res.data.pipelines || [];
      setPipelines(list);
      if (list.length > 0) setSelectedPipeline(list[0]);
    } catch (e) {
      console.error("Failed to load pipelines:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunWorkflow = async () => {
    try {
      setTriggering(true);
      const res = await pipelinesAPI.triggerPipeline({
        owner,
        repoName: repo,
        branch: 'main',
        commitMessage: 'Manual dispatch via Veltrix CI/CD UI'
      });
      if (res.data?.pipeline) {
        setPipelines([res.data.pipeline, ...pipelines]);
        setSelectedPipeline(res.data.pipeline);
      }
    } catch (e) {
      console.error("Failed to trigger pipeline:", e);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: GH.muted }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 12px' }} />
        Loading CI/CD Workflow runs...
      </div>
    );
  }

  return (
    <div style={{ color: GH.text }}>
      {/* Action Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6,
        padding: '14px 20px', marginBottom: 20
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu className="w-5 h-5" style={{ color: GH.link }} />
            Veltrix Enterprise Actions & CI/CD Pipelines
          </h3>
          <p style={{ fontSize: 13, color: GH.muted, margin: 0 }}>
            Automated multi-stage Docker builds, unit testing, security scanning, and AWS ECS deployment.
          </p>
        </div>
        <button
          onClick={handleRunWorkflow}
          disabled={triggering}
          style={{
            background: GH.green, color: '#fff', border: '1px solid rgba(240,246,252,0.1)',
            borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
          }}
        >
          <Play className="w-4 h-4" />
          {triggering ? 'Triggering...' : 'Run Workflow'}
        </button>
      </div>

      {/* Main Grid: Pipeline Runs List & Active Run Execution Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Run History List */}
        <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: GH.surface, borderBottom: `1px solid ${GH.border}`, fontWeight: 600, fontSize: 13 }}>
            Workflow Runs ({pipelines.length})
          </div>

          {pipelines.map((run, idx) => {
            const isSelected = selectedPipeline?._id === run._id;
            return (
              <div
                key={run._id || idx}
                onClick={() => setSelectedPipeline(run)}
                style={{
                  padding: '12px 16px',
                  borderBottom: idx < pipelines.length - 1 ? `1px solid ${GH.border}` : 'none',
                  background: isSelected ? GH.surface : 'transparent',
                  cursor: 'pointer', borderLeft: isSelected ? `3px solid ${GH.link}` : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {run.status === 'success' && <CheckCircle2 className="w-4 h-4" style={{ color: GH.green2 }} />}
                  {run.status === 'failed' && <XCircle className="w-4 h-4" style={{ color: GH.red }} />}
                  {run.status === 'in_progress' && <RefreshCw className="w-4 h-4 animate-spin" style={{ color: GH.yellow }} />}
                  <span style={{ fontSize: 13, fontWeight: 600, color: GH.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {run.commitMessage}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: GH.muted, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{run.event} • {run.branch}</span>
                  <span>{run.durationSeconds}s</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Workflow Details & Build Logs */}
        {selectedPipeline ? (
          <div style={{ background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, padding: 20 }}>
            <div style={{ borderBottom: `1px solid ${GH.border}`, paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                  padding: '2px 10px', borderRadius: 12,
                  background: selectedPipeline.status === 'success' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
                  color: selectedPipeline.status === 'success' ? GH.green2 : GH.red,
                  border: `1px solid ${selectedPipeline.status === 'success' ? GH.green2 : GH.red}`
                }}>
                  {selectedPipeline.status}
                </span>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                  {selectedPipeline.commitMessage}
                </h2>
              </div>
              <div style={{ fontSize: 12, color: GH.muted, display: 'flex', gap: 16 }}>
                <span>Commit: <code>{selectedPipeline.commitHash}</code></span>
                <span>Trigger: <strong>{selectedPipeline.event}</strong></span>
                <span>Duration: <strong>{selectedPipeline.durationSeconds}s</strong></span>
              </div>
            </div>

            {/* Workflow Steps Breakdown */}
            <h4 style={{ fontSize: 13, fontWeight: 600, color: GH.text, marginBottom: 10 }}>Workflow Execution Steps</h4>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {(selectedPipeline.steps || []).map((step, sIdx) => (
                <div key={sIdx} style={{
                  background: GH.surface, border: `1px solid ${GH.border}`,
                  borderRadius: 6, padding: '10px 14px', flex: 1, minWidth: 150
                }}>
                  <div style={{ fontSize: 12, color: GH.muted, marginBottom: 4 }}>Step {sIdx + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GH.text }}>{step.name}</div>
                  <div style={{ fontSize: 11, color: GH.green2, marginTop: 4 }}>{step.duration}</div>
                </div>
              ))}
            </div>

            {/* Build Log Terminal View */}
            <div style={{ background: '#040d14', border: `1px solid ${GH.border}`, borderRadius: 6, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: GH.muted, marginBottom: 10, borderBottom: `1px solid ${GH.border}`, paddingBottom: 6 }}>
                <Terminal className="w-4 h-4" /> Pipeline Console Logs
              </div>
              <pre style={{ margin: 0, fontSize: 12, color: '#39d353', fontFamily: 'monospace', lineHeight: 1.6, overflowX: 'auto' }}>
                {(selectedPipeline.logs || []).join('\n')}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ padding: 40, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 6, textAlign: 'center', color: GH.muted }}>
            Select a workflow run to view console build logs.
          </div>
        )}

      </div>
    </div>
  );
}
