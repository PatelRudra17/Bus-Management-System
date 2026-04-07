import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ApplySmartCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ApplySmartCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    concessionType: 'none',
    concessionDocument: null,
    photo: null,
    nightTravelAlert: false,
    womenOnlyZone: false,
    familyTrackingEnabled: false,
    emergencyContacts: [{ name: '', phone: '', relationship: '' }]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index][field] = value;
    setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relationship: '' }]
    }));
  };

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      formDataToSend.append('aadhaarNumber', formData.aadhaarNumber);
      formDataToSend.append('panNumber', formData.panNumber);
      formDataToSend.append('concessionType', formData.concessionType);
      formDataToSend.append('nightTravelAlert', formData.nightTravelAlert);
      formDataToSend.append('womenOnlyZone', formData.womenOnlyZone);
      formDataToSend.append('familyTrackingEnabled', formData.familyTrackingEnabled);
      formDataToSend.append('emergencyContacts', JSON.stringify(formData.emergencyContacts));

      if (formData.photo) formDataToSend.append('photo', formData.photo);
      if (formData.concessionDocument) formDataToSend.append('concessionDocument', formData.concessionDocument);

      await axios.post(`${API_URL}/cards/apply`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Smart card application submitted successfully! Verification pending.');
      navigate('/my-card');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply for smart card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-card-page">
      <div className="container smart-card-container">
        {/* Header Banner */}
        <div className="card-header-banner">
          <h1 className="header-title">🎴 Apply for Smart Card</h1>
          <p className="header-subtitle">One card per person - Aadhaar & PAN verified</p>
        </div>

        {/* Main Content Card */}
        <div className="main-card">
          {/* Benefits */}
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <div className="benefit-title">Safety</div>
              <div className="benefit-desc">Verified identity with Aadhaar & PAN</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <div className="benefit-title">Convenience</div>
              <div className="benefit-desc">Tap & travel, no queues</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📍</div>
              <div className="benefit-title">Tracking</div>
              <div className="benefit-desc">Travel history & incident management</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚨</div>
              <div className="benefit-title">Emergency</div>
              <div className="benefit-desc">SOS button & family tracking</div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <div className="benefit-title">Concessions</div>
              <div className="benefit-desc">Student, senior, disabled, women discounts</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Section 1: Identity */}
            <div className="section-header">
              <div className="section-number">1</div>
              <h2 className="section-title">Identity Verification</h2>
            </div>

            <div className="row">
              <div className="col-md-6 form-group-modern">
                <label className="form-label-modern">Aadhaar Number *</label>
                <input
                  type="text"
                  className="form-control-modern"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  pattern="[0-9]{12}"
                  placeholder="Enter 12-digit Aadhaar"
                  required
                />
                <div className="form-hint">ℹ️ Example: 123456789012</div>
              </div>

              <div className="col-md-6 form-group-modern">
                <label className="form-label-modern">PAN Number *</label>
                <input
                  type="text"
                  className="form-control-modern"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  placeholder="e.g., ABCDE1234F"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                <div className="form-hint">ℹ️ Format: 5 letters + 4 digits + 1 letter</div>
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Upload Photo *</label>
              <div className="file-upload-area" onClick={() => document.getElementById('photo').click()}>
                <div className="upload-icon">📤</div>
                <div className="upload-text">Click to upload or drag & drop</div>
                <div className="upload-hint">Photo will be displayed on card (Max 5MB)</div>
                <input
                  id="photo"
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Section 2: Concession */}
            <div className="section-header">
              <div className="section-number">2</div>
              <h2 className="section-title">Concession (Optional)</h2>
            </div>

            <div className="row">
              <div className="col-md-6 form-group-modern">
                <label className="form-label-modern">Concession Type</label>
                <select
                  className="form-control-modern"
                  name="concessionType"
                  value={formData.concessionType}
                  onChange={handleChange}
                >
                  <option value="none">No Concession</option>
                  <option value="student">🎓 Student (50% off)</option>
                  <option value="senior">👴 Senior Citizen (50% off)</option>
                  <option value="disabled">♿ Disabled (75% off)</option>
                  <option value="women">👩 Women (25% off)</option>
                </select>
              </div>

              {formData.concessionType !== 'none' && (
                <div className="col-md-6 form-group-modern">
                  <label className="form-label-modern">Upload Proof</label>
                  <input
                    type="file"
                    className="form-control-modern"
                    name="concessionDocument"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ padding: '12px' }}
                  />
                </div>
              )}
            </div>

            {/* Section 3: Safety */}
            <div className="section-header">
              <div className="section-number">3</div>
              <h2 className="section-title">Safety Features</h2>
            </div>

            <div className="checkbox-card">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="nightTravelAlert"
                  checked={formData.nightTravelAlert}
                  onChange={handleChange}
                />
                <div>
                  <div>🌙 Night Travel Alert</div>
                  <div className="checkbox-desc">Auto SMS to emergency contacts after 9 PM</div>
                </div>
              </label>
            </div>

            <div className="checkbox-card">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="womenOnlyZone"
                  checked={formData.womenOnlyZone}
                  onChange={handleChange}
                />
                <div>
                  <div>👩 Women-Only Zone Tag</div>
                  <div className="checkbox-desc">Priority seat reservation for women</div>
                </div>
              </label>
            </div>

            <div className="checkbox-card">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="familyTrackingEnabled"
                  checked={formData.familyTrackingEnabled}
                  onChange={handleChange}
                />
                <div>
                  <div>📍 Family Tracking App</div>
                  <div className="checkbox-desc">Family can see which bus you boarded</div>
                </div>
              </label>
            </div>

            {/* Section 4: Emergency Contacts */}
            <div className="section-header">
              <div className="section-number">4</div>
              <h2 className="section-title">Emergency Contacts</h2>
            </div>

            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-header">👤 Contact {index + 1}</div>
                <div className="row">
                  <div className="col-md-4 form-group-modern">
                    <label className="form-label-modern">Name</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      placeholder="Enter name"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 form-group-modern">
                    <label className="form-label-modern">Phone</label>
                    <input
                      type="tel"
                      className="form-control-modern"
                      placeholder="Phone number"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 form-group-modern">
                    <label className="form-label-modern">Relationship</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      placeholder="e.g., Father"
                      value={contact.relationship}
                      onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 form-group-modern d-flex align-items-end">
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn-remove w-100"
                        onClick={() => removeContact(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addContact}>
              + Add Another Contact
            </button>

            {/* Submit Buttons */}
            <div className="d-flex gap-3 justify-content-center mt-5">
              <button
                type="submit"
                className="btn-primary-modern"
                disabled={loading}
              >
                {loading ? '⏳ Submitting...' : '✅ Submit Application'}
              </button>
              <button
                type="button"
                className="btn-secondary-modern"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplySmartCard;
