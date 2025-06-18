import './App.css'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Loader, Stats } from '@react-three/drei'
import { Car } from './components/SceneObjects/Car'
import { Suspense, useState, useEffect } from 'react'

// Replace the box fallback with an empty component
function LoadingFallback() {
  return null // Remove the cube completely
}

function App() {
  const [showStats, setShowStats] = useState(false)
  
  // Properly set up event listener with useEffect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 's') setShowStats(prev => !prev)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, []) // Empty dependency array ensures this only runs once on mount

  return (
    <div className="canvas-container">
      {/* Map as background */}
      <div className="map-container">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2942.2492307924954!2d88.41613032704139!3d22.517278472864987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0273f58b9feec5%3A0x30f8067b73c45d8!2sHeritage%20Institute%20of%20Technology%2C%20Kolkata!5e0!3m2!1sen!2sin!4v1750274539317!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      
      {/* Canvas overlay with transparent background */}
      <div className="canvas-overlay">
        <Canvas 
          shadows 
          camera={{ 
            position: [0.8, 0.5, 0.8],
            fov: 55,
            near: 0.1, 
            far: 100
          }}
          gl={{ 
            antialias: true,
            alpha: true, // Enable transparency
            preserveDrawingBuffer: true
          }}
          dpr={[1, 2]}
        >
          {/* No background color */}
          
          {/* Lighting setup */}
          <ambientLight intensity={0.8} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-10, 10, 5]} intensity={0.5} />
          <directionalLight position={[0, -10, 0]} intensity={0.25} />
          
          <Suspense fallback={<LoadingFallback />}>
            {/* Position the car closer to the camera */}
            <Car 
              position={[0, -0.15, 0]}
              rotation={[0, Math.PI / 4, 0]}
              scale={0.5} // Changed from 2.0 to 0.5 to make the car smaller
            />
            <Environment preset="city" />
          </Suspense>
          
          <OrbitControls 
            target={[0, 0, 0]} 
            enableDamping 
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={10}
          />
          
          {showStats && <Stats />}
        </Canvas>
        <Loader />
      </div>
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Use mouse to rotate car view</p>
        <p>Scroll to zoom in/out</p>
      </div>
    </div>
  )
}

export default App
