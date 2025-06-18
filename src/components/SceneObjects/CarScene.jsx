import { Canvas } from '@react-three/fiber';
import { Environment, Loader, Stats } from '@react-three/drei';
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
          {/* Car model with position, rotation, and fixed scale */}
          <Car 
            position={carPosition}
            rotation={carRotation}
            scale={0.5}
          />
          <Environment preset="city" />
        </Suspense>
        
        {showStats && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
}