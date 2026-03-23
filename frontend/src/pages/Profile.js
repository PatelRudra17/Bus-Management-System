import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Save, Shield, Camera } from 'lucide-react';
import { authAPI } from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      updateUser(formData);
      toast.success('Profile updated successfully! ✨');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully! 🔒');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="profile-header animate-fade-in-up">
            <div className="position-relative d-inline-block">
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <button 
                className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle"
                style={{ width: '36px', height: '36px' }}
              >
                <Camera size={16} />
              </button>
            </div>
            <h2 className="mb-2">{user?.name}</h2>
            <p className="mb-2 opacity-75">{user?.email}</p>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>

          <div className="card animate-fade-in-up animate-delay-1 mb-4">
            <div className="card-header border-0">
              <div className="d-flex gap-3">
                <button
                  className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={18} className="me-2" />
                  Profile
                </button>
                <button
                  className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield size={18} className="me-2" />
                  Security
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'profile' && (
            <div className="card animate-fade-in-up">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center gap-2">
                      <User size={18} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center gap-2">
                      <Mail size={18} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center gap-2">
                      <Phone size={18} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card animate-fade-in-up">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="stat-icon mx-auto" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)' }}>
                    <Shield size={28} />
                  </div>
                  <h4 className="mt-3 mb-1">Change Password</h4>
                  <p className="text-muted">Update your password to keep your account secure</p>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center gap-2">
                      <Lock size={18} />
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2">
                        <Lock size={18} />
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2">
                        <Lock size={18} />
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <div className="alert alert-info mb-4">
                    <div className="d-flex align-items-start gap-3">
                      <Shield size={24} className="flex-shrink-0 mt-1" />
                      <div>
                        <strong>Password Tips:</strong>
                        <ul className="mb-0 mt-2">
                          <li>Use at least 8 characters</li>
                          <li>Include numbers and symbols</li>
                          <li>Don't reuse old passwords</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center gap-2"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
