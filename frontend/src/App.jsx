import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import PatientRegister from './pages/PatientRegister';
import ResetPassword from './pages/ResetPassword';

import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/doctor" element={<DoctorRegister />} />
          <Route path="/register/patient" element={<PatientRegister />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
