import React, { useState, useEffect } from 'react';
import ShipCard from './components/ShipCard';
import DarkShipMap from './components/DarkShipMap';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [darkShips, setDarkShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

      if (!response.ok) {
        // Use dummy Arctic data if no files found
        const dummyData = createArcticDummyData();
        setDarkShips(dummyData.dark_ships);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setDarkShips(data.dark_ships || []);

    } catch (err) {
      console.log('No backend data found, using dummy Arctic data');
      const dummyData = createArcticDummyData();
      setDarkShips(dummyData.dark_ships);
    } finally {
      setLoading(false);
    }
  };

  const createArcticDummyData = () => ({
    dark_ships: [
      {
        lat: 69.2348,
        lon: -105.4562,
        confidence: 0.943,
        target_vessel: "ARCTIC SHADOW",
        target_mmsi: 316054321,
        reason: "Gap: 72.3 hours in Northwest Passage shipping lane",
        status: "DARK_SHIP_CONFIRMED",
        gap_start_time: "2025-09-18T14:35:02Z",
        gap_end_time: "2025-09-21T14:53:47Z",
        last_lat: 69.8234,
        last_lon: -107.2341,
        next_lat: 69.2348,
        next_lon: -105.4562,
        distance_km: 185.4
      },
      {
        lat: 70.1234,
        lon: -108.7865,
        confidence: 0.887,
        target_vessel: "NORTHERN GHOST",
        target_mmsi: 316098765,
        reason: "Distance jump: 450.7 km, Transponder disabled in Beaufort Sea",
        status: "DARK_SHIP_CONFIRMED",
        gap_start_time: "2025-09-19T08:22:15Z",
        gap_end_time: "2025-09-20T19:45:33Z",
        last_lat: 71.4567,
        last_lon: -112.3456,
        next_lat: 70.1234,
        next_lon: -108.7865,
        distance_km: 450.7
      },
      {
        lat: 68.7654,
        lon: -140.2341,
        confidence: 0.812,
        target_vessel: "UNKNOWN VESSEL",
        target_mmsi: 0,
        reason: "Unidentified vessel detected in Beaufort Sea, no AIS response",
        status: "ORPHAN_DETECTION",
        gap_start_time: null,
        gap_end_time: null
      },
      {
        lat: 69.4567,
        lon: -133.8901,
        confidence: 0.756,
        target_vessel: "ICE RUNNER",
        target_mmsi: 316012345,
        reason: "Gap: 48.7 hours, last seen near Tuktoyaktuk shipping lanes",
        status: "DARK_SHIP_CONFIRMED",
        gap_start_time: "2025-09-17T23:12:44Z",
        gap_end_time: "2025-09-20T00:05:18Z",
        last_lat: 69.1234,
        last_lon: -135.6789,
        next_lat: 69.4567,
        next_lon: -133.8901,
        distance_km: 215.3
      },
      {
        lat: 74.0123,
        lon: -110.5678,
        confidence: 0.923,
        target_vessel: "PHANTOM FISHER",
        target_mmsi: 316087654,
        reason: "Gap: 96.2 hours, impossible speed through Northwest Passage",
        status: "DARK_SHIP_CONFIRMED",
        gap_start_time: "2025-09-16T12:45:22Z",
        gap_end_time: "2025-09-20T12:57:11Z",
        last_lat: 72.8765,
        last_lon: -115.4321,
        next_lat: 74.0123,
        next_lon: -110.5678,
        distance_km: 523.8
      },
      {
        lat: 68.3456,
        lon: -125.6789,
        confidence: 0.689,
        target_vessel: "ARCTIC WANDERER",
        target_mmsi: 316065432,
        reason: "Transponder disabled for 38.4 hours in Amundsen Gulf",
        status: "DARK_SHIP_CONFIRMED",
        gap_start_time: "2025-09-19T16:33:55Z",
        gap_end_time: "2025-09-21T06:57:12Z",
        last_lat: 68.9876,
        last_lon: -128.3456,
        next_lat: 68.3456,
        next_lon: -125.6789,
        distance_km: 287.6
      }
    ]
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading Arctic dark ship detections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h1>Error Loading Dark Ship Data</h1>
        <p>{error}</p>
        <button onClick={loadDarkShipData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="arctic-watch-app">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <h1>Arctic Watch</h1>
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
                  <div className="stat-label">Confidence > 80%</div>
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