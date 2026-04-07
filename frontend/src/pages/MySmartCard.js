import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MySmartCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const MySmartCard = () => {
  const [card, setCard] = useState(null);
  const [travelHistory, setTravelHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    fetchCardData();
  }, []);

  const fetchCardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const [cardRes, travelRes, transRes] = await Promise.all([
        axios.get(`${API_URL}/cards/my-card`, config),
        axios.get(`${API_URL}/cards/travel-history`, config),
        axios.get(`${API_URL}/cards/transactions`, config)
      ]);

      setCard(cardRes.data.data);
      setTravelHistory(travelRes.data.data || []);
      setTransactions(transRes.data.data || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching card data:', error);
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!rechargeAmount || rechargeAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setRecharging(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/cards/recharge`,
        { amount: parseFloat(rechargeAmount) },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('Recharge successful!');
      setRechargeAmount('');
      fetchCardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Recharge failed');
    } finally {
      setRecharging(false);
    }
  };

  if (loading) {
    return (
      <div className="my-card-page">
        <div className="container text-center" style={{ paddingTop: '150px' }}>
          <div className="spinner-border text-white" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white mt-3 fs-5">Loading your smart card...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="my-card-page">
        <div className="container" style={{ paddingTop: '120px' }}>
          <div className="card border-0 shadow-lg text-center" style={{ borderRadius: '20px', padding: '60px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎴</div>
            <h2 style={{ color: '#2d3748', fontWeight: '800', marginBottom: '15px' }}>No Smart Card Found</h2>
            <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '30px' }}>
              You haven't applied for a smart card yet. Apply now to enjoy cashless travel!
            </p>
            <Link to="/apply-smart-card" className="btn-modern-primary" style={{ margin: '0 auto' }}>
              Apply for Smart Card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-card-page">
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Smart Card Display */}
        <div className="row mb-4">
          <div className="col-lg-6 mx-auto">
            <div className="smart-card-display">
              <div className="card-header-row">
                <div className="card-title-section">
                  <h5>🚌 Smart Bus Card</h5>
                  <small>Valid until: {new Date(card.expiryDate).toLocaleDateString()}</small>
                </div>
                <div className={`card-status-badge status-${card.status}`}>
                  {card.status}
                </div>
              </div>

              <div className="card-photo-section">
                <img
                  src={card.verification.photo || '/default-avatar.png'}
                  alt="Card"
                  className="card-photo"
                />
                <div className="card-details">
                  <div className="card-number">{card.cardNumber}</div>
                  <div className="verification-status">
                    {card.verification.aadhaarVerified && card.verification.panVerified ? (
                      <><span>✓</span> Verified</>
                    ) : (
                      <><span>⏳</span> Verification Pending</>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-bottom-row">
                <div className="balance-display">
                  <div className="balance-label">Balance</div>
                  <div className="balance-amount">₹{card.balance.toFixed(2)}</div>
                </div>
                <div className="trips-display">
                  <div className="trips-label">Trips</div>
                  <div className="trips-count">{card.stats.totalTrips}</div>
                </div>
              </div>

              {card.concessionType !== 'none' && (
                <div className="concession-badge">
                  🎫 {card.concessionType.toUpperCase()} - {card.concessionPercentage}% OFF
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recharge Section */}
        <div className="row mb-4">
          <div className="col-lg-8 mx-auto">
            <div className="recharge-card">
              <div className="recharge-title">Quick Recharge</div>
              <form onSubmit={handleRecharge}>
                <input
                  type="number"
                  className="recharge-input"
                  placeholder="Enter amount (₹)"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  min="1"
                />
                <div className="quick-amounts">
                  <button type="button" className="quick-amount-btn" onClick={() => setRechargeAmount('100')}>₹100</button>
                  <button type="button" className="quick-amount-btn" onClick={() => setRechargeAmount('200')}>₹200</button>
                  <button type="button" className="quick-amount-btn" onClick={() => setRechargeAmount('500')}>₹500</button>
                  <button type="button" className="quick-amount-btn" onClick={() => setRechargeAmount('1000')}>₹1000</button>
                  <button type="button" className="quick-amount-btn" onClick={() => setRechargeAmount('2000')}>₹2000</button>
                </div>
                <button type="submit" className="recharge-btn" disabled={recharging}>
                  {recharging ? '⏳ Processing...' : '💳 Recharge Now'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="modern-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={`tab-btn ${activeTab === 'travel' ? 'active' : ''}`} onClick={() => setActiveTab('travel')}>
            🚌 Travel History
          </button>
          <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            💰 Transactions
          </button>
          <button className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`} onClick={() => setActiveTab('safety')}>
            🛡️ Safety
          </button>
        </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Spent</div>
                <div className="stat-value">₹{card.stats.totalSpent.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Trips</div>
                <div className="stat-value">{card.stats.totalTrips}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Last Used</div>
                <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                  {card.stats.lastUsed ? new Date(card.stats.lastUsed).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>

            <div className="travel-table">
              <table>
                <thead>
                  <tr>
                    <th>Detail</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Card Number</strong></td>
                    <td>{card.cardNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>Aadhaar</strong></td>
                    <td>
                      {card.verification.aadhaarNumber.replace(/\d(?=\d{4})/g, 'X')}
                      {card.verification.aadhaarVerified && <span className="status-badge status-completed ms-2">Verified</span>}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>PAN</strong></td>
                    <td>
                      {card.verification.panNumber}
                      {card.verification.panVerified && <span className="status-badge status-completed ms-2">Verified</span>}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Issued Date</strong></td>
                    <td>{card.issuedDate ? new Date(card.issuedDate).toLocaleDateString() : 'Pending'}</td>
                  </tr>
                  <tr>
                    <td><strong>Expiry Date</strong></td>
                    <td>{card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Travel History Tab */}
        {activeTab === 'travel' && (
          <div>
            {travelHistory.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">🚌</div>
                <div className="no-data-text">No travel history yet</div>
                <p>Start your first journey with your smart card!</p>
              </div>
            ) : (
              <div className="travel-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Route</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Fare</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {travelHistory.map((trip) => (
                      <tr key={trip._id}>
                        <td>{new Date(trip.boardingPoint.timestamp).toLocaleString()}</td>
                        <td><strong>{trip.routeId?.name || 'N/A'}</strong></td>
                        <td>{trip.boardingPoint.stopName}</td>
                        <td>{trip.alightingPoint?.stopName || '-'}</td>
                        <td><strong>₹{trip.fare.finalFare.toFixed(2)}</strong></td>
                        <td>
                          <span className={`status-badge ${trip.status === 'completed' ? 'status-completed' : 'status-ongoing'}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="card">
            <div className="card-header">
              <h5>Transaction History</h5>
            </div>
            <div className="card-body">
              {!transactions.activityLog || transactions.activityLog.length === 0 ? (
                <p className="text-muted text-center">No transactions yet</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Amount</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.activityLog.map((log, index) => (
                        <tr key={index}>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td><span className="badge bg-info">{log.action}</span></td>
                          <td>{log.amount ? `₹ ${log.amount}` : '-'}</td>
                          <td>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header bg-danger text-white">
                  <h5>Emergency Contacts</h5>
                </div>
                <div className="card-body">
                  {card.safetyFeatures.emergencyContacts.length === 0 ? (
                    <p className="text-muted">No emergency contacts added</p>
                  ) : (
                    <ul className="list-group">
                      {card.safetyFeatures.emergencyContacts.map((contact, index) => (
                        <li key={index} className="list-group-item">
                          <strong>{contact.name}</strong> ({contact.relationship})<br />
                          <small>{contact.phone}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link to="/card-settings" className="btn btn-primary btn-sm mt-3">
                    Manage Contacts
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h5>Safety Features</h5>
                </div>
                <div className="card-body">
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={card.safetyFeatures.sosEnabled}
                      disabled
                    />
                    <label className="form-check-label">
                      SOS Panic Button
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={card.safetyFeatures.familyTrackingEnabled}
                      disabled
                    />
                    <label className="form-check-label">
                      Family Tracking
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={card.safetyFeatures.nightTravelAlert}
                      disabled
                    />
                    <label className="form-check-label">
                      Night Travel Alert
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={card.safetyFeatures.womenOnlyZone}
                      disabled
                    />
                    <label className="form-check-label">
                      Women-Only Zone
                    </label>
                  </div>
                  <Link to="/card-settings" className="btn btn-primary btn-sm mt-3">
                    Update Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MySmartCard;
