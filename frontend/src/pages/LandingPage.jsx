import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page" style={{ position: 'relative', paddingBottom: '80px', minHeight: '100vh' }}>
      <nav className="landing-nav">
        <h1 className="logo">MediCore<span style={{color: 'var(--success)'}}>.</span></h1>
        <div className="nav-links" style={{display: 'flex', gap: '15px'}}>
          <Link to="/login" className="btn btn-outline" style={{padding: '8px 20px'}}>Sign In</Link>
          <Link to="/register" className="btn btn-primary" style={{padding: '8px 20px', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)'}}>Join Network</Link>
        </div>
      </nav>
      
      <main className="hero-section">
        <div className="hero-content">
          <div className="badge">Next Generation Healthcare</div>
          <h2 className="hero-title">Elevate Your<br/>Healthcare Experience.</h2>
          <p className="hero-subtitle">
            Seamlessly connect with top-tier specialized doctors. Experience fluid appointment booking, intuitive synchronization, and powerful tools—beautifully designed for Modern Patients and Professionals.
          </p>
          <div className="cta-container">
            <Link to="/register" className="btn btn-primary btn-large" style={{boxShadow: '0 8px 25px rgba(0, 123, 255, 0.35)'}}>Book an Appointment</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Doctor Portal</Link>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="glass-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                 <div style={{width: 30, height: 30, backgroundColor: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px'}}>✓</div>
                 <h3 style={{margin: 0}}>24/7 Network</h3>
              </div>
              <p>Instant availability tracking.</p>
          </div>
          <div className="glass-card decor">
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                 <div style={{width: 30, height: 30, backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px'}}>+</div>
                 <h3 style={{margin: 0}}>Expert Care</h3>
              </div>
              <p>Direct priority scheduling.</p>
          </div>
        </div>
      </main>
      <div style={{position: 'absolute', bottom: 0, width: '100%'}}><Footer /></div>
    </div>
  );
};

export default LandingPage;
