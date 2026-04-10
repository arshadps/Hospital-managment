import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';

const AdminDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [appointments, setAppointments] = useState([]);

    // Form States
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [docData, setDocData] = useState({ email: '', username: '', first_name: '', last_name: '', address: '', gender: '', age: '', department_id: '' });
    const [docMsg, setDocMsg] = useState({ text: '', type: '' });

    // Inline Department Edit States
    const [editDeptId, setEditDeptId] = useState(null);
    const [editDeptData, setEditDeptData] = useState({ name: '', description: '' });
    
    // UI Layout Configuration
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        api.get('doctors/').then(res => setDoctors(res.data));
        api.get('patients/').then(res => setPatients(res.data));
        api.get('departments/').then(res => setDepartments(res.data));
        api.get('appointments/').then(res => setAppointments(res.data));
    };

    const approveDoctor = async (id) => {
        await api.patch(`doctors/${id}/`, { is_approved: true });
        fetchData();
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to completely delete this user and all their records?')) {
            await api.delete(`users/${userId}/`);
            fetchData();
        }
    };

    const addDepartment = async (e) => {
        e.preventDefault();
        await api.post('departments/', newDept);
        setNewDept({ name: '', description: '' });
        fetchData();
    };

    const adminAddDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('doctors/admin-register/', docData);
            setDocMsg({ text: 'Doctor successfully added and pre-approved!', type: 'success' });
            setDocData({ email: '', username: '', first_name: '', last_name: '', address: '', gender: '', age: '', department_id: '' });
            fetchData();
        } catch (err) {
            let errMsg = 'Failed to embed doctor.';
            if (err.response?.data) {
                const firstKey = Object.keys(err.response.data)[0];
                errMsg = `${firstKey}: ${err.response.data[firstKey]?.[0] || err.response.data[firstKey]}`;
            }
            setDocMsg({ text: errMsg, type: 'danger' });
        }
    };

    const deleteDepartment = async (id) => {
        if (window.confirm('WARNING: Deleting this department may affect doctors assigned to it. Proceed?')) {
            await api.delete(`departments/${id}/`);
            fetchData();
        }
    };

    const handleEditClick = (dept) => {
        setEditDeptId(dept.id);
        setEditDeptData({ name: dept.name, description: dept.description });
        setActiveTab('edit department');
    };

    const saveEditDepartment = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`departments/${editDeptId}/`, editDeptData);
            setEditDeptId(null);
            fetchData();
            setActiveTab('departments');
        } catch (err) {
            alert('Failed to update department.');
        }
    };

    const updateAppointment = async (id, data) => {
        await api.patch(`appointments/${id}/`, data);
        fetchData();
    };

    const deleteAppointment = async (id) => {
        if (window.confirm('Cancel and delete this appointment?')) {
            await api.delete(`appointments/${id}/`);
            fetchData();
        }
    }

    const pendingDoctors = doctors.filter(d => !d.is_approved);
    const pendingAppointments = appointments.filter(a => !a.is_approved).length;

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="dashboard-sidebar" style={{ width: '260px', backgroundColor: '#212529', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
                <div className="sidebar-header">
                    <h2 style={{ color: '#fff', textAlign: 'center', borderBottom: '1px solid #343a40', paddingBottom: '15px' }}>Admin Portal</h2>
                    <button className="nav-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
                </div>
                <ul className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={{ listStyle: 'none', padding: 0, marginTop: '20px', flex: 1 }}>
                    {['overview', 'doctors', 'patients', 'departments', 'add department', 'appointments'].map(tab => (
                        <li key={tab} style={{ marginBottom: '10px' }}>
                            <button className="btn" style={{ backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : '#ced4da', textAlign: 'left', width: '100%', padding: '12px 15px', borderRadius: '8px', textTransform: 'capitalize', fontWeight: activeTab === tab ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setActiveTab(tab)}>
                                <span>{tab}</span>
                                {tab === 'appointments' && pendingAppointments > 0 && (
                                    <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{pendingAppointments}</span>
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
                        <h2 style={{ marginBottom: '25px', color: '#343a40' }}>System Overview</h2>
                        <div className="stats-row" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                            <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '3rem', color: 'var(--primary)', margin: '10px 0' }}>{doctors.length}</h1>
                                <p style={{ color: '#6c757d', fontWeight: 'bold' }}>Total Doctors</p>
                            </div>
                            <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '3rem', color: '#28a745', margin: '10px 0' }}>{patients.length}</h1>
                                <p style={{ color: '#6c757d', fontWeight: 'bold' }}>Registered Patients</p>
                            </div>
                            <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                                <h1 style={{ fontSize: '3rem', color: '#8e44ad', margin: '10px 0' }}>{appointments.length}</h1>
                                <p style={{ color: '#6c757d', fontWeight: 'bold' }}>Appointments Logged</p>
                            </div>
                        </div>
                        {pendingDoctors.length > 0 && (
                            <div className="card" style={{ marginTop: '30px', borderLeft: '5px solid #f39c12', borderRadius: '12px' }}>
                                <h3 style={{ color: '#d35400' }}>Action Required: Pending Approvals</h3>
                                <p style={{ marginBottom: '15px' }}>There are <strong>{pendingDoctors.length}</strong> doctors waiting for their verification to join the hospital network.</p>
                                <button className="btn btn-primary" onClick={() => setActiveTab('doctors')}>Review Applications Now</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'doctors' && (
                    <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0 }}>Doctor Network Management</h2>
                            <button onClick={() => setActiveTab('add doctor')} className="btn btn-secondary" style={{ fontWeight: 'bold' }}>+ Register New Doctor</button>
                        </div>
                        <table className="styled-table">
                            <thead><tr>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Dept / Specialization</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr></thead>
                            <tbody>
                                {doctors.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>Dr. {d.user?.first_name} {d.user?.last_name}</td>
                                        <td>{d.user?.email}</td>
                                        <td>{d.department?.name} <br /><small style={{ color: 'gray' }}>{d.specialization}</small></td>
                                        <td>{d.is_approved ? <span style={{ color: '#28a745', fontWeight: 'bold', backgroundColor: '#e6f7eb', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Approved</span> : <span style={{ color: '#f39c12', fontWeight: 'bold', backgroundColor: '#fcf3cf', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pending</span>}</td>
                                        <td>
                                            {!d.is_approved && <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '10px' }} onClick={() => approveDoctor(d.id)}>Approve</button>}
                                            <button className="btn" style={{ backgroundColor: '#e74c3c', color: 'white', padding: '6px 12px', fontSize: '13px' }} onClick={() => deleteUser(d.user.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'departments' && (
                    <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                        <h2>Hospital Departments</h2>
                        <p style={{ color: 'gray', marginBottom: '25px' }}>Manage existing hospital wings and organizational categories.</p>
                        <table className="styled-table">
                            <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{d.name}</td>
                                        <td style={{ color: '#6c757d' }}>{d.description}</td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', marginRight: '5px' }} onClick={() => handleEditClick(d)}>Edit</button>
                                            <button className="btn" style={{ backgroundColor: '#e74c3c', color: 'white', padding: '6px 12px', fontSize: '13px' }} onClick={() => deleteDepartment(d.id)}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'add department' && (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '30px' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>Add New Department</h2>
                        <p style={{ color: 'gray', marginBottom: '20px' }}>Establish a new professional wing or medical category in the hospital network.</p>
                        <form onSubmit={(e) => {
                            addDepartment(e);
                            setActiveTab('departments'); // Switch back cleanly upon success
                        }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Department Name</label>
                                <input type="text" className="form-control" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} required placeholder="e.g. Neurology" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Description / Responsibilities</label>
                                <textarea className="form-control" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} rows="4" placeholder="Functional description of this medical wing..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px' }}>Create Department</button>
                        </form>
                    </div>
                )}

                {activeTab === 'edit department' && (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '30px' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>Edit Department</h2>
                        <p style={{ color: 'gray', marginBottom: '20px' }}>Update existing details of this professional wing.</p>
                        <form onSubmit={saveEditDepartment}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Department Name</label>
                                <input type="text" className="form-control" value={editDeptData.name || ''} onChange={e => setEditDeptData({ ...editDeptData, name: e.target.value })} required placeholder="e.g. Neurology" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Description / Responsibilities</label>
                                <textarea className="form-control" value={editDeptData.description || ''} onChange={e => setEditDeptData({ ...editDeptData, description: e.target.value })} rows="4" placeholder="Functional description of this medical wing..."></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px' }}>Save Changes</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px' }} onClick={() => setActiveTab('departments')}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0 }}>Patients Network Management</h2>
                            <a href="/register/patient" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontWeight: 'bold' }}>+ Add Walk-In Patient Flow</a>
                        </div>
                        <table className="styled-table">
                            <thead><tr>
                                <th>Patient ID</th>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Phone & Personal Details</th>
                                <th>Actions</th>
                            </tr></thead>
                            <tbody>
                                {patients.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.patient_id}</td>
                                        <td style={{ fontWeight: '500' }}>{p.user?.first_name} {p.user?.last_name}</td>
                                        <td style={{ color: '#6c757d' }}>{p.user?.email}</td>
                                        <td>{p.phone_number} <br /><small style={{ color: 'gray' }}>{p.personal_details}</small></td>
                                        <td>
                                            <button className="btn" style={{ backgroundColor: '#e74c3c', color: 'white', padding: '6px 12px', fontSize: '13px' }} onClick={() => deleteUser(p.user.id)}>Remove Patient</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="card" style={{ padding: '30px', borderRadius: '12px' }}>
                        <h2 style={{ marginBottom: '5px' }}>Appointment Oversight</h2>
                        <p style={{ color: 'gray', marginBottom: '25px' }}>Monitor schedule flow, dictate approvals, and oversee doctor-patient lifecycle.</p>
                        <table className="styled-table">
                            <thead><tr>
                                <th>Date</th>
                                <th>Patient</th>
                                <th>Assigned Doctor</th>
                                <th>Admin Approval</th>
                                <th>Visit Status</th>
                                <th>Actions</th>
                            </tr></thead>
                            <tbody>
                                {appointments.map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 'bold' }}>{a.appointment_date}</td>
                                        <td style={{ fontWeight: '500' }}>{a.patient?.user?.first_name} {a.patient?.user?.last_name}</td>
                                        <td style={{ color: 'var(--primary)' }}>Dr. {a.doctor?.user?.first_name} {a.doctor?.user?.last_name}</td>
                                        <td>
                                            {!a.is_approved ? (
                                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => updateAppointment(a.id, { is_approved: true })}>Approve Appointment</button>
                                            ) : (
                                                <span style={{ color: '#28a745', fontWeight: 'bold', backgroundColor: '#e6f7eb', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', display: 'inline-block' }}>✓ Approved</span>
                                            )}
                                        </td>
                                        <td>
                                            {a.status === 'CONSULTED' ?
                                                <span style={{ color: '#28a745', fontWeight: 'bold', backgroundColor: '#e6f7eb', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', display: 'inline-block' }}>Consulted</span> :
                                                <span style={{ color: '#f39c12', fontWeight: 'bold', backgroundColor: '#fcf3cf', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', display: 'inline-block' }}>Not Consulted</span>
                                            }
                                        </td>
                                        <td>
                                            <button className="btn" style={{ backgroundColor: '#e74c3c', color: 'white', padding: '6px 12px', fontSize: '12px' }} onClick={() => deleteAppointment(a.id)}>Delete Appointment</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'add doctor' && (
                    <div className="card" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px', borderRadius: '12px' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>Configure New Internal Doctor</h2>
                        <p style={{ color: 'var(--secondary)', marginBottom: '25px' }}>Add a doctor directly to the system. Pre-approved instantly with credentials emailed.</p>
                        {docMsg.text && <div style={{ padding: '12px', borderRadius: '5px', backgroundColor: docMsg.type === 'success' ? '#e6f7eb' : '#ffe5e5', color: docMsg.type === 'success' ? '#28a745' : '#dc3545', marginBottom: '20px' }}>{docMsg.text}</div>}
                        <form onSubmit={adminAddDoctor}>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}><label>First Name</label><input type="text" className="form-control" value={docData.first_name} onChange={e => setDocData({ ...docData, first_name: e.target.value })} required /></div>
                                <div className="form-group" style={{ flex: 1 }}><label>Last Name</label><input type="text" className="form-control" value={docData.last_name} onChange={e => setDocData({ ...docData, last_name: e.target.value })} required /></div>
                            </div>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}><label>Username</label><input type="text" className="form-control" value={docData.username} onChange={e => setDocData({ ...docData, username: e.target.value })} required /></div>
                                <div className="form-group" style={{ flex: 1 }}><label>Email Address</label><input type="email" className="form-control" value={docData.email} onChange={e => setDocData({ ...docData, email: e.target.value })} required /></div>
                            </div>
                            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-group" style={{ flex: 1 }}><label>Age</label><input type="number" min="1" max="120" className="form-control" value={docData.age} onChange={e => setDocData({ ...docData, age: e.target.value })} required /></div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Gender</label>
                                    <select className="form-control" value={docData.gender} onChange={e => setDocData({ ...docData, gender: e.target.value })} required>
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label>Address</label><textarea className="form-control" value={docData.address} onChange={e => setDocData({ ...docData, address: e.target.value })} rows="2" required></textarea></div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>Department / Wing</label>
                                <select className="form-control" value={docData.department_id} onChange={e => setDocData({ ...docData, department_id: e.target.value })} required>
                                    <option value="">Assign Dept</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize: '15px' }}>Add Doctor</button>
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

export default AdminDashboard;
// Ensure no nested component errors

