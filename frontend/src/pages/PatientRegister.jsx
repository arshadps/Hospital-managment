import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Footer from '../components/Footer';

const PatientRegister = () => {
  const [formData, setFormData] = useState({email: '', username: '', first_name: '', last_name: '', address: '', gender: '', age: '', phone_number: ''});
  const [msg, setMsg] = useState({text: '', type: ''});
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
      let error = '';
      if (name === 'first_name' || name === 'last_name') {
          if (value.length > 0 && value.length < 2) error = 'Minimum 2 chars required';
      }
      if (name === 'email') {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value.length > 0 && !re.test(value)) error = 'Invalid email format';
      }
      if (name === 'phone_number') {
          const re = /^\d{10}$/;
          if (value.length > 0 && !re.test(value)) error = 'Must be exactly 10 digits';
      }
      setErrors(prev => ({...prev, [name]: error}));
  };

  const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
      validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some(err => err !== '')) {
        setMsg({text: 'Please fix the live validation errors before submitting!', type: 'danger'});
        return;
    }
    try {
        await api.post('auth/register/patient/', formData);
        window.location.href = '/login?msg=pat_success';
    } catch (err) {
        let errMessage = 'Registration failed.';
        if (err.response?.data) {
            if (typeof err.response.data === 'object' && Object.keys(err.response.data).length > 0) {
                const firstKey = Object.keys(err.response.data)[0];
                const errVal = err.response.data[firstKey];
                errMessage = Array.isArray(errVal) ? errVal[0] : errVal;
            } else {
                errMessage = JSON.stringify(err.response.data);
            }
        }
        setMsg({text: errMessage, type: 'danger'});
    }
  };

  return (
    <div className="container" style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 0 100px 0', position: 'relative'}}>
      <div className="card" style={{width: '600px'}}>
        <h2 style={{marginBottom: '5px', color: 'var(--primary)', textAlign: 'center'}}>Patient Registration</h2>
        <p style={{textAlign: 'center', color: 'var(--secondary)', marginBottom: '20px'}}>Create your patient profile to book appointments</p>
        
        {msg.text && <div style={{color: msg.type==='success'?'green':'red', marginBottom: '15px', padding: '10px', backgroundColor: msg.type==='success'?'#e6f7eb':'#ffe5e5', borderRadius: '4px', textAlign: 'center'}}>{msg.text}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{display: 'flex', gap: '15px'}}>
            <div className="form-group" style={{flex: 1}}>
                <label>First Name</label><input type="text" name="first_name" className={`form-control ${errors.first_name ? 'is-invalid' : ''}`} style={errors.first_name ? {borderColor: 'red'} : {}} onChange={handleChange} required />
                {errors.first_name && <small style={{color:'red'}}>{errors.first_name}</small>}
            </div>
            <div className="form-group" style={{flex: 1}}>
                <label>Last Name</label><input type="text" name="last_name" className={`form-control ${errors.last_name ? 'is-invalid' : ''}`} style={errors.last_name ? {borderColor: 'red'} : {}} onChange={handleChange} required />
                {errors.last_name && <small style={{color:'red'}}>{errors.last_name}</small>}
            </div>
          </div>
          <div style={{display: 'flex', gap: '15px'}}>
             <div className="form-group" style={{flex: 1}}><label>Username</label><input type="text" name="username" className="form-control" onChange={handleChange} required /></div>
             <div className="form-group" style={{flex: 1}}>
                 <label>Email Address</label><input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} style={errors.email ? {borderColor: 'red'} : {}} onChange={handleChange} required />
                 {errors.email && <small style={{color:'red'}}>{errors.email}</small>}
             </div>
          </div>
          <div style={{display: 'flex', gap: '15px'}}>
             <div className="form-group" style={{flex: 1}}><label>Age</label><input type="number" min="1" max="150" name="age" className="form-control" onChange={handleChange} required /></div>
             <div className="form-group" style={{flex: 1}}>
                 <label>Gender</label>
                 <select name="gender" className="form-control" onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                 </select>
             </div>
          </div>
          <div className="form-group"><label>Address</label><textarea name="address" className="form-control" onChange={handleChange} rows="2" required></textarea></div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" className="form-control" style={errors.phone_number ? {borderColor: 'red'} : {}} onChange={handleChange} required />
            {errors.phone_number && <small style={{color:'red', display:'block'}}>{errors.phone_number}</small>}
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '20px', padding: '12px', fontSize: '16px'}}>Register Account</button>
        </form>
        <div style={{marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px'}}>
            <Link to="/register" style={{color: 'var(--text-muted)'}}>Back to roles</Link>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 0, width: '100%'}}><Footer /></div>
    </div>
  );
};
export default PatientRegister;
