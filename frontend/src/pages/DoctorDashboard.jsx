import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [pwdData, setPwdData] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
    const [departments, setDepartments] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 'view profile') fetchProfile();
    }, [activeTab]);

    useEffect(() => {
        api.get('departments/').then(res => setDepartments(res.data)).catch(console.error);
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('auth/profile/');
            setProfile(res.data);
            setEditMode(false);
            setProfileMsg({ text: '', type: '' });
        } catch (err) {
            console.log(err);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('auth/profile/', profile);
            setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
            setEditMode(false);
            fetchProfile();
        } catch (err) {
            setProfileMsg({ text: err.response?.data?.error || 'Failed to update profile.', type: 'danger' });
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('appointments/');
            // Appointments are automatically filtered natively by the backend for this specific Dr.
            setAppointments(res.data);
        } catch (err) {
            console.log("Failed fetching appointments", err);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (pwdData.new_password !== pwdData.confirm_password) {
            setPwdMsg({ text: 'New passwords do not match.', type: 'danger' });
            return;
        }

        const regex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!regex.test(pwdData.new_password)) {
            setPwdMsg({ text: 'Password must be at least 8 characters long and contain a number and a special character.', type: 'danger' });
            return;
        }

        try {
            await api.post('auth/change-password/', {
                old_password: pwdData.old_password,
                new_password: pwdData.new_password
            });
            setPwdMsg({ text: 'Password updated successfully!', type: 'success' });
            setPwdData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            let msg = 'Failed to reset password.';
            if (err.response?.data?.error) msg = err.response.data.error;
            setPwdMsg({ text: msg, type: 'danger' });
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'CONSULTED' ? 'NOT_CONSULTED' : 'CONSULTED';
        try {
            await api.patch(`appointments/${id}/`, { status: newStatus });
            fetchAppointments();
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    // Calculate dates
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
    const upcomingAppointments = appointments.filter(a => a.appointment_date > todayStr);
    const pendingCount = appointments.filter(a => !a.is_approved).length;
    const actionReqCount = appointments.filter(a => a.status === 'NOT_CONSULTED').length;

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="dashboard-sidebar" style={{ width: '260px', backgroundColor: '#212529', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
                <div className="sidebar-header">
                    <h2 style={{ color: '#fff', textAlign: 'center', borderBottom: '1px solid #343a40', paddingBottom: '15px' }}>{user?.name ? `Dr. ${user.name.split(' ')[0]}` : 'Doctor'}</h2>
                    <button className="nav-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
                </div>
                <ul className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={{ listStyle: 'none', padding: 0, marginTop: '20px', flex: 1 }}>
                    {['overview', 'all appointments', 'view profile', 'reset password'].map(tab => (
                        <li key={tab} style={{ marginBottom: '10px' }}>
                            <button className="btn" style={{ backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : '#ced4da', textAlign: 'left', width: '100%', padding: '12px 15px', borderRadius: '8px', textTransform: 'capitalize', fontWeight: activeTab === tab ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setActiveTab(tab)}>
                                <span>{tab}</span>
                                {tab === 'all appointments' && actionReqCount > 0 && (
                                    <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{actionReqCount}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
                <button className="btn mobile-logout" onClick={logout} style={{ width: '100%', padding: '12px', backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold' }}>Logout</button>
            </div>

            <div className="dashboard-content" style={{ flex: 1, padding: '40px 40px 100px 40px', overflowY: 'auto', position: 'relative' }}>
                {activeTab === 'overview' && (
                    <div>
                        <h2 style={{ marginBottom: '25px', color: '#343a40' }}>Welcome, Dr. {user?.name}</h2>

                        <div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                            <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '3rem', color: 'var(--primary)', margin: '10px 0' }}>{todayAppointments.length}</h1>
                                <p style={{ color: '#6c757d', fontWeight: 'bold' }}>Today's Patients</p>
                            </div>
                            <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '3rem', color: '#28a745', margin: '10px 0' }}>{upcomingAppointments.length}</h1>
                                <p style={{ color: '#6c757d', fontWeight: 'bold' }}>Upcoming Bookings</p>
                            </div>
                            <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '3rem', color: '#f39c12', margin: '10px 0' }}>{pendingCount}</h1>
                                <p style={{ color: '#6c757d', fontWeight: 'bold' }}>Pending Admin Approval</p>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Today's Schedule ({todayStr})</h3>
                            {todayAppointments.length === 0 ? (
                                <p style={{ color: 'gray' }}>No appointments scheduled for today.</p>
                            ) : (
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Age / Gender</th>
                                            <th>Contact</th>
                                            <th>Personal Details</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayAppointments.map(a => (
                                            <tr key={a.id} style={{ opacity: a.is_approved ? 1 : 0.6 }}>
                                                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{a.patient?.user?.first_name} {a.patient?.user?.last_name}</td>
                                                <td>{a.patient?.user?.age} y.o / {a.patient?.user?.gender}</td>
                                                <td>{a.patient?.phone_number}</td>
                                                <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{a.patient?.personal_details}</td>
                                                <td>
                                                    {!a.is_approved ? (
                                                        <span style={{ color: '#f39c12', fontWeight: 'bold' }}>Awaiting Admin</span>
                                                    ) : (
                                                        <button
                                                            className={`btn ${a.status === 'CONSULTED' ? 'btn-primary' : 'btn-outline'}`}
                                                            style={{ padding: '5px 10px', fontSize: '12px', minWidth: '110px' }}
                                                            onClick={() => toggleStatus(a.id, a.status)}
                                                        >
                                                            {a.status === 'CONSULTED' ? 'Consulted' : 'Not Consulted'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'all appointments' && (
                    <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                        <h2 style={{ marginBottom: '5px', color: '#343a40' }}>Complete Appointment Roster</h2>
                        <p style={{ color: 'gray', marginBottom: '25px' }}>Full history and future bookings natively mapped to your profile.</p>

                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Patient Profile</th>
                                    <th>Patient Details & Context</th>
                                    <th>Admin Clearance</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No records found</td></tr> : null}
                                {appointments.map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 'bold' }}>{a.appointment_date}</td>
                                        <td>
                                            <strong style={{ color: 'var(--primary)' }}>{a.patient?.user?.first_name} {a.patient?.user?.last_name}</strong><br />
                                            <small>{a.patient?.phone_number}</small>
                                        </td>
                                        <td style={{ maxWidth: '350px' }}>
                                            <strong>Context:</strong> {a.patient?.personal_details || 'N/A'}<br />
                                            <small>Age: {a.patient?.user?.age} | Gender: {a.patient?.user?.gender}</small>
                                        </td>
                                        <td>{a.is_approved ? <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Pre-Cleared</span> : <span style={{ color: '#f39c12', fontWeight: 'bold' }}>Pending</span>}</td>
                                        <td>
                                            {a.is_approved && (
                                                <button
                                                    className={`btn ${a.status === 'CONSULTED' ? 'btn-primary' : 'btn-outline'}`}
                                                    style={{ padding: '5px 10px', fontSize: '12px', minWidth: '110px' }}
                                                    onClick={() => toggleStatus(a.id, a.status)}
                                                >
                                                    {a.status === 'CONSULTED' ? 'Consulted' : 'Not Consulted'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'view profile' && (
                    <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <h2 style={{ color: '#343a40', margin: 0 }}>My Profile</h2>
                            {!editMode && profile && (
                                <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
                            )}
                        </div>

                        {profileMsg.text && (
                            <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', backgroundColor: profileMsg.type === 'success' ? '#e6f7eb' : '#ffe5e5', color: profileMsg.type === 'success' ? '#28a745' : '#dc3545', border: `1px solid ${profileMsg.type === 'success' ? '#c2eadd' : '#f5c6cb'}` }}>{profileMsg.text}</div>
                        )}

                        {profile ? (
                            <form onSubmit={updateProfile}>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div className="form-group" style={{ flex: '1 1 45%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>First Name</label>
                                        <input type="text" className="form-control" value={profile.first_name || ''} onChange={e => setProfile({ ...profile, first_name: e.target.value })} disabled={!editMode} required />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 45%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Last Name</label>
                                        <input type="text" className="form-control" value={profile.last_name || ''} onChange={e => setProfile({ ...profile, last_name: e.target.value })} disabled={!editMode} required />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 45%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Email ID</label>
                                        <input type="email" className="form-control" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} disabled={!editMode} style={{ backgroundColor: editMode ? '#fff' : '#e9ecef' }} required />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 45%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Age</label>
                                        <input type="number" className="form-control" value={profile.age || ''} onChange={e => setProfile({ ...profile, age: e.target.value })} disabled={!editMode} />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 45%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Gender</label>
                                        <select className="form-control" value={profile.gender || ''} onChange={e => setProfile({ ...profile, gender: e.target.value })} disabled={!editMode}>
                                            <option value="">Select Gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 45%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Department</label>
                                        {editMode ? (
                                            <select className="form-control" value={profile.department_id || ''} onChange={e => setProfile({ ...profile, department_id: e.target.value })} required>
                                                <option value="">Select Department...</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" className="form-control" value={profile.department || ''} disabled style={{ backgroundColor: '#e9ecef' }} />
                                        )}
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 100%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Specialization</label>
                                        <input type="text" className="form-control" value={profile.specialization || ''} onChange={e => setProfile({ ...profile, specialization: e.target.value })} disabled={!editMode} placeholder="e.g. Cardiologist, Neurologist..." />
                                    </div>
                                    <div className="form-group" style={{ flex: '1 1 100%', marginBottom: '15px' }}>
                                        <label style={{ fontWeight: '500' }}>Full Address</label>
                                        <textarea className="form-control" value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} disabled={!editMode} rows="3"></textarea>
                                    </div>
                                </div>

                                {editMode && (
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>Save Changes</button>
                                        <button type="button" className="btn btn-outline" style={{ padding: '10px 20px', borderRadius: '8px' }} onClick={() => { setEditMode(false); fetchProfile(); }}>Cancel</button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <p style={{ color: 'gray' }}>Loading profile details natively...</p>
                        )}
                    </div>
                )}

                {activeTab === 'reset password' && (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: '12px' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Reset Password</h2>
                        <p style={{ color: 'gray', marginBottom: '25px' }}>Rotate your private internal credentials natively here.</p>

                        {pwdMsg.text && (
                            <div style={{
                                padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold',
                                backgroundColor: pwdMsg.type === 'success' ? '#e6f7eb' : '#ffe5e5',
                                color: pwdMsg.type === 'success' ? '#28a745' : '#dc3545',
                                border: `1px solid ${pwdMsg.type === 'success' ? '#c2eadd' : '#f5c6cb'}`
                            }}>{pwdMsg.text}</div>
                        )}

                        <form onSubmit={changePassword}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500' }}>Current Password</label>
                                <input type="password" placeholder="System-generated or existing password" value={pwdData.old_password} onChange={e => setPwdData({ ...pwdData, old_password: e.target.value })} className="form-control" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500' }}>New Secure Password</label>
                                <input type="password" placeholder="Requires numbers and special symbols" value={pwdData.new_password} onChange={e => setPwdData({ ...pwdData, new_password: e.target.value })} className="form-control" minLength="8" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label style={{ fontWeight: '500' }}>Confirm New Password</label>
                                <input type="password" placeholder="Re-enter new password" value={pwdData.confirm_password} onChange={e => setPwdData({ ...pwdData, confirm_password: e.target.value })} className="form-control" minLength="8" required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px' }}>Submit</button>
                        </form>
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
