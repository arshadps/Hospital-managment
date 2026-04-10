import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const PatientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('book');
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [details, setDetails] = useState('');
    const [msg, setMsg] = useState({text:'', type:''});
    
    // UI Layout Configuration
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Password reset state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwdMsg, setPwdMsg] = useState({text:'', type:''});
    
    // Profile state
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileMsg, setProfileMsg] = useState({text:'', type:''});

    useEffect(() => {
        if(activeTab === 'profile') fetchProfile();
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('auth/profile/');
            setProfile(res.data);
            setEditMode(false);
            setProfileMsg({text:'', type:''});
        } catch(err) {
            console.log(err);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('auth/profile/', profile);
            setProfileMsg({text: 'Profile updated successfully!', type: 'success'});
            setEditMode(false);
            fetchProfile();
        } catch(err) {
            setProfileMsg({text: err.response?.data?.error || 'Failed to update profile.', type: 'danger'});
        }
    };

    useEffect(() => {
        api.get('departments/').then(res => setDepartments(res.data)).catch(console.error);
        api.get('doctors/').then(res => setDoctors(res.data.filter(d=>d.is_approved))).catch(console.error);
    }, []);

    const availableDoctors = doctors.filter(d => !selectedDept || d.department?.id === parseInt(selectedDept));

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('appointments/', { doctor: selectedDoctor, appointment_date: date, personal_details: details });
            setMsg({text: 'Appointment booked successfully!', type: 'success'});
            setDate('');
            setDetails('');
        } catch (e) {
            let errMsg = 'Booking failed. ';
            if (e.response?.data?.non_field_errors) {
                errMsg = e.response.data.non_field_errors[0];
            } else if (typeof e.response?.data === 'object') {
                 const firstKey = Object.keys(e.response.data)[0];
                 errMsg = `${firstKey}: ${e.response.data[firstKey]?.[0] || e.response.data[firstKey]}`;
            }
            setMsg({text: errMsg, type: 'danger'});
        }
    };

    const handleChangePassword = async (e) => {
         e.preventDefault();
         if (!oldPassword) {
             setPwdMsg({text: 'Current password is required.', type: 'danger'});
             return;
         }
         const pwdRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
         if (!pwdRegex.test(newPassword)) {
             setPwdMsg({text: 'Password must be at least 8 characters long, contain a number and a special character.', type: 'danger'});
             return;
         }
         if (newPassword !== confirmPassword) {
             setPwdMsg({text: 'New passwords do not match!', type: 'danger'});
             return;
         }

         try {
             await api.post('auth/change-password/', { old_password: oldPassword, new_password: newPassword });
             setPwdMsg({text: 'Password successfully updated!', type: 'success'});
             setOldPassword('');
             setNewPassword('');
             setConfirmPassword('');
         } catch(err) {
             setPwdMsg({text: err.response?.data?.error || 'Failed to update password.', type: 'danger'});
         }
    };

    return (
        <div className="dashboard-layout" style={{display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
            {/* Vertical Sidebar */}
            <div className="dashboard-sidebar" style={{width: '260px', backgroundColor: '#212529', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column'}}>
                <div className="sidebar-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <h2 style={{color: '#fff', fontSize: '1.2rem', margin: 0}}>{user?.name ? user.name : 'Patient'}</h2>
                    <button className="nav-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem'}}>☰</button>
                </div>
                <ul className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={{listStyle: 'none', padding: 0, flex: 1, marginTop: '20px'}}>
                    <li style={{marginBottom: '10px'}}>
                        <button className="btn" style={{backgroundColor: activeTab==='book'?'var(--primary)':'transparent', color: activeTab==='book'?'#fff':'#bdc3c7', textAlign: 'left', width: '100%', padding: '12px 15px', borderRadius: '8px', fontWeight: activeTab==='book'?'600':'500'}} onClick={()=>setActiveTab('book')}>
                            Book Appointment
                        </button>
                    </li>
                    <li style={{marginBottom: '10px'}}>
                        <button className="btn" style={{backgroundColor: activeTab==='profile'?'var(--primary)':'transparent', color: activeTab==='profile'?'#fff':'#bdc3c7', textAlign: 'left', width: '100%', padding: '12px 15px', borderRadius: '8px', fontWeight: activeTab==='profile'?'600':'500'}} onClick={()=>setActiveTab('profile')}>
                            View Profile
                        </button>
                    </li>
                    <li style={{marginBottom: '10px'}}>
                        <button className="btn" style={{backgroundColor: activeTab==='reset'?'var(--primary)':'transparent', color: activeTab==='reset'?'#fff':'#bdc3c7', textAlign: 'left', width: '100%', padding: '12px 15px', borderRadius: '8px', fontWeight: activeTab==='reset'?'600':'500'}} onClick={()=>setActiveTab('reset')}>
                            Reset Password
                        </button>
                    </li>
                </ul>
                <div style={{borderTop: '1px solid #34495e', paddingTop: '15px', marginTop: 'auto'}}>
                     <div style={{marginBottom: '15px', fontSize: '14px', color: '#bdc3c7', textAlign: 'center'}}>Logged in as:<br/><strong style={{color: '#fff'}}>{user?.name}</strong></div>
                <button className="btn mobile-logout" onClick={logout} style={{width: '100%', padding: '12px', backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold'}}>Logout</button>
            </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content" style={{flex: 1, padding: '40px 40px 100px 40px', overflowY: 'auto', position: 'relative'}}>
                {activeTab === 'book' && (
                   <div className="card" style={{maxWidth: '750px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '30px'}}>
                        <h2 style={{borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', color: 'var(--dark)'}}>Schedule an Appointment</h2>
                        {msg.text && <div style={{padding: '12px', borderRadius: '5px', backgroundColor: msg.type==='success'?'#e6f7eb':'#ffe5e5', color: msg.type==='success'?'#28a745':'#dc3545', marginBottom: '20px', fontWeight: '500'}}>{msg.text}</div>}
                        
                        <form onSubmit={handleBook}>
                            <div className="form-group" style={{marginBottom: '20px'}}>
                                <label style={{color: 'var(--secondary)', fontWeight: '600'}}>Your Auto-Fetched Patient ID</label>
                                <input type="text" className="form-control" value={user?.patient_id || 'Fetching ID...'} disabled style={{background: '#f8f9fa', border: '1px solid #e9ecef', color: '#495057', fontWeight: 'bold'}} />
                            </div>
                            
                            <div style={{display: 'flex', gap: '20px', marginTop: '15px'}}>
                                <div className="form-group" style={{flex: 1}}>
                                    <label>1. Department Selection</label>
                                    <select className="form-control" value={selectedDept} onChange={(e)=>setSelectedDept(e.target.value)}>
                                        <option value="">All Departments</option>
                                        {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{flex: 1}}>
                                    <label>2. Choose Doctor</label>
                                    <select className="form-control" value={selectedDoctor} onChange={(e)=>setSelectedDoctor(e.target.value)} required>
                                        <option value="">-- View Assigned Doctors --</option>
                                        {availableDoctors.map(d=><option key={d.id} value={d.id}>Dr. {d.user?.first_name} {d.user?.last_name} ({d.department?.name})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{marginTop: '15px'}}>
                                <label>3. Personal Details & Symptoms</label>
                                <textarea className="form-control" value={details} onChange={(e)=>setDetails(e.target.value)} required rows="4" placeholder="Briefly specify details for this booking..."></textarea>
                            </div>
                            
                            <div className="form-group" style={{marginTop: '15px'}}>
                                <label>4. Desired Appointment Date</label>
                                <input type="date" className="form-control" value={date} onChange={(e)=>setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '25px', padding: '15px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,123,255,0.3)'}}>Secure Appointment Slot</button>
                        </form>
                   </div>
                )}
                
                {activeTab === 'profile' && (
                    <div className="card" style={{maxWidth: '750px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '30px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
                            <h2 style={{color: 'var(--dark)', margin: 0}}>My Details natively connected</h2>
                            {!editMode && profile && (
                                <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Details</button>
                            )}
                        </div>
                        
                        {profileMsg.text && (
                            <div style={{padding: '12px', borderRadius: '5px', backgroundColor: profileMsg.type==='success'?'#e6f7eb':'#ffe5e5', color: profileMsg.type==='success'?'#28a745':'#dc3545', marginBottom: '20px', fontWeight: '500'}}>{profileMsg.text}</div>
                        )}

                        {profile ? (
                            <form onSubmit={updateProfile}>
                                <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>First Name</label>
                                        <input type="text" className="form-control" value={profile.first_name || ''} onChange={e => setProfile({...profile, first_name: e.target.value})} disabled={!editMode} required />
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Last Name</label>
                                        <input type="text" className="form-control" value={profile.last_name || ''} onChange={e => setProfile({...profile, last_name: e.target.value})} disabled={!editMode} required />
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Email ID</label>
                                        <input type="email" className="form-control" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} disabled={!editMode} style={{background: editMode ? '#fff' : '#f8f9fa'}} required />
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Patient ID</label>
                                        <input type="text" className="form-control" value={profile.patient_id || ''} disabled style={{background: '#f8f9fa', fontWeight: 'bold'}} />
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Age</label>
                                        <input type="number" className="form-control" value={profile.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} disabled={!editMode} />
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Gender</label>
                                        <select className="form-control" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} disabled={!editMode}>
                                            <option value="">Select Gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 45%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Phone Number</label>
                                        <input type="text" className="form-control" value={profile.phone_number || ''} onChange={e => setProfile({...profile, phone_number: e.target.value})} disabled={!editMode} placeholder="10-digit number" />
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 100%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Medical Context / Personal Details</label>
                                        <textarea className="form-control" value={profile.personal_details || ''} onChange={e => setProfile({...profile, personal_details: e.target.value})} disabled={!editMode} rows="3"></textarea>
                                    </div>
                                    <div className="form-group" style={{flex: '1 1 100%', marginBottom: '15px'}}>
                                        <label style={{fontWeight: '600'}}>Home Address</label>
                                        <textarea className="form-control" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} disabled={!editMode} rows="2"></textarea>
                                    </div>
                                </div>
                                
                                {editMode && (
                                    <div style={{marginTop: '20px', display: 'flex', gap: '15px'}}>
                                        <button type="submit" className="btn btn-primary" style={{padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold'}}>Save Changes</button>
                                        <button type="button" className="btn btn-outline" style={{padding: '12px 25px', borderRadius: '8px'}} onClick={() => { setEditMode(false); fetchProfile(); }}>Cancel</button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <p style={{color: 'var(--secondary)'}}>Loading patient details natively...</p>
                        )}
                    </div>
                )}
                
                {activeTab === 'reset' && (
                    <div className="card" style={{maxWidth: '500px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '30px'}}>
                          <h2 style={{borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', color: 'var(--dark)'}}>Account Security</h2>
                          <p style={{color: 'var(--secondary)', marginBottom: '20px'}}>Update your auto-generated or current password securely here.</p>
                          {pwdMsg.text && <div style={{padding: '12px', borderRadius: '5px', backgroundColor: pwdMsg.type==='success'?'#e6f7eb':'#ffe5e5', color: pwdMsg.type==='success'?'#28a745':'#dc3545', marginBottom: '20px', fontWeight: '500'}}>{pwdMsg.text}</div>}
                          <form onSubmit={handleChangePassword}>
                              <div className="form-group">
                                 <label>Current / Auto-Generated Password</label>
                                 <input type="password" required className="form-control" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} />
                              </div>
                              <div className="form-group" style={{marginTop: '15px'}}>
                                 <label>New Secure Password</label>
                                 <input type="password" required className="form-control" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                                 <small style={{display:'block', marginTop:'6px', color:'#7f8c8d'}}>Min 8 characters, with numerals & special chars.</small>
                              </div>
                              <div className="form-group" style={{marginTop: '15px'}}>
                                 <label>Confirm New Password</label>
                                 <input type="password" required className="form-control" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
                              </div>
                              <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '25px', padding: '12px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px'}}>Update Credentials</button>
                          </form>
                    </div>
                )}
                
                <div style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
                    <Footer />
                </div>
            </div>
        </div>
    );
};
export default PatientDashboard;
