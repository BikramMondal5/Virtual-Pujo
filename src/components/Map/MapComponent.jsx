import { useRef, useEffect } from 'react';
import '../../styles/MapComponent.css';

export default function MapComponent({ 
  mapCenter, 
  mapZoom, 
  mapScale, 
  mapRotation
}) {
  const mapContainerRef = useRef(null);

  // Generate Google Maps iframe URL with controls enabled
  const generateMapUrl = () => {
    // Using the standard Google Maps embed URL with zoom controls enabled
    return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${mapCenter.lat},${mapCenter.lng}&zoom=${mapZoom}&maptype=roadmap`;
  };

  // Calculate transform style for map rotation
  const mapTransform = `rotate(${mapRotation}deg)`;

  return (
    <div 
      className="map-container" 
      ref={mapContainerRef}
    >
      <div 
        className="map-transform-container"
        style={{ 
          transform: mapTransform,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <iframe 
          src={generateMapUrl()}
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}