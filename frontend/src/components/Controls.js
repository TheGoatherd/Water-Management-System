import React from 'react';
import './Controls.css';

function Controls({ mode, setMode, darkMode }) {
  return (
    <div className={`controls ${darkMode ? 'dark' : ''}`}>
      <div className="controls-container">
        <div className="buttons">
        <button 
          className={`control-btn ${mode === 'view' ? 'active' : ''}`}
          onClick={() => setMode('view')}
        >
          <span className="btn-icon">👁️</span>
          <span className="btn-text">View Mode</span>
        </button>
        <button 
          className={`control-btn ${mode === 'addTank' ? 'active' : ''}`}
          onClick={() => setMode('addTank')}
        >
          <span className="btn-icon">🚰</span>
          <span className="btn-text">Add Tank</span>
        </button>
        <button 
          className={`control-btn ${mode === 'addHome' ? 'active' : ''}`}
          onClick={() => setMode('addHome')}
        >
          <span className="btn-icon">🏠</span>
          <span className="btn-text">Place Home</span>
        </button>
        <button 
          className={`control-btn ${mode === 'drawLine' ? 'active' : ''}`}
          onClick={() => setMode('drawLine')}
        >
          <span className="btn-icon">🔗</span>
          <span className="btn-text">Connect Line</span>
        </button>
        <button 
          className={`control-btn delete-btn ${mode === 'delete' ? 'active' : ''}`}
          onClick={() => setMode('delete')}
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">Delete Mode</span>
        </button>
        <button 
          className="control-btn reset-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset the entire system? This will delete all tanks and homes.')) {
              fetch('http://localhost:5000/api/reset', { method: 'POST' })
                .then(res => res.json())
                .then(() => window.location.reload())
                .catch(err => console.error('Reset failed:', err));
            }
          }}
        >
          <span className="btn-icon">🔄</span>
          <span className="btn-text">Reset System</span>
        </button>
        </div>
      </div>
    </div>
  );
}

export default Controls;
