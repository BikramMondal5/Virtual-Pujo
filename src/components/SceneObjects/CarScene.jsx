import { Canvas } from '@react-three/fiber';
import { Environment, Loader, Stats, OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { Car } from './Car';
import { City } from './City';
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
  // Add 15 degrees (in radians) to the car's Y rotation
  const adjustedCarRotation = carRotation.map((rot, index) => {
    // Only adjust the Y rotation (index 1)
    return index === 1 ? rot + (Math.PI / 12) : rot;
  });

  // Define a fixed Y position for the car to ensure it's on the road
  const carFixedPosition = [carPosition[0], 0.05, carPosition[2]]; // Raised the car's Y position from 0 to 0.05

  return (
    <div className="car-scene-container">
      <Canvas 
        shadows  
        camera={{ 
          position: [1.5, 1.2, 2.5], // Adjusted camera position for closer road view
          fov: 45, // Increased field of view for better road visibility
          near: 0.1, 
          far: 100
        }}
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true
        }}
        dpr={[1, 2]}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[10, 10, -5]} 
          intensity={1.8} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-5, 8, 10]} intensity={0.5} />
        <directionalLight position={[0, -5, 0]} intensity={0.4} />
        
        <Suspense fallback={<LoadingFallback />}>
          {/* City model with significantly raised position to bring road right up to the car */}
          <City 
            position={[0, 0.28, 0]} // Final increase to make the road perfectly touch the car wheels
            scale={0.05}
            rotation={[0, Math.PI / 6, 0]} // Adjusted rotation to focus on roads
          />
          
          {/* Car model with fixed Y position and rotated */}
          <Car 
            position={carFixedPosition}
            rotation={adjustedCarRotation}
            scale={1.5}
          />
          {/* Enhanced shadow beneath the car */}
          <ContactShadows
            position={[0, 0, 0]} // Adjusted shadow to be exactly at the contact point
            opacity={0.7}
            scale={8}
            blur={0.8}
            far={0.1}
            resolution={512}
            color="#000000"
          />
          
          <Environment preset="sunset" />
        </Suspense>
        
        {/* Add orbital controls to allow rotation of the car view with mouse */}
        <OrbitControls 
          minDistance={1.5}
          maxDistance={10}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        
        {showStats && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
}