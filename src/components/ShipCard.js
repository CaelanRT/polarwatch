import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom dark ship icon for individual cards
const createShipIcon = (confidence) => {
  const color = confidence > 0.8 ? '#000000' : confidence > 0.6 ? '#666666' : '#999999';
  const size = 20;

  return L.divIcon({
    className: 'ship-card-marker',
    html: `<div style="
      background-color: ${color};
      border: 3px solid #ffffff;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    ">🚢</div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Gap start position icon (where ship went dark)
const createGapStartIcon = () => {
  return L.divIcon({
    className: 'gap-start-marker',
    html: `<div style="
      background-color: #ff3b30;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: white;
      font-weight: bold;
    ">📍</div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Gap end position icon (where ship reappeared)
const createGapEndIcon = () => {
  return L.divIcon({
    className: 'gap-end-marker',
    html: `<div style="
      background-color: #34c759;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: white;
      font-weight: bold;
    ">📍</div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Component to handle map invalidation
const MapInvalidator = () => {
  const map = useMapEvents({
    resize: () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  });
  return null;
};

const ShipCard = ({ ship, shipIndex }) => {
  const mapRef = useRef(null);

  // Calculate zoom level to show gap trajectory (zoomed out to see both points)
  const getZoomLevel = (ship) => {
    // If we have gap data, zoom out to show the trajectory
    if (ship.last_lat && ship.last_lon && ship.next_lat && ship.next_lon) {
      return 6; // Zoom out to show gap trajectory
    }
    // For orphan detections without gaps, use moderate zoom
    return 7;
  };

  // Fix map rendering after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DARK_SHIP_CONFIRMED': return '#dc2626';
      case 'ORPHAN_DETECTION': return '#ea580c';
      default: return '#facc15';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DARK_SHIP_CONFIRMED': return '🔴 Confirmed Dark Ship';
      case 'ORPHAN_DETECTION': return '🟡 Orphan Detection';
      default: return '🟠 Suspicious Activity';
    }
  };

  return (
    <div className="ship-card">
      {/* Card Header */}
      <div className="ship-card-header">
        <div className="ship-card-title">
          <h2>
            <span className="ship-number">TARGET #{shipIndex.toString().padStart(3, '0')}</span>
            {' • '}
            {ship.target_vessel || 'UNKNOWN VESSEL'}
          </h2>
          <div className="ship-card-status">
            <span className={`status-badge ${ship.status === 'DARK_SHIP_CONFIRMED' ? 'confirmed' : 'orphan'}`}>
              {ship.status === 'DARK_SHIP_CONFIRMED' ? 'THREAT CONFIRMED' :
               ship.status === 'ORPHAN_DETECTION' ? 'ORPHAN CONTACT' : 'SUSPICIOUS'}
            </span>
          </div>
        </div>
        <div className="ship-card-confidence">
          <span className={`confidence-badge ${ship.confidence > 0.8 ? 'high' : ship.confidence > 0.6 ? 'medium' : 'low'}`}>
            {(ship.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Map Section */}
      <div className="ship-card-map">
        <MapContainer
          center={[ship.lat, ship.lon]}
          zoom={getZoomLevel(ship)}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          ref={mapRef}
          whenReady={() => {
            // Force map to invalidate size when ready
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize();
              }
            }, 100);
          }}
        >
          {/* Map invalidator for proper rendering */}
          <MapInvalidator />

          {/* Base map layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Ocean overlay for better context */}
          <TileLayer
            attribution='ESRI'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
            opacity={0.4}
          />

          {/* Ship marker */}
          <Marker
            position={[ship.lat, ship.lon]}
            icon={createShipIcon(ship.confidence)}
          />

          {/* Detection confidence circle */}
          <Circle
            center={[ship.lat, ship.lon]}
            radius={ship.confidence * 3000}
            pathOptions={{
              color: ship.confidence > 0.8 ? '#000000' : ship.confidence > 0.6 ? '#666666' : '#999999',
              fillColor: ship.confidence > 0.8 ? '#000000' : ship.confidence > 0.6 ? '#666666' : '#999999',
              fillOpacity: 0.1,
              weight: 2,
              opacity: 0.4
            }}
          />

          {/* AIS Gap Visualization - only show if gap data exists */}
          {ship.last_lat && ship.last_lon && ship.next_lat && ship.next_lon && ship.status === 'DARK_SHIP_CONFIRMED' && (
            <>
              {/* Gap start position (last known position) */}
              <Marker
                position={[ship.last_lat, ship.last_lon]}
                icon={createGapStartIcon()}
              />

              {/* Gap end position (reappearance position) */}
              <Marker
                position={[ship.next_lat, ship.next_lon]}
                icon={createGapEndIcon()}
              />

              {/* Connecting line showing gap trajectory */}
              <Polyline
                positions={[[ship.last_lat, ship.last_lon], [ship.next_lat, ship.next_lon]]}
                pathOptions={{
                  color: '#ff3b30',
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '10, 10'
                }}
              />
            </>
          )}
        </MapContainer>

        {/* Map overlay info */}
        <div className="map-overlay-info">
          <div className="coordinates">
            📍 {ship.lat.toFixed(6)}°N, {Math.abs(ship.lon).toFixed(6)}°W
          </div>
        </div>
      </div>

      {/* Ship Details Section */}
      <div className="ship-card-details">
        <div className="details-grid">
          <div className="detail-item">
            <label>MMSI:</label>
            <span>{ship.target_mmsi || 'Unknown'}</span>
          </div>

          <div className="detail-item">
            <label>Detection Confidence:</label>
            <span className={ship.confidence > 0.8 ? 'high' : ship.confidence > 0.6 ? 'medium' : 'low'}>
              {(ship.confidence * 100).toFixed(1)}%
            </span>
          </div>

          {ship.gap_start_time && (
            <div className="detail-item">
              <label>AIS Gap Start:</label>
              <span>{formatDate(ship.gap_start_time)}</span>
            </div>
          )}

          {ship.gap_end_time && (
            <div className="detail-item">
              <label>AIS Gap End:</label>
              <span>{formatDate(ship.gap_end_time)}</span>
            </div>
          )}

          {ship.distance_km && (
            <div className="detail-item">
              <label>Gap Distance:</label>
              <span>{ship.distance_km.toFixed(1)} km</span>
            </div>
          )}
        </div>

        {/* Threat Assessment Section */}
        <div className="ship-reason-section">
          <label>⚠️ THREAT ASSESSMENT:</label>
          <div className="reason-text">
            {ship.reason}
          </div>
        </div>

        {/* Intelligence Panel tabs for MAXAR/SAR images */}
        <div className="image-panels-placeholder">
          <div className="panel-tabs">
            <button className="panel-tab active">📍 TACTICAL MAP</button>
            <button className="panel-tab disabled">🛰️ OPTICAL INTEL</button>
            <button className="panel-tab disabled">📡 RADAR INTEL</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipCard;