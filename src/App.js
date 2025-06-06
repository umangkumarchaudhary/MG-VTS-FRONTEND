import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobControllerDashboard from './components/JobControllerDashboard';
import LoginRegister from './components/UserAuth';
import TechnicianDashboard from './components/TechnicianDashboard/TechnicianDashboard';


import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/job-controller-dashboard" element={<JobControllerDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/technician-dashboard" element = {<TechnicianDashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
