import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Loader, Stats, OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Car } from './Car';
import { City } from './City';
import '../../styles/CarScene.css';
import * as THREE from 'three';

// Empty loading fallback
function LoadingFallback() {
  return null;
}

// Follow Camera Component - handles camera positioning relative to the car
function FollowCamera({ carPosition, carRotation, cameraView = 'close-up', userControllingCamera, carMovementDetected }) {
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastCarMovementRef = useRef(false);
  
  // Define camera offsets for different camera views
  const cameraOffsets = {
    'close-up': {
      position: new THREE.Vector3(0.3, 0.6, -1.2), // Much closer to the car, slightly to the side
      lookAt: new THREE.Vector3(0, 0.3, 0)         // Looking at the car body
    },
    'third-person': {
      position: new THREE.Vector3(0, 1.5, -4), // Behind and above car
      lookAt: new THREE.Vector3(0, 0.5, 2)     // Look ahead of the car
    },
    'first-person': {
      position: new THREE.Vector3(0, 0.8, 0.2), // Inside the car
      lookAt: new THREE.Vector3(0, 0.8, 10)    // Look straight ahead
    },
    'top-down': {
      position: new THREE.Vector3(0, 6, 0),    // Directly above car
      lookAt: new THREE.Vector3(0, 0, 2)       // Looking down and slightly ahead
    }
  };
  
  // Get the current camera offset based on view
  const cameraOffset = cameraOffsets[cameraView];
  
  // Setup smooth camera following with easing
  useFrame(() => {
    if (!carPosition) return;
    
    // Only update camera if:
    // 1. User is not manually controlling camera, OR
    // 2. Car movement was detected (arrow keys pressed)
    if (userControllingCamera && !carMovementDetected && lastCarMovementRef.current === false) {
      return;
    }
    
    // Update the last car movement state
    lastCarMovementRef.current = carMovementDetected;
    
    // Create a matrix to represent car's orientation
    const carMatrix = new THREE.Matrix4();
    carMatrix.makeRotationY(carRotation[1]); // Apply Y-axis rotation
    
    // Transform camera position offset by car's orientation matrix
    const offsetPosition = cameraOffset.position.clone();
    offsetPosition.applyMatrix4(carMatrix);
    
    // Calculate world position by adding transformed offset to car position
    const targetCameraPosition = new THREE.Vector3(
      carPosition[0] + offsetPosition.x,
      carPosition[1] + offsetPosition.y,
      carPosition[2] + offsetPosition.z
    );
    
    // Transform lookAt offset by car's orientation matrix
    const offsetLookAt = cameraOffset.lookAt.clone();
    offsetLookAt.applyMatrix4(carMatrix);
    
    // Calculate world lookAt position
    const targetLookAt = new THREE.Vector3(
      carPosition[0] + offsetLookAt.x,
      carPosition[1] + offsetLookAt.y,
      carPosition[2] + offsetLookAt.z
    );
    
    // Smoothly interpolate camera position (easing effect)
    // Use faster easing for close-up view for more responsive feel
    const easingFactor = (cameraView === 'first-person' || cameraView === 'close-up') ? 0.2 : 0.1;
    cameraPositionRef.current.lerp(targetCameraPosition, easingFactor);
    cameraTargetRef.current.lerp(targetLookAt, easingFactor);
    
    // Update camera position and lookAt
    camera.position.copy(cameraPositionRef.current);
    camera.lookAt(cameraTargetRef.current);
  });
  
  return null; // This component doesn't render anything
}

export default function CarScene({ 
  carPosition, 
  carRotation, 
  showStats = false,
  cameraView = 'third-person', // new prop for camera view
  carMovementDetected = false  // new prop to detect car movement from arrow keys
}) {
  // Add 15 degrees (in radians) to the car's Y rotation
  const adjustedCarRotation = carRotation.map((rot, index) => {
    // Only adjust the Y rotation (index 1)
    return index === 1 ? rot + (Math.PI / 12) : rot;
  });

  // Define a fixed Y position for the car to ensure it's on the road
  const carFixedPosition = [carPosition[0], 0.02, carPosition[2]]; // Lowered the car's Y position from 0.05 to 0.02 to bring it closer to the road
  
  // Track if user is using orbit controls
  const [userControllingCamera, setUserControllingCamera] = useState(false);

  return (
    <div className="car-scene-container">
      <Canvas 
        shadows  
        camera={{ 
          position: [1.5, 1.2, 2.5], // Initial camera position
          fov: 60, // Wider field of view for better game feel
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
          
          {/* Follow camera that respects user manual control */}
          <FollowCamera 
            carPosition={carFixedPosition} 
            carRotation={adjustedCarRotation}
            cameraView={cameraView}
            userControllingCamera={userControllingCamera}
            carMovementDetected={carMovementDetected}
          />
        </Suspense>
        
        {/* Optional OrbitControls that take over when user interacts */}
        <OrbitControls 
          minDistance={1.5}
          maxDistance={10}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[carPosition[0], 0.5, carPosition[2]]} // Target follows the car height
          onStart={() => setUserControllingCamera(true)}
          onEnd={() => setUserControllingCamera(false)}
        />
        
        {showStats && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
}