import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Code2, 
  GitBranch, 
  Users, 
  Zap, 
  GitCommit, 
  Lock, 
  Terminal, 
  CheckCircle2, 
  Check, 
  GitPullRequest,
  FileCode,
  ShieldCheck,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { 
    icon: Code2, 
    title: 'High-Performance Git Core', 
    desc: 'Powered by distributed commit storage delivering sub-5ms push latencies worldwide.' 
  },
  { 
    icon: GitBranch, 
    title: 'Advanced Branching & Rebase', 
    desc: 'Instant branch creation, zero-downtime merges, and visual conflict resolution tools.' 
  },
  { 
    icon: Users, 
    title: 'Real-Time Team Collaboration', 
    desc: 'Work together seamlessly on pull requests, code reviews, and project issue boards.' 
  },
  { 
    icon: ShieldCheck, 
    title: 'Zero-Trust Security & GPG', 
    desc: 'Automated secret scanning, cryptographic GPG signatures, and enterprise RBAC policies.' 
  },
  { 
    icon: Terminal, 
    title: 'Veltrix CLI Client', 
    desc: 'Control your repositories, pull requests, and issues directly from your local terminal.' 
  },
  { 
    icon: Zap, 
    title: 'Automated CI/CD Workflows', 
    desc: 'Trigger build pipelines, run automated test suites, and deploy on every git push.' 
  },
  { 
    icon: GitPullRequest, 
    title: 'Smart Pull Request Reviews', 
    desc: 'Inline diff commenting, requested reviewer assignments, and branch protection rules.' 
  },
  { 
    icon: Lock, 
    title: 'Private & Encrypted Repos', 
    desc: 'Unlimited private repositories backed by end-to-end encrypted storage arrays.' 
  },
];

const STATS = [
  { icon: Users,     value: '150K+', label: 'Active Hackers' },
  { icon: Code2,     value: '850K+', label: 'Repositories Hosted' },
  { icon: GitCommit, value: '12M+',  label: 'Commits Pushed' },
  { icon: Zap,       value: '99.99%',label: 'Uptime SLA' }
];

const COMPARISON_ROWS = [
  { feature: 'Lightning Fast Git Sync (<5ms)', veltrix: true, legacy: false },
  { feature: 'Native Hacker CLI Integration', veltrix: true, legacy: false },
  { feature: 'Automated Secret & Credential Scanner', veltrix: true, legacy: true },
  { feature: 'Unlimited Private Repositories', veltrix: true, legacy: true },
  { feature: 'Visual Merge Conflict Resolver', veltrix: true, legacy: false },
  { feature: 'Zero-Bloat Minimalist Hacker UI', veltrix: true, legacy: false },
];

