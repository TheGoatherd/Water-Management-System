import React, { useState, useEffect } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import Controls from './components/Controls';

function App() {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState('view'); // view, addTank, addHome, drawLine, delete
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Error fetching data:', err));
  }, []);

  const addTank = async (sectorId, x, y) => {
    const res = await fetch(`http://localhost:5000/api/sectors/${sectorId}/tanks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y })
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || 'Failed to add tank');
      return;
    }
    
    const tank = await res.json();
    setData(prev => ({
      ...prev,
      sectors: prev.sectors.map(s => 
        s.id === sectorId ? { ...s, tanks: [...s.tanks, tank] } : s
      )
    }));
  };

  const addHome = async (sectorId, x, y) => {
    // Check if sector already has 5 homes
    const sector = data.sectors.find(s => s.id === sectorId);
    if (sector && sector.homes.length >= 5) {
      alert('Maximum 5 houses per residential zone reached!');
      return;
    }
    
    const res = await fetch(`http://localhost:5000/api/sectors/${sectorId}/homes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, tankId: null })
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || 'Failed to add home');
      return;
    }
    
    const home = await res.json();
    setData(prev => ({
      ...prev,
      sectors: prev.sectors.map(s => 
        s.id === sectorId ? { ...s, homes: [...s.homes, home] } : s
      )
    }));
  };

  const connectHomeToTank = async (sectorId, homeId, tankId) => {
    const res = await fetch(`http://localhost:5000/api/sectors/${sectorId}/homes/${homeId}/connect`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tankId })
    });
    
    if (res.ok) {
      const home = await res.json();
      setData(prev => ({
        ...prev,
        sectors: prev.sectors.map(s => 
          s.id === sectorId ? { 
            ...s, 
            homes: s.homes.map(h => h.id === homeId ? home : h)
          } : s
        )
      }));
    }
  };

  const deleteTank = async (sectorId, tankId) => {
    const res = await fetch(`http://localhost:5000/api/sectors/${sectorId}/tanks/${tankId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      setData(prev => ({
        ...prev,
        sectors: prev.sectors.map(s => 
          s.id === sectorId ? { 
            ...s, 
            tanks: s.tanks.filter(t => t.id !== tankId),
            homes: s.homes.filter(h => h.tankId !== tankId)
          } : s
        )
      }));
    }
  };

  const deleteHome = async (sectorId, homeId) => {
    const res = await fetch(`http://localhost:5000/api/sectors/${sectorId}/homes/${homeId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      setData(prev => ({
        ...prev,
        sectors: prev.sectors.map(s => 
          s.id === sectorId ? { ...s, homes: s.homes.filter(h => h.id !== homeId) } : s
        )
      }));
    }
  };



  const updatePosition = async (sectorId, type, id, x, y) => {
    const res = await fetch(`http://localhost:5000/api/sectors/${sectorId}/${type}s/${id}/position`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y })
    });
    
    if (res.ok) {
      setData(prev => ({
        ...prev,
        sectors: prev.sectors.map(s => {
          if (s.id === sectorId) {
            if (type === 'tank') {
              return { ...s, tanks: s.tanks.map(t => t.id === id ? { ...t, x, y } : t) };
            } else if (type === 'home') {
              return { ...s, homes: s.homes.map(h => h.id === id ? { ...h, x, y } : h) };
            }
          }
          return s;
        })
      }));
    }
  };

  if (!data) return (
    <div className={`loading ${darkMode ? 'dark' : ''}`}>
      <div className="loading-spinner"></div>
      <p>Loading Water Management System...</p>
    </div>
  );

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="icon">💧</span>
            Water Management System
          </h1>
          <button 
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <Controls mode={mode} setMode={setMode} darkMode={darkMode} />
      
      <Canvas 
        data={data} 
        mode={mode}
        darkMode={darkMode}
        onAddTank={addTank}
        onAddHome={addHome}
        onDeleteTank={deleteTank}
        onDeleteHome={deleteHome}
        onUpdatePosition={updatePosition}
        onConnectHomeToTank={connectHomeToTank}
      />
    </div>
  );
}

export default App;
