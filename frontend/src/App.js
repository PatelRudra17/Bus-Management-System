import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

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
import ApplySmartCard from './pages/ApplySmartCard';
import MySmartCard from './pages/MySmartCard';
import ReportIncident from './pages/ReportIncident';
import AdminSmartCards from './pages/AdminSmartCards';
import KYCVerification from './pages/KYCVerification';

const MainLayout = ({ children }) => (
  <>
    <Sidebar />
    <Navbar />
    <main className="main-content">
      {children}
    </main>
  </>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<MainLayout><PrivateRoute><Dashboard /></PrivateRoute></MainLayout>} />
              <Route path="/user-dashboard" element={<MainLayout><PrivateRoute><UserDashboard /></PrivateRoute></MainLayout>} />
              <Route path="/apply-pass" element={<MainLayout><PrivateRoute><ApplyPass /></PrivateRoute></MainLayout>} />
              <Route path="/book-ticket" element={<MainLayout><PrivateRoute><BookTicket /></PrivateRoute></MainLayout>} />
              <Route path="/my-applications" element={<MainLayout><PrivateRoute><MyApplications /></PrivateRoute></MainLayout>} />
              <Route path="/my-passes" element={<MainLayout><PrivateRoute><MyPasses /></PrivateRoute></MainLayout>} />
              <Route path="/profile" element={<MainLayout><PrivateRoute><Profile /></PrivateRoute></MainLayout>} />
              <Route path="/notifications" element={<MainLayout><PrivateRoute><Notifications /></PrivateRoute></MainLayout>} />

              <Route path="/apply-smart-card" element={<MainLayout><PrivateRoute><ApplySmartCard /></PrivateRoute></MainLayout>} />
              <Route path="/my-card" element={<MainLayout><PrivateRoute><MySmartCard /></PrivateRoute></MainLayout>} />
              <Route path="/report-incident" element={<MainLayout><PrivateRoute><ReportIncident /></PrivateRoute></MainLayout>} />
              <Route path="/kyc-verification" element={<MainLayout><PrivateRoute roles={['user']}><KYCVerification /></PrivateRoute></MainLayout>} />

              <Route path="/admin/users" element={<MainLayout><PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute></MainLayout>} />
              <Route path="/admin/applications" element={<MainLayout><PrivateRoute roles={['admin']}><AdminApplications /></PrivateRoute></MainLayout>} />
              <Route path="/admin/routes" element={<MainLayout><PrivateRoute roles={['admin']}><AdminRoutes /></PrivateRoute></MainLayout>} />
              <Route path="/admin/payments" element={<MainLayout><PrivateRoute roles={['admin']}><AdminPayments /></PrivateRoute></MainLayout>} />
              <Route path="/admin/reports" element={<MainLayout><PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute></MainLayout>} />
              <Route path="/admin/analytics" element={<MainLayout><PrivateRoute roles={['admin']}><AnalyticsDashboard /></PrivateRoute></MainLayout>} />
              <Route path="/admin/smart-cards" element={<MainLayout><PrivateRoute roles={['admin']}><AdminSmartCards /></PrivateRoute></MainLayout>} />
              <Route path="/verify-pass" element={<MainLayout><PrivateRoute roles={['admin']}><QRVerification /></PrivateRoute></MainLayout>} />
              <Route path="/verification-history" element={<MainLayout><PrivateRoute roles={['admin']}><VerificationHistory /></PrivateRoute></MainLayout>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
