import { Canvas } from '@react-three/fiber';
import { Environment, Loader, Stats, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { Car } from './Car';
import '../../styles/CarScene.css';

// Empty loading fallback
function LoadingFallback() {
  return null;
}

export default function CarScene({ 
  carPosition, 
  carRotation, 
  showStats = false 
}) {
  return (
    <div className="car-scene-container">
      <Canvas 
        shadows 
        camera={{ 
          position: [0.8, 1.5, 0.8], // Higher camera position to see more of the map
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={1.2} /> {/* Increased intensity for better visibility */}
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.8} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-10, 10, 5]} intensity={0.8} />
        <directionalLight position={[0, -10, 0]} intensity={0.5} />
        
        <Suspense fallback={<LoadingFallback />}>
          {/* Car model with position, rotation, and fixed scale */}
          <Car 
            position={carPosition}
            rotation={carRotation}
            scale={0.5}
          />
          {/* Enhanced shadow beneath the car for better visibility on the map */}
          <ContactShadows
            position={[0, -0.33, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={0.8}
            resolution={256}
            color="#000000"
          />
          <Environment preset="city" />
        </Suspense>
        
        {showStats && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
}