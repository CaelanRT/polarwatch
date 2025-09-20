import React from 'react';

const ImageViewer = ({ imageData, onBack }) => {
  const darkShips = imageData.detections?.filter(d => d.is_dark) || [];

  return (
    <div className="image-viewer">
      <div className="viewer-header">
        <h2>🛰️ {imageData.filename || 'Satellite Image'}</h2>
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="image-display">
        <div className="image-placeholder-large">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛰️</div>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Satellite Image: {imageData.filename}
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>
              In a real deployment, annotated satellite images would appear here
            </div>
            <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
              Red boxes would highlight dark ships, green boxes would show AIS-equipped vessels
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
          <p>
            📊 <strong>{imageData.totalShipCount}</strong> total ships detected |
            🚨 <strong>{imageData.darkShipCount}</strong> dark ships |
            ✅ <strong>{imageData.totalShipCount - imageData.darkShipCount}</strong> with AIS
          </p>
        </div>
      </div>

      {darkShips.length > 0 && (
        <div className="ship-details">
          <h3>🚨 Dark Ships in this Image</h3>
          <div className="ships-list">
            {darkShips.map((ship, index) => (
              <ShipDetailCard key={index} ship={ship} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ShipDetailCard = ({ ship, index }) => {
  return (
    <div className="ship-card">
      <div className="ship-header">
        <div>
          <div className="ship-title">
            🚢 Ship {index + 1}: {ship.target_vessel || 'Unknown Vessel'}
          </div>
          <div className="ship-coordinates">
            📍 Position: {ship.lat?.toFixed(6)}°N, {ship.lon?.toFixed(6)}°W
          </div>
          <div className="ship-confidence">
            🎯 Detection Confidence: {((ship.confidence || 0) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="ship-meta">
          {ship.target_mmsi && ship.target_mmsi !== 0 ? (
            <p><strong>MMSI:</strong> {ship.target_mmsi}</p>
          ) : (
            <p><strong>MMSI:</strong> Unknown</p>
          )}
          <p><strong>Status:</strong> <span style={{ color: '#d32f2f' }}>Dark Ship</span></p>
          <p><strong>AIS Signal:</strong> <span style={{ color: '#d32f2f' }}>None Detected</span></p>
        </div>
      </div>

      {ship.reason && (
        <div className="ship-reason">
          <strong>🔍 Why this is suspicious:</strong> {ship.reason}
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <strong>Analysis:</strong> This vessel was detected in satellite imagery but shows no corresponding
        AIS (Automatic Identification System) signal. This could indicate the vessel is operating with
        disabled transponders, potentially for illegal activities such as unauthorized fishing,
        smuggling, or sanctions evasion.
      </div>
    </div>
  );
};

export default ImageViewer;