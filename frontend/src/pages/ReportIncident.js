import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ReportIncident.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    busId: '',
    incidentType: 'harassment',
    severity: 'medium',
    description: '',
    incidentTime: '',
    location: {
      stopName: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stopName') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, stopName: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/incidents/report`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('Incident reported successfully. Authorities have been notified.');
      navigate('/my-incidents');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    low: 'severity-low',
    medium: 'severity-medium',
    high: 'severity-high',
    critical: 'severity-critical'
  };

  return (
    <div className="report-incident-page">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 className="report-header-title">Report an Incident</h1>
            <p className="report-header-subtitle">Your identity is protected. All reports are taken seriously.</p>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="emergency-banner">
          <div className="emergency-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <strong>Emergency?</strong> If this is an active emergency, press the SOS button on your smart card or call emergency services immediately.
          </div>
        </div>

        {/* Form Card */}
        <div className="report-card">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Incident Details */}
            <div className="report-section-header">
              <span className="report-section-num">1</span>
              <h2 className="report-section-title">Incident Details</h2>
            </div>

            <div className="report-form-group">
              <label className="report-label">Bus ID / Number *</label>
              <input
                type="text"
                className="report-input"
                name="busId"
                value={formData.busId}
                onChange={handleChange}
                placeholder="e.g., BUS001 or MH-12-AB-1234"
                required
              />
            </div>

            <div className="report-row">
              <div className="report-form-group">
                <label className="report-label">Incident Type *</label>
                <select
                  className="report-input"
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleChange}
                  required
                >
                  <option value="harassment">Harassment</option>
                  <option value="theft">Theft</option>
                  <option value="accident">Accident</option>
                  <option value="medical_emergency">Medical Emergency</option>
                  <option value="misbehavior">Misbehavior</option>
                  <option value="fare_evasion">Fare Evasion</option>
                  <option value="property_damage">Property Damage</option>
                  <option value="safety_concern">Safety Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="report-form-group">
                <label className="report-label">Severity *</label>
                <div className="severity-options">
                  {['low', 'medium', 'high', 'critical'].map(level => (
                    <label
                      key={level}
                      className={`severity-chip ${severityColors[level]} ${formData.severity === level ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={level}
                        checked={formData.severity === level}
                        onChange={handleChange}
                      />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: When & Where */}
            <div className="report-section-header">
              <span className="report-section-num">2</span>
              <h2 className="report-section-title">When & Where</h2>
            </div>

            <div className="report-row">
              <div className="report-form-group">
                <label className="report-label">Incident Time *</label>
                <input
                  type="datetime-local"
                  className="report-input"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="report-form-group">
                <label className="report-label">Location (Stop Name)</label>
                <input
                  type="text"
                  className="report-input"
                  name="stopName"
                  value={formData.location.stopName}
                  onChange={handleChange}
                  placeholder="e.g., Central Station"
                />
              </div>
            </div>

            {/* Section 3: Description */}
            <div className="report-section-header">
              <span className="report-section-num">3</span>
              <h2 className="report-section-title">Description</h2>
            </div>

            <div className="report-form-group">
              <label className="report-label">What happened? *</label>
              <textarea
                className="report-input report-textarea"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide a detailed description of what happened..."
                required
              ></textarea>
              <p className="report-hint">Include as many details as possible: what happened, who was involved, witnesses, etc.</p>
            </div>

            {/* What happens next */}
            <div className="report-info-box">
              <div className="info-box-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
                What happens next?
              </div>
              <ul className="info-box-list">
                <li>Your report will be logged with timestamp and your card details</li>
                <li>Bus logs will be pulled to identify other passengers</li>
                <li>CCTV footage will be secured for 90 days</li>
                <li>Authorities will be notified based on severity</li>
                <li>You'll receive updates on the investigation</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="report-actions">
              <button
                type="submit"
                className="report-btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="report-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
              <button
                type="button"
                className="report-btn-cancel"
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

export default ReportIncident;
