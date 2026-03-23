import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import ApplyPass from './pages/ApplyPass';
import BookTicket from './pages/BookTicket';
import MyApplications from './pages/MyApplications';
import MyPasses from './pages/MyPasses';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminUsers from './pages/AdminUsers';
import AdminApplications from './pages/AdminApplications';
import AdminRoutes from './pages/AdminRoutes';
import AdminPayments from './pages/AdminPayments';
import AdminReports from './pages/AdminReports';
import QRVerification from './pages/QRVerification';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import VerificationHistory from './pages/VerificationHistory';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<><Navbar /><PrivateRoute><Dashboard /></PrivateRoute></>} />
              <Route path="/user-dashboard" element={<><Navbar /><PrivateRoute><UserDashboard /></PrivateRoute></>} />
              <Route path="/apply-pass" element={<><Navbar /><PrivateRoute><ApplyPass /></PrivateRoute></>} />
              <Route path="/book-ticket" element={<><Navbar /><PrivateRoute><BookTicket /></PrivateRoute></>} />
              <Route path="/my-applications" element={<><Navbar /><PrivateRoute><MyApplications /></PrivateRoute></>} />
              <Route path="/my-passes" element={<><Navbar /><PrivateRoute><MyPasses /></PrivateRoute></>} />
              <Route path="/profile" element={<><Navbar /><PrivateRoute><Profile /></PrivateRoute></>} />
              <Route path="/notifications" element={<><Navbar /><PrivateRoute><Notifications /></PrivateRoute></>} />
              
              <Route path="/admin/users" element={<><Navbar /><PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute></>} />
              <Route path="/admin/applications" element={<><Navbar /><PrivateRoute roles={['admin']}><AdminApplications /></PrivateRoute></>} />
              <Route path="/admin/routes" element={<><Navbar /><PrivateRoute roles={['admin']}><AdminRoutes /></PrivateRoute></>} />
              <Route path="/admin/payments" element={<><Navbar /><PrivateRoute roles={['admin']}><AdminPayments /></PrivateRoute></>} />
              <Route path="/admin/reports" element={<><Navbar /><PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute></>} />
              <Route path="/admin/analytics" element={<><Navbar /><PrivateRoute roles={['admin']}><AnalyticsDashboard /></PrivateRoute></>} />
              <Route path="/verify-pass" element={<><Navbar /><PrivateRoute roles={['admin']}><QRVerification /></PrivateRoute></>} />
              <Route path="/verification-history" element={<><Navbar /><PrivateRoute roles={['admin']}><VerificationHistory /></PrivateRoute></>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
