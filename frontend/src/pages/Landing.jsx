import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Shield, Zap, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Landmark size={32} color="#00BFA5" />,
    title: 'Multi-Standard Compliance',
    desc: 'GAAP, IFRS, and IND-AS/GST support out of the box for global operations.',
  },
  {
    icon: <Shield size={32} color="#00BFA5" />,
    title: 'Role-Based Access',
    desc: 'Granular permissions for Owners, Accountants, and Viewers — no over-exposure.',
  },
  {
    icon: <Zap size={32} color="#00BFA5" />,
    title: 'Real-Time Sync',
    desc: 'Changes propagate instantly across your team with zero config required.',
  },
  {
    icon: <BarChart size={32} color="#00BFA5" />,
    title: 'Smart Reporting',
    desc: 'Generate audit-ready reports with a single click. Export to PDF or Excel.',
  },
];

function Landing() {
  return (
    <div className="text-lightWhite overflow-hidden relative" style={{ minHeight: '100vh', background: '#000000' }}>
      
      <div className="grid-overlay absolute inset-0 pointer-events-none" />

      <nav className="relative z-10 flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center font-medium text-white"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#0000EE',
              fontSize: 14, letterSpacing: '-0.75px',
            }}
          >
            UV
          </div>
          <span style={{ fontWeight: 500, fontSize: 16, color: '#FFFFFF', letterSpacing: '-0.75px' }}>
            UVN <span style={{ color: '#00BFA5' }}>SaaS</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost" style={{ fontSize: 14 }}>
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary" style={{ fontSize: 14 }}>
            Get Started
          </Link>
        </div>
      </nav>

      <section
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ paddingTop: '5rem', paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
      >
        <div className="teal-badge anim-fade-up" style={{ marginBottom: '1.5rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00BFA5', display: 'inline-block' }} />
          Enterprise Financial Management Platform
        </div>

        <h1
          className="anim-fade-up anim-delay-1"
          style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
            fontWeight: 500,
            lineHeight: 'normal',
            letterSpacing: '-0.75px',
            maxWidth: 780,
            marginBottom: '1.5rem',
            color: '#FFFFFF'
          }}
        >
          Accounting built for modern teams
        </h1>

        <p
          className="anim-fade-up anim-delay-2"
          style={{ maxWidth: 560, fontSize: '1.1rem', color: '#EEEEEE', lineHeight: 'normal', marginBottom: '2.5rem', fontWeight: 300 }}
        >
          Manage documents, databases, and compliance workflows — all in one
          secure, role-aware platform designed for finance teams.
        </p>

        <div className="flex gap-4 flex-wrap justify-center anim-fade-up anim-delay-3">
          <Link to="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            Start for free
          </Link>
          <Link to="/login" className="btn-ghost" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
            Sign in
          </Link>
        </div>

        <div
          className="panel anim-fade-up anim-delay-4"
          style={{
            display: 'flex', gap: '3rem', marginTop: '4rem',
            padding: '1.2rem 2.5rem', borderRadius: 0,
            flexWrap: 'wrap', justifyContent: 'center',
          }}
        >
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: 'SOC 2', label: 'Certified' },
            { value: '3 Standards', label: 'GAAP · IFRS · IND-AS' },
            { value: '< 1s', label: 'Sync Speed' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: '1.35rem', color: '#00BFA5', letterSpacing: '-0.75px' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#757575', marginTop: 4, fontWeight: 300 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="relative z-10"
        style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="teal-badge" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Features</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '0.75rem', fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.75px' }}>
            Everything your finance team needs
          </h2>
          <p style={{ color: '#EEEEEE', maxWidth: 480, margin: '0 auto', lineHeight: 'normal', fontWeight: 300 }}>
            From compliance to real-time collaboration, UVN SaaS is built around the way modern accounting teams operate.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`panel anim-fade-up anim-delay-${i % 5 + 1}`}
              style={{
                borderRadius: 0, padding: '1.75rem', border: '1.75px solid #000055',
                transition: 'transform 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ marginBottom: '0.85rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 500, color: '#FFFFFF', marginBottom: '0.5rem', fontSize: '1rem', letterSpacing: '-0.75px' }}>{f.title}</div>
              <div style={{ color: '#EEEEEE', fontSize: '0.9rem', lineHeight: 'normal', fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="relative z-10"
        style={{ maxWidth: 900, margin: '0 auto 6rem', padding: '0 1.5rem' }}
      >
        <div
          className="panel"
          style={{
            borderRadius: 0,
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            background: '#000021',
            border: '1.75px solid #000055',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: '1rem', color: '#FFFFFF', fontWeight: 500, letterSpacing: '-0.75px' }}>
              Ready to modernize your accounting?
            </h2>
            <p style={{ color: '#EEEEEE', marginBottom: '2rem', lineHeight: 'normal', fontWeight: 300 }}>
              Join forward-thinking finance teams who trust UVN SaaS to keep their books clean and compliant.
            </p>
            <Link to="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.2rem' }}>
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <footer
        className="relative z-10"
        style={{
          borderTop: '1.75px solid #000055',
          padding: '1.5rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.75rem',
          background: '#000000'
        }}
      >
        <span style={{ color: '#757575', fontSize: '0.9rem', fontWeight: 300 }}>
          © 2026 UVN SaaS. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ color: '#757575', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 300 }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#757575')}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default Landing;
