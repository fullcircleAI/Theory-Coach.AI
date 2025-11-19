import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MinimalRouterTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    console.log('=== MINIMAL ROUTER TEST ===');
    console.log('Current location:', location.pathname);
    console.log('Navigate function:', navigate);
    console.log('Navigate function type:', typeof navigate);
    
    // Test direct navigation
    console.log('Attempting navigation to /test-route...');
    navigate('/test-route');
    console.log('Navigation call completed');
    console.log('=== END MINIMAL ROUTER TEST ===');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'red',
      color: 'white',
      padding: '20px',
      zIndex: 99999,
      borderRadius: '8px',
      border: '3px solid yellow'
    }}>
      <h3>🚨 MINIMAL TEST</h3>
      <p>Location: {location.pathname}</p>
      <p>Navigate: {typeof navigate}</p>
      <button 
        onClick={handleClick}
        style={{
          background: 'yellow',
          color: 'black',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        MINIMAL NAVIGATE TEST
      </button>
    </div>
  );
};






