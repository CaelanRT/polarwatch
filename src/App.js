import React, { useState, useEffect } from 'react';
import DarkShipMap from './components/DarkShipMap';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [darkShips, setDarkShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShip, setSelectedShip] = useState(null);
  const [mapView, setMapView] = useState('AIS'); // AIS, SAR, or SATELLITE
  const [currentView, setCurrentView] = useState('tracker'); // 'tracker' or 'dashboard'

  useEffect(() => {
    loadDarkShipData();
  }, []);

  const loadDarkShipData = async () => {
    try {
      setLoading(true);

      // Try to load Arctic dark ship data first
      let response = await fetch('/data/arctic_dark_ships.json');

      if (!response.ok) {
        // Fallback to main dark ship report
        response = await fetch('/data/dark_ship_report.json');
      }

      const data = await response.json();
      setDarkShips(data.dark_ships || []);

    } catch (err) {
      console.log('Backend data failed.');
      
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading Arctic dark ship detections...</p>
      </div>
    );
  }

  return (
    <div className="arctic-watch-app">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <h1>Polar Watch</h1>
        </div>
        <div className="header-right">
          <span className="welcome-text">Welcome, User Name</span>
          <button className="sign-out-btn">🚪 Sign Out</button>
        </div>
      </header>

      <div className="app-layout">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <nav className="sidebar-nav">
            <div
              className={`nav-item ${currentView === 'tracker' ? 'active' : ''}`}
              title="Vessel Tracker"
              onClick={() => setCurrentView('tracker')}
            >🚢</div>
            <div
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              title="Dashboard"
              onClick={() => setCurrentView('dashboard')}
            >📊</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <h1>{currentView === 'dashboard' ? 'Dashboard' : 'Vessel Tracker'}</h1>
          </div>

          {currentView === 'dashboard' ? (
            /* Dashboard View */
            <div className="dashboard-layout">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Threats</h3>
                  <div className="stat-number">{darkShips.length}</div>
                  <div className="stat-label">Active dark ships</div>
                </div>

                <div className="stat-card">
                  <h3>High Risk</h3>
                  <div className="stat-number">{darkShips.filter(s => s.confidence > 0.8).length}</div>
                  <div className="stat-label">Confidence &gt; 80%</div>
                </div>

                <div className="stat-card">
                  <h3>Coverage Area</h3>
                  <div className="stat-number">Arctic</div>
                  <div className="stat-label">Northwest Passage</div>
                </div>

                <div className="stat-card">
                  <h3>Avg Gap Time</h3>
                  <div className="stat-number">
                    {Math.round(darkShips.filter(s => s.gap_start_time && s.gap_end_time)
                      .reduce((acc, ship) => {
                        const hours = (new Date(ship.gap_end_time) - new Date(ship.gap_start_time)) / (1000 * 60 * 60);
                        return acc + hours;
                      }, 0) / darkShips.filter(s => s.gap_start_time && s.gap_end_time).length || 0)}h
                  </div>
                  <div className="stat-label">AIS silence duration</div>
                </div>
              </div>

              <div className="dashboard-content">
                <div className="recent-threats">
                  <h3>Recent Threat Activity</h3>
                  <div className="threat-list">
                    {darkShips.slice(0, 3).map((ship, index) => (
                      <div key={index} className="threat-item">
                        <div className="threat-icon">
                          {ship.status === 'DARK_SHIP_CONFIRMED' ? '🔴' : '🟡'}
                        </div>
                        <div className="threat-details">
                          <div className="threat-vessel">{ship.target_vessel}</div>
                          <div className="threat-reason">{ship.reason}</div>
                        </div>
                        <div className="threat-confidence">{Math.round(ship.confidence * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="system-status">
                  <h3>System Status</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <span className="status-indicator active"></span>
                      <span>AIS Data Feed</span>
                      <span className="status-value">Online</span>
                    </div>
                    <div className="status-item">
                      <span className="status-indicator inactive"></span>
                      <span>SAR Imagery</span>
                      <span className="status-value">Offline</span>
                    </div>
                    <div className="status-item">
                      <span className="status-indicator inactive"></span>
                      <span>Satellite Feed</span>
                      <span className="status-value">Offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Vessel Tracker View */
            <div className="content-layout">
            {/* Vessel Risk Assessment Panel */}
            <div className="vessel-panel">
              <div className="panel-header">
                <h2>Vessel Risk Assessment</h2>
                <div className="panel-filters">
                  <select className="filter-select">
                    <option>All Levels</option>
                  </select>
                  <select className="filter-select">
                    <option>Arctic</option>
                  </select>
                </div>
              </div>

              <div className="vessel-list">
                {darkShips.length > 0 ? (
                  darkShips.map((ship, index) => (
                    <div
                      key={index}
                      className={`vessel-card ${selectedShip === index ? 'selected' : ''}`}
                      onClick={() => setSelectedShip(index)}
                    >
                      <div className="vessel-header">
                        <h3>{ship.target_vessel}</h3>
                        <span className="mmsi">MMSI: {ship.target_mmsi || 'Unknown'}</span>
                      </div>

                      <div className="vessel-stats">
                        <div className="stat">
                          <span className="stat-label">Gap Duration</span>
                          <span className="stat-value">
                            {ship.gap_start_time && ship.gap_end_time ?
                              (() => {
                                const start = new Date(ship.gap_start_time);
                                const end = new Date(ship.gap_end_time);
                                const diffHours = Math.round((end - start) / (1000 * 60 * 60));
                                const days = Math.floor(diffHours / 24);
                                const hours = diffHours % 24;
                                return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
                              })()
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Risk Score</span>
                          <span className="risk-score">{Math.round(ship.confidence * 100)}/100</span>
                        </div>
                      </div>

                      <div className="vessel-position">
                        <h4>Last Known Position</h4>
                        <p>{ship.lat.toFixed(3)}°, {ship.lon.toFixed(3)}°</p>
                      </div>

                      <div className="vessel-actions">
                        <button className="action-btn primary">Track</button>
                        <button className="action-btn secondary">Details</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-vessels">
                    <p>No vessels detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Maritime Map Panel */}
            <div className="map-panel">
              <div className="map-header">
                <h2>Maritime Map</h2>
                <div className="map-controls">
                  <div className="view-toggles">
                    <button
                      className={`toggle-btn ${mapView === 'AIS' ? 'active' : ''}`}
                      onClick={() => setMapView('AIS')}
                    >
                      📡 AIS TRACKING
                    </button>
                    <button
                      className={`toggle-btn disabled`}
                      disabled
                      title="SAR imagery not available"
                    >
                      🛰️ SAR
                    </button>
                    <button
                      className={`toggle-btn disabled`}
                      disabled
                      title="Satellite imagery not available"
                    >
                      📸 SATELLITE
                    </button>
                  </div>
                  <div className="map-actions">
                    <button className="export-btn">Export ⬇️</button>
                  </div>
                </div>
              </div>

              <div className="map-filters">
                <span>📋 2 Filters | Clear All</span>
                <span>Sort ⬇️</span>
              </div>

              <div className="map-container">
                <DarkShipMap
                  darkShips={darkShips}
                  selectedShip={selectedShip}
                  onShipSelect={setSelectedShip}
                />
              </div>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;