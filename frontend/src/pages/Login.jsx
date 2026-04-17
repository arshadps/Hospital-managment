import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const successMsg = queryParams.get('msg');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      if (data.role === 'ADMIN') navigate('/admin');
      else if (data.role === 'DOCTOR') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      const serverErr = err.response?.data?.error || err.response?.data?.detail;
      setError(serverErr || `Connection Error: ${err.message}. Make sure your Django backend is running!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', paddingBottom: '80px' }}>
      <Navbar />
      <div className="container" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{width: '400px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}}>
        <h2 style={{textAlign: 'center', marginBottom: '25px', color: '#333'}}>System Portal Access</h2>
        
        {successMsg === 'doc_success' && <div style={{marginBottom: '15px', textAlign: 'center', backgroundColor: '#e6f7eb', color: '#28a745', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #c2eadd'}}>Successfully created! Please wait for admin approval.</div>}
        {successMsg === 'pat_success' && <div style={{marginBottom: '15px', textAlign: 'center', backgroundColor: '#e6f7eb', color: '#28a745', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #c2eadd'}}>Successfully created! Check your email for login credentials.</div>}
        {location.state?.message && <div style={{marginBottom: '15px', textAlign: 'center', backgroundColor: location.state.msgType==='success'?'#e6f7eb':'#f8f9fa', color: location.state.msgType==='success'?'#28a745':'#555', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #c2eadd'}}>{location.state.message}</div>}
        {error && <div className="error-text" style={{marginBottom: '15px', textAlign: 'center', backgroundColor: '#ffe5e5', padding: '10px', borderRadius: '5px'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '5px', display: 'block' }}>Username</label>
            <input type="text" placeholder="Enter your username" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '5px', display: 'block' }}>Password</label>
            <input type="password" placeholder="••••••••" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '25px', padding: '12px', fontSize: '16px' }}>Login</button>
        </form>
        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <Link to="/reset-password" style={{ color: 'var(--secondary)' }}>Forgot Password?</Link>
          <Link to="/register" style={{ fontWeight: '600' }}>Create Account</Link>
        </div>
      </div>
      </div>
      <div style={{position: 'absolute', bottom: 0, width: '100%'}}>
        <Footer />
      </div>
    </div>
  );
};
export default Login;
