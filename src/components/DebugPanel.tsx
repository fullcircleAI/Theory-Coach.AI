import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const DebugPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  useEffect(() => {
    addLog('DebugPanel mounted');
    addLog(`Current location: ${location.pathname}`);
    addLog(`Navigate function type: ${typeof navigate}`);
  }, [location.pathname, navigate]);

  const testBasicNavigation = () => {
    addLog('Testing basic navigation...');
    try {
      navigate('/test-route');
      addLog('Navigation called successfully');
    } catch (error) {
      addLog(`Navigation error: ${error}`);
    }
  };

  const testExistingRoute = () => {
    addLog('Testing existing route /tests...');
    try {
      navigate('/tests');
      addLog('Navigation to /tests called successfully');
    } catch (error) {
      addLog(`Navigation error: ${error}`);
    }
  };

  const testBackNavigation = () => {
    addLog('Testing back navigation...');
    try {
      navigate(-1);
      addLog('Back navigation called successfully');
    } catch (error) {
      addLog(`Back navigation error: ${error}`);
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      width: '400px',
      maxHeight: '500px',
      background: 'black',
      color: 'lime',
      padding: '15px',
      zIndex: 99999,
      borderRadius: '8px',
      border: '2px solid lime',
      fontFamily: 'monospace',
      fontSize: '12px',
      overflow: 'auto'
    }}>
      <h3 style={{color: 'yellow', margin: '0 0 10px 0'}}>🔧 DEBUG PANEL</h3>
      
      <div style={{marginBottom: '10px'}}>
        <strong>Current Location:</strong> {location.pathname}
      </div>
      
      <div style={{marginBottom: '10px'}}>
        <strong>Navigate Function:</strong> {typeof navigate}
      </div>
      
      <div style={{marginBottom: '15px'}}>
        <button 
          onClick={testBasicNavigation}
          style={{
            background: 'lime',
            color: 'black',
            border: 'none',
            padding: '5px 10px',
            margin: '2px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Test /test-route
        </button>
        
        <button 
          onClick={testExistingRoute}
          style={{
            background: 'cyan',
            color: 'black',
            border: 'none',
            padding: '5px 10px',
            margin: '2px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Test /tests
        </button>
        
        <button 
          onClick={testBackNavigation}
          style={{
            background: 'orange',
            color: 'black',
            border: 'none',
            padding: '5px 10px',
            margin: '2px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Test Back
        </button>
        
        <button 
          onClick={clearLogs}
          style={{
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            margin: '2px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Clear
        </button>
      </div>
      
      <div style={{borderTop: '1px solid lime', paddingTop: '10px'}}>
        <strong>Debug Logs:</strong>
        <div style={{maxHeight: '200px', overflow: 'auto', marginTop: '5px'}}>
          {debugLogs.map((log, index) => (
            <div key={index} style={{marginBottom: '2px', wordBreak: 'break-all'}}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};







