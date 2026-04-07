import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Search } from 'lucide-react';
import { userAPI } from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="topbar-content">
        <div className="topbar-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search routes, passes..."
            className="search-input"
          />
        </div>

        <div className="topbar-actions">
          <Link to="/notifications" className="topbar-icon-btn" title="Notifications">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Link>

          <Link to="/profile" className="topbar-icon-btn" title="Profile">
            <User size={18} />
          </Link>

          <div className="topbar-user-info">
            <div className="topbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="topbar-user-details">
              <div className="topbar-username">{user?.name}</div>
              <div className="topbar-user-role">{user?.role}</div>
            </div>
          </div>

          <button className="topbar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