export default function Landing() {
  const [activeTab, setActiveTab] = useState('cli');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Initialize & Remote Link',
      cmd: 'veltrix init my-project --public',
      desc: 'Create a repository in seconds directly from your local terminal with one command.'
    },
    {
      step: '02',
      title: 'Branch & Push Changes',
      cmd: 'git checkout -b feature/auth && git push veltrix feature/auth',
      desc: 'Instant delta compression means your pushes finish in milliseconds.'
    },
    {
      step: '03',
      title: 'Open Pull Request & Review',
      cmd: 'veltrix pr create --title "Add OAuth authentication"',
      desc: 'Collaborate with line-by-line diff commentary and automated check runs.'
    },
    {
      step: '04',
      title: 'Merge & Continuous Deploy',
      cmd: 'veltrix pr merge #42 --squash --delete-branch',
      desc: 'Seamlessly merge to main and trigger continuous deployment pipelines automatically.'
    }
  ];

  return (
    <div style={{ background: '#010409', color: '#c9d1d9', minHeight: '100vh', fontFamily: 'Inter, -apple-system, monospace, sans-serif' }}>
      
      {/* ── Background Hacker Grid Mesh Overlay ─────────────────── */}
      <div 
        className="hacker-grid-pattern" 
        style={{ position: 'fixed', inset: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 0 }} 
      />

      {/* ── Top Header Navigation ──────────────────────────────── */}
      <header style={{ background: '#0d1117', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0f6fc' }}>
              <img src="/log.png" alt="Veltrix Logo" style={{ height: 32, width: 'auto', borderRadius: 6, objectFit: 'contain' }} />
              <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'SFMono-Regular, Consolas, monospace' }}>
                VELTRIX<span style={{ color: '#00ff66' }}>.IO</span>
              </span>
            </Link>

            {/* Nav Items */}
            <nav style={{ display: 'flex', gap: 20 }}>
              {['Features', 'Terminal', 'Architecture', 'Comparison', 'Community'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  style={{ color: '#8b949e', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#3fb950'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link 
              to="/login" 
              style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '6px 14px', borderRadius: 6, border: '1px solid #30363d', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b949e'; e.currentTarget.style.background = '#161b22'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = 'transparent'; }}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              style={{ 
                background: '#238636', 
                color: '#ffffff', 
                fontSize: 13, 
                fontWeight: 600, 
                textDecoration: 'none', 
                padding: '7px 18px', 
                borderRadius: 6, 
                border: '1px solid rgba(240,246,252,0.1)', 
                boxShadow: '0 0 15px rgba(35, 134, 54, 0.3)',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2ea043'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 102, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#238636'; e.currentTarget.style.boxShadow = '0 0 15px rgba(35, 134, 54, 0.3)'; }}
            >
              Sign Up <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 60, zIndex: 1 }}>
        
        {/* Glow ambient circle */}
        <div style={{ 
          position: 'absolute', 
          top: -100, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: 700, 
          height: 350, 
          background: 'radial-gradient(ellipse, rgba(35,134,54,0.15) 0%, rgba(0,255,102,0.05) 40%, transparent 70%)', 
          pointerEvents: 'none' 
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 10, 
              background: '#0d1117', 
              border: '1px solid #30363d', 
              borderRadius: 30, 
              padding: '6px 16px', 
              marginBottom: 32, 
              fontSize: 13, 
              color: '#8b949e',
              fontFamily: 'SFMono-Regular, Consolas, monospace'
            }}
          >
            <span style={{ width: 8, height: 8, background: '#00ff66', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #00ff66' }} />
            <span style={{ color: '#f0f6fc', fontWeight: 600 }}>Veltrix Engine v2.4</span>
            <span style={{ color: '#30363d' }}>|</span>
            <span style={{ color: '#3fb950' }}>GitHub-Compatible CLI Core</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ 
              fontSize: 'clamp(42px, 6vw, 76px)', 
              fontWeight: 900, 
              lineHeight: 1.1, 
              letterSpacing: '-0.04em', 
              marginBottom: 24, 
              color: '#f0f6fc' 
            }}
          >
            Build software{' '}
            <span style={{ 
              color: '#00ff66', 
              textShadow: '0 0 30px rgba(0,255,102,0.3)',
              background: 'linear-gradient(135deg, #00ff66 0%, #3fb950 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              better, faster,
            </span>
            <br />
            together.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 20, color: '#8b949e', maxWidth: 720, margin: '0 auto 40px', lineHeight: 1.6 }}
          >
            The ultra-fast, hacker-first Git platform. Manage repositories, review pull requests, 
            track issues, and execute CI/CD pipelines — all backed by a high-throughput green engine.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 56 }}
          >
            <Link 
              to="/signup" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 10, 
                background: '#238636', 
                color: '#ffffff', 
                fontSize: 16, 
                fontWeight: 600, 
                textDecoration: 'none', 
                padding: '12px 28px', 
                borderRadius: 6, 
                border: '1px solid rgba(240,246,252,0.1)', 
                boxShadow: '0 0 25px rgba(35, 134, 54, 0.4)',
                transition: 'all 0.2s' 
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2ea043'; e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 255, 102, 0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#238636'; e.currentTarget.style.boxShadow = '0 0 25px rgba(35, 134, 54, 0.4)'; }}
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a 
              href="#sandbox" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                background: '#161b22', 
                color: '#c9d1d9', 
                fontSize: 16, 
                fontWeight: 500, 
                textDecoration: 'none', 
                padding: '12px 26px', 
                borderRadius: 6, 
                border: '1px solid #30363d',
                fontFamily: 'SFMono-Regular, Consolas, monospace',
                transition: 'all 0.2s' 
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b949e'; e.currentTarget.style.color = '#00ff66'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#c9d1d9'; }}
            >
              <Terminal className="w-4 h-4" /> $ veltrix demo
            </a>
          </motion.div>

          {/* Stats Header Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{ 
              background: '#0d1117', 
              border: '1px solid #21262d', 
              borderRadius: 12, 
              padding: '20px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20
            }}
          >
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid #21262d' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                  <s.icon className="w-4 h-4" style={{ color: '#00ff66' }} />
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.02em' }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 13, color: '#8b949e', fontFamily: 'SFMono-Regular, Consolas, monospace' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Interactive Terminal / Code Sandbox Section ────────── */}
      <section id="sandbox" style={{ padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ color: '#00ff66', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>
              // INTERACTIVE DEVELOPER CONSOLE
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f0f6fc', marginTop: 8 }}>
              Experience the Veltrix Hacker Engine
            </h2>
          </div>

          {/* Sandbox Terminal Window */}
          <div className="hacker-terminal" style={{ borderRadius: 12, overflow: 'hidden' }}>
            
            {/* Header / Tab Navigation */}
            <div style={{ background: '#161b22', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 44 }}>
              
              {/* Window Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#27c93f' }} />
              </div>

              {/* Console Tabs */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { id: 'cli', label: '$ veltrix cli', icon: Terminal },
                  { id: 'diff', label: 'git diff', icon: FileCode },
                  { id: 'pr', label: 'PR #108 Review', icon: GitPullRequest },
                  { id: 'ci', label: 'CI Pipeline', icon: Server }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      background: activeTab === t.id ? '#0d1117' : 'transparent',
                      color: activeTab === t.id ? '#00ff66' : '#8b949e',
                      border: 'none',
                      borderTop: activeTab === t.id ? '2px solid #00ff66' : '2px solid transparent',
                      padding: '8px 14px',
                      fontSize: 12,
                      fontFamily: 'SFMono-Regular, Consolas, monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s'
                    }}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 11, color: '#484f58', fontFamily: 'monospace' }}>
                bash - 80x24
              </div>
            </div>

            {/* Terminal Body Content */}
            <div style={{ background: '#010409', padding: '24px 28px', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, lineHeight: 1.8, minHeight: 280 }}>
              
              {activeTab === 'cli' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div><span style={{ color: '#00ff66' }}>$ </span><span style={{ color: '#f0f6fc' }}>veltrix repo create --name core-engine --public</span></div>
                  <div style={{ color: '#8b949e', paddingLeft: 16 }}>✓ Initialized empty Git repository on veltrix.io/org/core-engine</div>
                  
                  <div style={{ marginTop: 12 }}><span style={{ color: '#00ff66' }}>$ </span><span style={{ color: '#f0f6fc' }}>git push veltrix main</span></div>
                  <div style={{ color: '#8b949e', paddingLeft: 16 }}>Enumerating objects: 42, done.</div>
                  <div style={{ color: '#8b949e', paddingLeft: 16 }}>Writing objects: 100% (42/42), 12.4 KiB | 12.40 MiB/s, done.</div>
                  <div style={{ color: '#3fb950', paddingLeft: 16 }}>✓ Branch 'main' set up to track remote branch 'main' from 'veltrix'.</div>

                  <div style={{ marginTop: 12 }}><span style={{ color: '#00ff66' }}>$ </span><span style={{ color: '#f0f6fc' }}>veltrix status</span></div>
                  <div style={{ color: '#8b949e', paddingLeft: 16 }}>● Repository Health: <span style={{ color: '#00ff66' }}>OPTIMAL</span> | Security Audit: <span style={{ color: '#3fb950' }}>PASSED (0 leaks)</span></div>
                  
                  <div style={{ marginTop: 16 }}><span style={{ color: '#00ff66' }}>$ </span><span className="animate-pulse">█</span></div>
                </motion.div>
              )}

              {activeTab === 'diff' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div style={{ color: '#8b949e' }}>diff --git a/src/server.js b/src/server.js</div>
                  <div style={{ color: '#8b949e' }}>index a1b2c3d..e5f6g7h 100644</div>
                  <div style={{ color: '#8b949e' }}>--- a/src/server.js</div>
                  <div style={{ color: '#8b949e' }}>+++ b/src/server.js</div>
                  <div style={{ color: '#8b949e' }}>@@ -12,4 +12,6 @@ const express = require('express');</div>
                  <div style={{ color: '#c9d1d9' }}> const app = express();</div>
                  <div style={{ color: '#8b949e', background: 'rgba(255,255,255,0.05)', padding: '2px 4px' }}>- const PORT = process.env.PORT || 3000;</div>
                  <div style={{ color: '#3fb950', background: 'rgba(63,185,80,0.15)', padding: '2px 4px' }}>+ const PORT = process.env.PORT || 8080;</div>
                  <div style={{ color: '#3fb950', background: 'rgba(63,185,80,0.15)', padding: '2px 4px' }}>+ const VELTRIX_ENGINE_KEY = process.env.VELTRIX_KEY;</div>
                  <div style={{ color: '#c9d1d9' }}> app.use(express.json());</div>
                </motion.div>
              )}

              {activeTab === 'pr' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ background: '#238636', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Open</span>
                    <span style={{ color: '#f0f6fc', fontWeight: 700 }}>#108 Add distributed cache layer to Git packfiles</span>
                  </div>
                  <div style={{ color: '#8b949e', marginBottom: 12 }}>Opened by <span style={{ color: '#3fb950' }}>@hacker_dev</span> • 3 commits • 2 files changed</div>
                  <div style={{ borderLeft: '2px solid #3fb950', paddingLeft: 12, color: '#c9d1d9', background: '#161b22', padding: 10, borderRadius: 4 }}>
                    <span style={{ color: '#00ff66', fontWeight: 600 }}>@bot_reviewer:</span> Automated security checks passed. Zero secrets detected. Ready for merge!
                  </div>
                </motion.div>
              )}

              {activeTab === 'ci' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div style={{ color: '#8b949e', marginBottom: 8 }}>Veltrix CI/CD Runner #40891 (main branch)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff66' }} />
                    <span style={{ color: '#f0f6fc' }}>Linting code formatting & syntax: </span>
                    <span style={{ color: '#3fb950' }}>PASSED (0.4s)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff66' }} />
                    <span style={{ color: '#f0f6fc' }}>Running unit & integration tests: </span>
                    <span style={{ color: '#3fb950' }}>PASSED 148/148 (1.2s)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff66' }} />
                    <span style={{ color: '#f0f6fc' }}>Building static bundle & assets: </span>
                    <span style={{ color: '#3fb950' }}>SUCCESS (2.1s)</span>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ── Feature Bento Grid Section ─────────────────────────── */}
      <section id="features" style={{ padding: '80px 24px', background: '#0d1117', borderTop: '1px solid #21262d', borderBottom: '1px solid #21262d' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ color: '#00ff66', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>
              // ARCHITECTURE & TOOLS
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#f0f6fc', marginTop: 8 }}>
              Built for speed, security, and developer joy
            </h2>
            <p style={{ fontSize: 17, color: '#8b949e', maxWidth: 600, margin: '12px auto 0' }}>
              Everything you need to host, review, and ship modern software without bloat.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 10,
                  padding: 24,
                  transition: 'all 0.2s',
                  cursor: 'default'
                }}
                whileHover={{ borderColor: '#00ff66', translateY: -3 }}
              >
                <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 10, width: 'fit-content', marginBottom: 16 }}>
                  <f.icon className="w-5 h-5" style={{ color: '#00ff66' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Interactive Workflow Demonstrator ─────────────────── */}
      <section id="terminal" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#00ff66', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>
              // HACKER WORKFLOW STEP-BY-STEP
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#f0f6fc', marginTop: 8 }}>
              Four simple commands to master Veltrix
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {workflowSteps.map((w, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveWorkflowStep(idx)}
                style={{
                  background: activeWorkflowStep === idx ? '#161b22' : '#0d1117',
                  border: activeWorkflowStep === idx ? '1px solid #00ff66' : '1px solid #21262d',
                  borderRadius: 8,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: activeWorkflowStep === idx ? '#00ff66' : '#484f58', fontFamily: 'monospace' }}>
                  STEP {w.step}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', margin: '6px 0' }}>
                  {w.title}
                </div>
                <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.5 }}>
                  {w.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Active Command Window */}
          <div className="hacker-terminal" style={{ padding: 24, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#484f58', fontFamily: 'monospace', marginBottom: 12 }}>
              // Terminal Command Executing
            </div>
            <div style={{ fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 15, color: '#00ff66', background: '#0d1117', padding: '14px 18px', borderRadius: 6, border: '1px solid #30363d' }}>
              $ {workflowSteps[activeWorkflowStep].cmd}
            </div>
          </div>

        </div>
      </section>

      {/* ── Comparison Table Matrix ───────────────────────────── */}
      <section id="comparison" style={{ padding: '80px 24px', background: '#0d1117', borderTop: '1px solid #21262d' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f0f6fc' }}>
              Why Hackers Choose Veltrix
            </h2>
            <p style={{ fontSize: 16, color: '#8b949e', marginTop: 8 }}>
              Comparing modern Veltrix infrastructure with legacy Git hosting.
            </p>
          </div>

          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#21262d', borderBottom: '1px solid #30363d' }}>
                  <th style={{ padding: '16px 20px', color: '#f0f6fc', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>Feature Capability</th>
                  <th style={{ padding: '16px 20px', color: '#00ff66', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace', textAlign: 'center' }}>Veltrix.io</th>
                  <th style={{ padding: '16px 20px', color: '#8b949e', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace', textAlign: 'center' }}>Legacy Platforms</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #21262d' : 'none' }}>
                    <td style={{ padding: '14px 20px', color: '#c9d1d9', fontSize: 14, fontWeight: 500 }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <Check className="w-5 h-5" style={{ color: '#00ff66', margin: '0 auto' }} />
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {row.legacy ? (
                        <Check className="w-5 h-5" style={{ color: '#484f58', margin: '0 auto' }} />
                      ) : (
                        <span style={{ color: '#484f58', fontWeight: 700 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── Community Testimonials Section ────────────────────── */}
      <section id="community" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#00ff66', fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>
              // COMMUNITY FEEDBACK
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f0f6fc', marginTop: 8 }}>
              Loved by software engineers world-wide
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                quote: "Veltrix's Git sync speed is unreal. Pushing 100MB commits feels instantaneous compared to our old workflow.",
                author: "Alex Rivera",
                role: "Staff Infrastructure Engineer"
              },
              {
                quote: "The hacker terminal client and dark UI aesthetic are unmatched. It gives us total control over PRs directly in our terminal.",
                author: "Elena Rostova",
                role: "Core Systems Maintainer"
              },
              {
                quote: "Security secret scanning caught a leak before it ever hit our main branch. Veltrix is now mandatory across our org.",
                author: "Marcus Chen",
                role: "DevSecOps Lead"
              }
            ].map((t, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: '#0d1117', 
                  border: '1px solid #30363d', 
                  borderRadius: 10, 
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 20 }}>
                  "{t.quote}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#238636', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: 14 }}>
                    {t.author[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f6fc' }}>{t.author}</div>
                    <div style={{ fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── High-Impact Bottom Call to Action ──────────────────── */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)', 
            border: '1px solid #3fb950', 
            borderRadius: 16, 
            padding: '56px 36px', 
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(35, 134, 54, 0.2)'
          }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#f0f6fc', marginBottom: 16 }}>
              Ready to upgrade your developer workflow?
            </h2>
            <p style={{ fontSize: 17, color: '#8b949e', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.6 }}>
              Join thousands of hackers and engineering teams building the future on Veltrix today.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
              <input 
                type="email" 
                placeholder="Enter your work email..." 
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ 
                  flex: 1, 
                  minWidth: 240, 
                  background: '#010409', 
                  border: '1px solid #30363d', 
                  borderRadius: 6, 
                  padding: '12px 16px', 
                  color: '#f0f6fc', 
                  fontSize: 14, 
                  outline: 'none' 
                }}
              />
              <button 
                type="submit" 
                style={{ 
                  background: '#238636', 
                  color: '#fff', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  padding: '12px 24px', 
                  borderRadius: 6, 
                  border: 'none', 
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0,255,102,0.3)',
                  transition: 'background 0.2s'
                }}
              >
                {subscribed ? 'Subscribed ✓' : 'Get Early Access'}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: '#0d1117', borderTop: '1px solid #21262d', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32 }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img src="/log.png" alt="Veltrix Logo" style={{ height: 28, width: 'auto', borderRadius: 4, objectFit: 'contain' }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f0f6fc', fontFamily: 'monospace' }}>VELTRIX.IO</span>
            </div>
            <p style={{ fontSize: 13, color: '#8b949e', maxWidth: 300, lineHeight: 1.6 }}>
              The hacker-first version control and continuous software collaboration platform.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <span style={{ width: 8, height: 8, background: '#00ff66', borderRadius: '50%', boxShadow: '0 0 8px #00ff66' }} />
              <span style={{ fontSize: 12, color: '#3fb950', fontFamily: 'monospace' }}>All Systems Operational</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
            {[
              { title: 'Platform', links: ['Features', 'Veltrix CLI', 'Security', 'Enterprise'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Status Page', 'Changelog'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Privacy Policy'] }
            ].map((col, idx) => (
              <div key={idx}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, fontFamily: 'monospace' }}>
                  {col.title}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {col.links.map((link, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <a href="#" style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                         onMouseEnter={e => e.currentTarget.style.color = '#3fb950'}
                         onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div style={{ maxWidth: 1240, margin: '36px auto 0', paddingTop: 24, borderTop: '1px solid #21262d', textAlign: 'center', fontSize: 12, color: '#484f58', fontFamily: 'monospace' }}>
          © {new Date().getFullYear()} Veltrix Inc. Inspired by GitHub Hacker Culture. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
