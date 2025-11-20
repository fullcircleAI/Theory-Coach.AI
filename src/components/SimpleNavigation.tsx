import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const SimpleNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path: string) => {
    console.log('Simple navigation clicked:', path);
    navigate(path);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50px',
      right: '10px',
      background: 'blue',
      color: 'white',
      padding: '20px',
      zIndex: 99999,
      borderRadius: '8px'
    }}>
      <h3>Simple Navigation</h3>
      <button onClick={() => handleClick('/')} style={{margin: '5px', padding: '10px'}}>
        Dashboard
      </button>
      <button onClick={() => handleClick('/tests')} style={{margin: '5px', padding: '10px'}}>
        Practice
      </button>
      <button onClick={() => handleClick('/mock-exam')} style={{margin: '5px', padding: '10px'}}>
        Mock Exam
      </button>
      <button onClick={() => handleClick('/settings')} style={{margin: '5px', padding: '10px'}}>
        Settings
      </button>
      <p>Current: {location.pathname}</p>
    </div>
  );
};







