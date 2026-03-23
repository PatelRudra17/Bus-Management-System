import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Bell, Check, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await userAPI.getNotifications();
      setNotifications(res.data.notifications);
    } catch (error) {
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await userAPI.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => userAPI.markNotificationRead(n._id))
      );
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Error marking all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-success" size={20} />;
      case 'warning': return <AlertTriangle className="text-warning" size={20} />;
      case 'error': return <AlertCircle className="text-danger" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Bell size={28} className="me-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="badge bg-danger ms-2">{unreadCount}</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button className="btn btn-outline-primary" onClick={markAllAsRead}>
            <Check size={16} className="me-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="alert alert-info">
          <h5>No notifications</h5>
          <p>You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="list-group">
          {notifications.map(notification => (
            <div 
              key={notification._id}
              className={`list-group-item ${!notification.read ? 'bg-light' : ''}`}
              style={{ borderLeft: notification.read ? 'none' : '4px solid #3182ce' }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-start">
                  <div className="me-3 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <h6 className="mb-1">{notification.title}</h6>
                    <p className="mb-1">{notification.message}</p>
                    <small className="text-muted">
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
                {!notification.read && (
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => markAsRead(notification._id)}
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
