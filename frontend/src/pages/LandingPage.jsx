import { Link } from 'react-router-dom';
import {
  Shield, MapPin, Bell, FileText, Radio, Users, Activity, ArrowRight,
  Globe, Lock, Zap,
} from 'lucide-react';
import './landing.css';

const features = [
  { icon: MapPin, title: 'Live Location Tracking', desc: 'Monitor tourist GPS locations in real-time on interactive OpenStreetMap with precise coordinates.' },
  { icon: Bell, title: 'Emergency SOS Alerts', desc: 'Instant critical alerts when tourists trigger SOS. Officers respond with live location data.' },
  { icon: Shield, title: 'Zone Management', desc: 'Create restricted, risky, and safe zones. Auto-trigger alerts when tourists enter danger areas.' },
  { icon: FileText, title: 'E-FIR Records', desc: 'Generate, verify, and download electronic First Information Reports for tourist incidents.' },
  { icon: Radio, title: 'Emergency Broadcasts', desc: 'Send radius, zone, region, or state-wide safety notifications to tourists instantly.' },
  { icon: Activity, title: 'Safety Score System', desc: 'AI-powered safety scoring based on location, alerts, zone proximity, and activity patterns.' },
];

const LandingPage = () => (
  <div className="landing">
    <nav className="landing-nav">
      <div className="landing-nav-logo">
        <Shield size={28} color="#38bdf8" />
        <span>STSMS</span>
      </div>
      <div className="landing-nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <Link to="/login" className="btn btn-accent btn-sm">Officer Login</Link>
        <Link to="/tourist/login" className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>Tourist App</Link>
      </div>
    </nav>

    <section className="landing-hero">
      <div className="landing-hero-content">
        <div className="landing-badge">
          <Zap size={14} /> Real-Time Tourist Safety Platform
        </div>
        <h1>Smart Tourist <span>Safety Monitoring</span> System</h1>
        <p>
          A centralized police dashboard for tracking tourists, managing emergency alerts,
          monitoring unsafe zones, generating E-FIR records, and sending emergency broadcasts in real time.
        </p>
        <div className="landing-hero-btns">
          <Link to="/tourist/login" className="btn btn-accent btn-lg">
            Tourist App <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            Officer Portal
          </Link>
          <a href="#features" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            Explore Features
          </a>
        </div>
      </div>
    </section>

    <div className="landing-stats">
      {[
        { value: '500+', label: 'Tourists Monitored' },
        { value: '24/7', label: 'Live Tracking' },
        { value: '99.9%', label: 'Alert Response' },
        { value: '50+', label: 'Safety Zones' },
      ].map((s) => (
        <div key={s.label} className="landing-stat">
          <div className="landing-stat-value">{s.value}</div>
          <div className="landing-stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    <section className="landing-features" id="features">
      <div className="landing-section-title">
        <h2>Comprehensive Safety Modules</h2>
        <p>Everything police authorities need to protect tourists across the nation</p>
      </div>
      <div className="landing-features-grid">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="landing-feature">
            <div className="landing-feature-icon"><Icon size={24} /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="landing-cta" id="about">
      <Globe size={40} color="#38bdf8" style={{ marginBottom: 16 }} />
      <h2>Protect Tourists. Empower Authorities.</h2>
      <p>Built on MERN Stack — MongoDB, Express, React, and Node.js for scalable real-time monitoring.</p>
      <Link to="/login" className="btn btn-accent btn-lg">
        <Lock size={18} /> Officer Portal Login
      </Link>
    </section>

    <footer className="landing-footer">
      <span>&copy; 2024 Smart Tourist Safety Monitoring System</span>
      <span>MERN Stack | Police Authority Dashboard</span>
    </footer>
  </div>
);

export default LandingPage;
