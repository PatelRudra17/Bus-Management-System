import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'table':
        return (
          <div key={index} className="d-flex gap-3 p-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <div className="skeleton skeleton-avatar"></div>
            <div className="flex-grow-1">
              <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            </div>
            <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '12px' }}></div>
          </div>
        );
      
      case 'stat':
        return (
          <div key={index} className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="skeleton" style={{ width: '70px', height: '70px', borderRadius: '20px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '50px' }}></div>
            </div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
        );
      
      case 'form':
        return (
          <div key={index} className="mb-4">
            <div className="skeleton skeleton-text" style={{ width: '120px', height: '20px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '50px', borderRadius: '14px' }}></div>
          </div>
        );
      
      case 'profile':
        return (
          <div key={index} className="text-center">
            <div className="skeleton mx-auto mb-3" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
            <div className="skeleton mx-auto skeleton-title"></div>
            <div className="skeleton mx-auto skeleton-text" style={{ width: '200px', marginBottom: '2rem' }}></div>
            <div className="row g-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="col-md-6">
                  <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '16px' }}></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'card':
      default:
        return (
          <div key={index} className="card" style={{ minHeight: '200px' }}>
            <div className="card-body">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
              <div className="d-flex gap-2 mt-4">
                <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '12px' }}></div>
                <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '12px' }}></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={type === 'stat' ? 'dashboard-stats' : type === 'card' ? 'row g-4' : ''}>
      {Array.from({ length: count }, (_, i) => renderSkeleton(i))}
    </div>
  );
};

export default LoadingSkeleton;
