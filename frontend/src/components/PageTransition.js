import React, { useEffect, useState } from 'react';

const PageTransition = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div 
      className={`page-transition ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.5s ease'
      }}
    >
      {children}
    </div>
  );
};

export const StaggerContainer = ({ children, className = '', staggerDelay = 100 }) => {
  return (
    <div className={`stagger-enter ${className}`}>
      {React.Children.map(children, (child, index) => (
        <div style={{ animationDelay: `${index * staggerDelay}ms` }}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default PageTransition;
