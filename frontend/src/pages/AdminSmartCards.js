import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AdminSmartCards = () => {
  const [cards, setCards] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      const [cardsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/cards/admin/all?status=${filter === 'all' ? '' : filter}`, config),
        axios.get(`${API_URL}/cards/admin/statistics`, config)
      ]);

      setCards(cardsRes.data.data);
      setStatistics(statsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleVerifyCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to verify and activate this card?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/cards/admin/${cardId}/verify`,
        { aadhaarVerified: true, panVerified: true, status: 'active' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('Card verified and activated successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify card');
    }
  };

  const handleBlockCard = async (cardId, action, reason = '') => {
    const confirmMsg = action === 'block'
      ? 'Are you sure you want to block this card?'
      : 'Are you sure you want to unblock this card?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/cards/admin/${cardId}/block`,
        { action, reason },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert(`Card ${action}ed successfully`);
      setSelectedCard(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} card`);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'warning',
      'active': 'success',
      'blocked': 'danger',
      'suspended': 'secondary',
      'expired': 'dark'
    };
    return <span className={`badge bg-${colors[status]}`}>{status.toUpperCase()}</span>;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ marginTop: '100px', marginBottom: '40px' }}>
      <div className="mb-4">
        <h1 className="display-5 fw-bold">Smart Card Management</h1>
        <p className="text-muted fs-5">Manage all smart cards - Verify Aadhaar/PAN, Block/Unblock cards</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h6>Total Cards</h6>
                <h2>{statistics.totalCards}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h6>Active Cards</h6>
                <h2>{statistics.activeCards}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h6>Pending</h6>
                <h2>{statistics.pendingCards}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <h6>Blocked</h6>
                <h2>{statistics.blockedCards}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h6>Total Balance</h6>
                <h4>₹ {statistics.totalBalance.toFixed(2)}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-secondary text-white">
              <div className="card-body">
                <h6>Total Trips</h6>
                <h4>{statistics.totalTrips}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-dark text-white">
              <div className="card-body">
                <h6>Total Revenue</h6>
                <h4>₹ {statistics.totalRevenue.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button
              className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Cards
            </button>
            <button
              className={`btn btn-outline-warning ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`btn btn-outline-success ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`btn btn-outline-danger ${filter === 'blocked' ? 'active' : ''}`}
              onClick={() => setFilter('blocked')}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="card">
        <div className="card-header">
          <h5>Smart Cards ({cards.length})</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Card Number</th>
                  <th>User</th>
                  <th>Aadhaar</th>
                  <th>PAN</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">No cards found</td>
                  </tr>
                ) : (
                  cards.map((card) => (
                    <tr key={card._id}>
                      <td><strong>{card.cardNumber}</strong></td>
                      <td>
                        {card.userId?.name}<br />
                        <small className="text-muted">{card.userId?.email}</small>
                      </td>
                      <td>{card.verification.aadhaarNumber.replace(/\d(?=\d{4})/g, 'X')}</td>
                      <td>{card.verification.panNumber}</td>
                      <td>₹ {card.balance.toFixed(2)}</td>
                      <td>{getStatusBadge(card.status)}</td>
                      <td>
                        {card.verification.aadhaarVerified && card.verification.panVerified ? (
                          <span className="badge bg-success">Verified</span>
                        ) : (
                          <span className="badge bg-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-info"
                            onClick={() => setSelectedCard(card)}
                          >
                            View
                          </button>
                          {card.status === 'pending' && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleVerifyCard(card._id)}
                            >
                              Verify
                            </button>
                          )}
                          {card.status === 'active' && (
                            <button
                              className="btn btn-danger"
                              onClick={() => handleBlockCard(card._id, 'block', 'Admin blocked')}
                            >
                              Block
                            </button>
                          )}
                          {card.status === 'blocked' && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleBlockCard(card._id, 'unblock')}
                            >
                              Unblock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Card Details Modal */}
      {selectedCard && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Card Details - {selectedCard.cardNumber}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCard(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>User Information</h6>
                    <p><strong>Name:</strong> {selectedCard.userId?.name}</p>
                    <p><strong>Email:</strong> {selectedCard.userId?.email}</p>
                    <p><strong>Phone:</strong> {selectedCard.userId?.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Card Information</h6>
                    <p><strong>Status:</strong> {getStatusBadge(selectedCard.status)}</p>
                    <p><strong>Balance:</strong> ₹ {selectedCard.balance.toFixed(2)}</p>
                    <p><strong>Total Trips:</strong> {selectedCard.stats.totalTrips}</p>
                  </div>
                </div>

                <hr />

                <h6>Verification</h6>
                <p><strong>Aadhaar:</strong> {selectedCard.verification.aadhaarNumber}
                  {selectedCard.verification.aadhaarVerified && <span className="badge bg-success ms-2">Verified</span>}
                </p>
                <p><strong>PAN:</strong> {selectedCard.verification.panNumber}
                  {selectedCard.verification.panVerified && <span className="badge bg-success ms-2">Verified</span>}
                </p>

                {selectedCard.concessionType !== 'none' && (
                  <>
                    <hr />
                    <h6>Concession</h6>
                    <p><strong>Type:</strong> {selectedCard.concessionType.toUpperCase()}</p>
                    <p><strong>Discount:</strong> {selectedCard.concessionPercentage}%</p>
                  </>
                )}

                <hr />

                <h6>Safety Features</h6>
                <ul>
                  <li>SOS Enabled: {selectedCard.safetyFeatures.sosEnabled ? 'Yes' : 'No'}</li>
                  <li>Family Tracking: {selectedCard.safetyFeatures.familyTrackingEnabled ? 'Yes' : 'No'}</li>
                  <li>Night Alert: {selectedCard.safetyFeatures.nightTravelAlert ? 'Yes' : 'No'}</li>
                  <li>Women Zone: {selectedCard.safetyFeatures.womenOnlyZone ? 'Yes' : 'No'}</li>
                  <li>Emergency Contacts: {selectedCard.safetyFeatures.emergencyContacts.length}</li>
                </ul>

                {selectedCard.blacklisted.isBlacklisted && (
                  <>
                    <hr />
                    <div className="alert alert-danger">
                      <h6>Blacklisted</h6>
                      <p><strong>Reason:</strong> {selectedCard.blacklisted.reason}</p>
                      <p><strong>Date:</strong> {new Date(selectedCard.blacklisted.blacklistedDate).toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCard(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSmartCards;
