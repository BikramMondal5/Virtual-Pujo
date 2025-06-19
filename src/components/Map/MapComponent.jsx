import { useRef } from 'react';
import '../../styles/MapComponent.css';

export default function MapComponent({ 
  mapRotation,
  mapZoom = 1 // Default to 1 if not provided
}) {
  const mapContainerRef = useRef(null);
  
  // Calculate transform style for map rotation and zoom
  const mapTransform = `rotate(${mapRotation}deg) scale(${mapZoom})`;

  return (
    <div 
      className="map-container" 
      ref={mapContainerRef}
    >
      <div 
        className="map-transform-container"
        style={{ 
          transform: mapTransform,
          transition: 'transform 0.2s ease-out',
          pointerEvents: 'auto' // Enable interaction with iframe
        }}
      >
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1927404.7432972884!2d89.55191878640878!3d22.377675148892948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1750279454996!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}