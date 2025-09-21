import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced dark ship icon with status indication
const createDarkShipIcon = (confidence, status, isSelected = false) => {
  const getStatusColor = () => {
    switch (status) {
      case 'DARK_SHIP_CONFIRMED': return confidence > 0.8 ? '#dc2626' : '#ea580c';
      case 'ORPHAN_DETECTION': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const color = getStatusColor();
  const size = isSelected ? 24 : (confidence > 0.8 ? 20 : confidence > 0.6 ? 18 : 16);
  const pulseAnimation = isSelected ? 'animation: pulse 2s infinite;' : '';

  return L.divIcon({
    className: 'dark-ship-marker',
    html: `<div style="
      background-color: ${color};
      border: ${isSelected ? '3px' : '2px'} solid #ffffff;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      box-shadow: 0 ${isSelected ? '4px 12px' : '2px 8px'} rgba(0,0,0,${isSelected ? '0.4' : '0.3'});
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.floor(size * 0.5)}px;
      color: white;
      font-weight: bold;
      ${pulseAnimation}
      position: relative;
    ">
      ${status === 'ORPHAN_DETECTION' ? '❓' : '🚢'}
      ${isSelected ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #10b981; border-radius: 50%; border: 1px solid white;"></div>' : ''}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Component to center map on selected ship
const MapCenterController = ({ selectedShip, darkShips }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedShip !== null && darkShips[selectedShip]) {
      const ship = darkShips[selectedShip];
      map.setView([ship.lat, ship.lon], 8, { animate: true });
    }
  }, [selectedShip, darkShips, map]);

  return null;
};

const DarkShipMap = ({ darkShips, selectedShip, onShipSelect }) => {
  // Center map on Canadian Arctic
  const arcticCenter = [69.5, -105.0];
  const mapZoom = 5;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={arcticCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Base map layer - using OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Arctic Ice/Ocean overlay for better context */}
        <TileLayer
          attribution='ESRI'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          opacity={0.3}
        />

        {/* Map controllers */}
        <MapCenterController selectedShip={selectedShip} darkShips={darkShips} />

        {/* Dark ship markers */}
        {darkShips.map((ship, index) => {
          const isSelected = selectedShip === index;

          return (
            <React.Fragment key={index}>
              {/* Main ship marker */}
              <Marker
                position={[ship.lat, ship.lon]}
                icon={createDarkShipIcon(ship.confidence, ship.status, isSelected)}
                eventHandlers={{
                  click: () => {
                    if (onShipSelect) onShipSelect(index);
                  }
                }}
              >
                <Popup maxWidth={300} minWidth={250}>
                  <div className="popup-content">
                    <h3 className="popup-title">
                      {ship.lat.toFixed(6)}°N, {Math.abs(ship.lon).toFixed(6)}°W
                    </h3>
                  </div>
                </Popup>
              </Marker>

              {/* AIS Gap Visualization - use real gap coordinates */}
              {ship.status === 'DARK_SHIP_CONFIRMED' && ship.last_lat && ship.last_lon && ship.next_lat && ship.next_lon && (
                <>
                  {/* Gap start marker (last known AIS position) */}
                  <Marker
                    position={[ship.last_lat, ship.last_lon]}
                    icon={L.divIcon({
                      className: 'gap-start-marker',
                      html: `<div style="
                        background-color: #ff4444;
                        border: 2px solid #ffffff;
                        border-radius: 50%;
                        width: 12px;
                        height: 12px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                      "></div>`,
                      iconSize: [12, 12],
                      iconAnchor: [6, 6]
                    })}
                  >
                    <Popup>
                      <div>
                        <strong>AIS Signal Lost</strong><br/>
                        Last known position<br/>
                        {ship.gap_start_time && new Date(ship.gap_start_time).toLocaleString()}
                      </div>
                    </Popup>
                  </Marker>

                  {/* Tracking line showing suspected route */}
                  <Polyline
                    positions={[[ship.last_lat, ship.last_lon], [ship.next_lat, ship.next_lon]]}
                    pathOptions={{
                      color: '#ff4444',
                      weight: 3,
                      opacity: 0.7,
                      dashArray: '10, 10'
                    }}
                  />

                  {/* Current position marker (where ship reappeared) */}
                  <Marker
                    position={[ship.next_lat, ship.next_lon]}
                    icon={L.divIcon({
                      className: 'gap-end-marker',
                      html: `<div style="
                        background-color: #44ff44;
                        border: 2px solid #ffffff;
                        border-radius: 50%;
                        width: 12px;
                        height: 12px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                      "></div>`,
                      iconSize: [12, 12],
                      iconAnchor: [6, 6]
                    })}
                  >
                    <Popup>
                      <div>
                        <strong>AIS Signal Restored</strong><br/>
                        Ship reappeared here<br/>
                        {ship.gap_end_time && new Date(ship.gap_end_time).toLocaleString()}<br/>
                        <strong>Gap distance:</strong> {ship.distance_km}km
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* Highlight selected ship */}
              {isSelected && (
                <Circle
                  center={[ship.lat, ship.lon]}
                  radius={8000}
                  pathOptions={{
                    color: '#007bff',
                    fillColor: '#007bff',
                    fillOpacity: 0.1,
                    weight: 3,
                    opacity: 0.8
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map legend */}
      <div className="map-legend">
        <h4>🗺️ Legend</h4>
        <div className="legend-item">
          <div className="legend-marker high"></div>
          <span>High Confidence (80%+)</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker medium"></div>
          <span>Medium Confidence (60-80%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker low"></div>
          <span>Low Confidence (&lt;60%)</span>
        </div>
      </div>

      {/* Map info */}
      <div className="map-info">
        <div className="info-item">
          <strong>Region:</strong> Canadian Arctic
        </div>
        <div className="info-item">
          <strong>Ships Detected:</strong> {darkShips.length}
        </div>
        <div className="info-item">
          <strong>Coverage:</strong> Northwest Passage & Beaufort Sea
        </div>
      </div>
    </div>
  );
};

export default DarkShipMap;