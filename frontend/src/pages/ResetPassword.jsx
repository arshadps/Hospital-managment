import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [validationErrs, setValidationErrs] = useState({ newPassword: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) {
        setErr('Only @gmail.com addresses are allowed.');
        return;
    }
    try {
      await api.post('auth/password-reset/', { email });
      setStep(2);
      setMsg('OTP sent to your email.');
      setErr('');
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to request OTP');
    }
  };

  const handlePasswordChange = (e) => {
      const val = e.target.value;
      setNewPassword(val);
      const pwdRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (val.length > 0 && !pwdRegex.test(val)) {
          setValidationErrs(prev => ({...prev, newPassword: 'Min 8 chars, 1 number, 1 special char'}));
      } else {
          setValidationErrs(prev => ({...prev, newPassword: ''}));
      }
  };

  const handleConfirmChange = (e) => {
      const val = e.target.value;
      setConfirmPassword(val);
      if (val.length > 0 && val !== newPassword) {
          setValidationErrs(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
      } else {
          setValidationErrs(prev => ({...prev, confirmPassword: ''}));
      }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code) {
        setErr('Reset Code is required.');
        return;
    }
    if (validationErrs.newPassword || validationErrs.confirmPassword) {
        setErr('Please fix the live validation errors before submitting.');
        return;
    }
    
    try {
      await api.post('auth/password-reset-confirm/', { email, code, new_password: newPassword });
      navigate('/login', { state: { message: 'Password reset successful! Please login.', msgType: 'success' } });
    } catch (e) {
      setErr(e.response?.data?.error || 'Invalid OTP or password strength failed.');
    }
  };

  return (
    <div className="container" style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingBottom: '80px'}}>
      <div className="card" style={{width: '400px', transform: 'translateY(-40px)'}}>
        <h2 style={{textAlign: 'center', color: 'var(--primary)', marginBottom: '20px'}}>Reset Password</h2>
        {msg && <p style={{color: 'green', textAlign:'center', backgroundColor: '#e6f7eb', padding: '10px'}}>{msg}</p>}
        {err && <p style={{color: 'red', textAlign:'center', backgroundColor: '#ffe5e5', padding: '10px'}}>{err}</p>}
        
        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop: '10px'}}>Send Reset Code</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Reset Code (OTP)</label>
              <input type="text" className="form-control" value={code} onChange={e=>setCode(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-control" style={validationErrs.newPassword ? {borderColor: 'red'} : {}} value={newPassword} onChange={handlePasswordChange} required />
              {validationErrs.newPassword ? <small style={{display:'block', marginTop:'5px', color:'red'}}>{validationErrs.newPassword}</small> : <small style={{display:'block', marginTop:'5px', color:'var(--text-muted)'}}>Must be at least 8 chars, 1 number, 1 special char.</small>}
            </div>
            <div className="form-group" style={{marginTop: '10px'}}>
              <label>Confirm Password</label>
              <input type="password" className="form-control" style={validationErrs.confirmPassword ? {borderColor: 'red'} : {}} value={confirmPassword} onChange={handleConfirmChange} required />
              {validationErrs.confirmPassword && <small style={{display:'block', marginTop:'5px', color:'red'}}>{validationErrs.confirmPassword}</small>}
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop: '15px'}}>Save New Password</button>
          </form>
        )}
      </div>
      <div style={{position: 'absolute', bottom: 0, width: '100%'}}><Footer /></div>
    </div>
  );
};
export default ResetPassword;
