import { Canvas } from '@react-three/fiber';
import { Environment, Loader, Stats, OrbitControls, ContactShadows, Grid } from '@react-three/drei';
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
  return (
    <div className="car-scene-container">
      <Canvas 
        shadows 
        camera={{ 
          position: [2, 1.5, 3], // Closer camera position for a better view of the car
          fov: 40,
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
          {/* City model with increased scale */}
          <City 
            position={[0, -0.5, 0]} 
            scale={0.03} // Increased from 0.01 to 0.03 (3x larger)
            rotation={[0, Math.PI / 4, 0]} 
          />
          
          {/* Car model with position, rotation, and fixed scale */}
          <Car 
            position={carPosition}
            rotation={carRotation}
            scale={3.0} // Further increased scale for better visibility
          />
          {/* Enhanced shadow beneath the car */}
          <ContactShadows
            position={[0, 0.35, 0]}
            opacity={0.8}
            scale={8}
            blur={0.8}
            far={0.15}
            resolution={512}
            color="#000000"
          />
          {/* Add a grid for better spatial reference */}
          <Grid 
            infiniteGrid 
            fadeDistance={50} 
            fadeStrength={1.5}
            cellSize={1}
            cellThickness={0.6}
            sectionSize={5}
            sectionThickness={1.2}
            sectionColor="#2080ff"
            cellColor="#6080ff"
          />
          <Environment preset="sunset" />
        </Suspense>
        
        {/* Add orbital controls to allow rotation of the car view with mouse */}
        <OrbitControls 
          minDistance={2} 
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