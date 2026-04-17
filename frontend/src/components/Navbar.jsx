import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="landing-nav" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="logo" style={{ margin: 0, color: 'var(--dark)' }}>MediCore<span style={{color: 'var(--success)'}}>.</span></h1>
      </Link>
      <div className="nav-links" style={{display: 'flex', gap: '15px'}}>
        <Link to="/login" className="btn btn-outline" style={{padding: '8px 20px'}}>Sign In</Link>
        <Link to="/register" className="btn btn-primary" style={{padding: '8px 20px', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)'}}>Join Network</Link>
      </div>
    </nav>
  );
};

export default Navbar;
