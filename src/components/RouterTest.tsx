import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const RouterTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testNavigation = () => {
    console.log('=== ROUTER TEST ===');
    console.log('Current location:', location.pathname);
    console.log('Navigate function:', typeof navigate);
    
    try {
      navigate('/test-route');
      console.log('Navigation called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
    }
    console.log('=== END ROUTER TEST ===');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '10px',
      background: 'purple',
      color: 'white',
      padding: '20px',
      zIndex: 99999,
      borderRadius: '8px',
      border: '3px solid orange'
    }}>
      <h3>🔧 Router Test</h3>
      <p>Current: {location.pathname}</p>
      <button 
        onClick={testNavigation}
        style={{
          background: 'orange',
          color: 'black',
          padding: '10px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        TEST NAVIGATE TO /test-route
      </button>
      <p style={{fontSize: '12px', marginTop: '10px'}}>
        Check console for debug info
      </p>
    </div>
  );
};
