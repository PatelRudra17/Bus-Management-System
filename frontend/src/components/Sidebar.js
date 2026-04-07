import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  FileText,
  Ticket,
  History,
  CreditCard,
  Wallet,
  AlertTriangle,
  BarChart3,
  Users,
  Route,
  DollarSign,
  QrCode,
  Settings,
  Shield
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const userLinks = [
    { path: '/user-dashboard', label: 'Dashboard', icon: Home },
    { path: '/apply-pass', label: 'Apply Pass', icon: FileText },
    { path: '/book-ticket', label: 'Book Ticket', icon: Ticket },
    { path: '/my-applications', label: 'Applications', icon: History },
    { path: '/my-passes', label: 'My Passes', icon: CreditCard },
    { path: '/my-card', label: 'Smart Card', icon: Wallet },
    { path: '/kyc-verification', label: 'KYC Verify', icon: Shield },
    { path: '/report-incident', label: 'Report Issue', icon: AlertTriangle },
  ];

  const adminLinks = [
    { path: '/admin/analytics', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/routes', label: 'Routes', icon: Route },
    { path: '/admin/payments', label: 'Payments', icon: DollarSign },
    { path: '/admin/smart-cards', label: 'Smart Cards', icon: Wallet },
    { path: '/verify-pass', label: 'QR Verify', icon: QrCode },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚌</div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">BusPass</div>
            <div className="sidebar-logo-subtitle">MANAGEMENT</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {links.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar-link ${isActive(path) ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-link">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
