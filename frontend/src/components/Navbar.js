import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Menu, X, QrCode, BarChart3, Home, FileText, Users, CreditCard, History, Route, Ticket } from 'lucide-react';
import { userAPI } from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await userAPI.getNotifications();
      setUnreadCount(res.data.notifications.filter(n => !n.read).length);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const userLinks = [
    { path: '/user-dashboard', label: 'Dashboard',   icon: Home },
    { path: '/apply-pass',     label: 'Apply Pass',  icon: FileText },
    { path: '/book-ticket',    label: 'Book Ticket', icon: Ticket },
    { path: '/my-applications',label: 'Applications',icon: History },
    { path: '/my-passes',      label: 'My Passes',   icon: CreditCard },
  ];

  const adminLinks = [
    { path: '/admin/analytics',   label: 'Dashboard',   icon: BarChart3 },
    { path: '/admin/applications',label: 'Applications',icon: FileText },
    { path: '/admin/users',       label: 'Users',       icon: Users },
    { path: '/admin/routes',      label: 'Routes',      icon: Route },
    { path: '/admin/payments',    label: 'Payments',    icon: CreditCard },
    { path: '/verify-pass',       label: 'QR Verify',   icon: QrCode },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <nav className={`navbar navbar-expand-lg ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid px-4">

        {/* ── LOGO ── */}
        <Link className="navbar-brand" to="/">
          <div className="navbar-logo-icon">🚌</div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-title">BusPass</span>
            <span className="navbar-logo-sub">Management</span>
          </div>
        </Link>

        {/* ── MOBILE TOGGLE ── */}
        <button
          className="navbar-toggler border-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={26} color="#fff" /> : <Menu size={26} color="#fff" />}
        </button>

        {/* ── NAV LINKS + RIGHT SIDE ── */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
            {links.map(({ path, label, icon: Icon }) => (
              <li className="nav-item" key={path}>
                <Link
                  className={`nav-link ${isActive(path) ? 'active' : ''}`}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* ── RIGHT ACTIONS ── */}
          <div className="navbar-actions">

            {/* Notifications */}
            <Link to="/notifications" className="navbar-icon-btn" title="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            {/* Profile */}
            <Link to="/profile" className="navbar-icon-btn" title="Profile">
              <User size={20} />
            </Link>

            {/* User chip */}
            <div className="navbar-user-chip">
              <div className="navbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="navbar-username">{user?.name}</span>
            </div>

            {/* Logout */}
            <button className="navbar-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
