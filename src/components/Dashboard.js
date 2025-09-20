import React from 'react';

const Dashboard = ({ results, onImageSelect }) => {
  if (!results) {
    return <div>No results available</div>;
  }

  const { summary, darkShips, images } = results;

  return (
    <div className="dashboard">
      {/* Summary Statistics */}
      <div className="summary-stats">
        <h2>📊 Detection Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{summary.images_analyzed}</div>
            <div className="stat-label">Images Analyzed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{summary.total_ships}</div>
            <div className="stat-label">Total Ships</div>
          </div>
          <div className="stat-card alert-stat">
            <div className="stat-number">{summary.dark_ships}</div>
            <div className="stat-label">Dark Ships</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{summary.ais_ships}</div>
            <div className="stat-label">Ships with AIS</div>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="image-grid">
        <h3>🛰️ Satellite Images</h3>
        <div className="images-container">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              index={index}
              onClick={() => onImageSelect(image)}
            />
          ))}
        </div>
      </div>

      {/* Dark Ships List */}
      {darkShips && darkShips.length > 0 && (
        <div className="dark-ships-list">
          <h3>🚨 Confirmed Dark Ships</h3>
          <div className="ships-list">
            {darkShips.slice(0, 5).map((ship, index) => (
              <DarkShipSummary key={index} ship={ship} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ImageCard = ({ image, index, onClick }) => {
  return (
    <div className="image-card" onClick={onClick}>
      <div className="image-placeholder">
        🛰️ Satellite Image {index + 1}
        <br />
        <small>Click to view details</small>
      </div>
      <div className="image-info">
        <h4>{image.filename || `Image ${index + 1}`}</h4>
        <div className="ship-count">
          <span className="dark-ships">
            🚨 {image.darkShipCount} Dark Ships
          </span>
          <span className="total-ships">
            📊 {image.totalShipCount} Total Ships
          </span>
        </div>
        <p>Click to examine detections</p>
      </div>
    </div>
  );
};

const DarkShipSummary = ({ ship }) => {
  return (
    <div className="ship-card">
      <div className="ship-header">
        <div>
          <div className="ship-title">
            🚢 {ship.target_vessel || 'Unknown Vessel'}
          </div>
          <div className="ship-coordinates">
            📍 {ship.lat?.toFixed(6)}°N, {ship.lon?.toFixed(6)}°W
          </div>
          <div className="ship-confidence">
            🎯 Confidence: {((ship.confidence || 0) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="ship-meta">
          {ship.target_mmsi && ship.target_mmsi !== 0 && (
            <p><strong>MMSI:</strong> {ship.target_mmsi}</p>
          )}
          <p><strong>Status:</strong> Dark Ship</p>
        </div>
      </div>
      {ship.reason && (
        <div className="ship-reason">
          <strong>Detection Reason:</strong> {ship.reason}
        </div>
      )}
    </div>
  );
};

export default Dashboard;