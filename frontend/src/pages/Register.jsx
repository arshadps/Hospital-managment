import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Register = () => {
  return (
    <div className="container" style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: '80px'}}>
      <div className="card" style={{width: '450px', textAlign: 'center', padding: '40px'}}>
        <h2 style={{color: 'var(--dark)', marginBottom: '30px'}}>Choose Your Role</h2>
        <p style={{color: 'var(--secondary)', marginBottom: '30px'}}>Are you seeking medical attention or looking to join our professional network?</p>
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
             <Link to="/register/patient" className="btn btn-primary" style={{padding: '15px', fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(0, 123, 255, 0.3)', borderRadius: '12px'}}>Register as a Patient</Link>
             <Link to="/register/doctor" className="btn btn-outline" style={{padding: '15px', fontSize: '1.1rem', borderRadius: '12px', border: '2px solid #ddd'}}>Apply as a Doctor</Link>
        </div>
        <div style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
            <Link to="/login" style={{color: 'var(--primary)', fontWeight: '600'}}>Already registered? Sign In</Link>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 0, width: '100%'}}><Footer /></div>
    </div>
  );
};
export default Register;
