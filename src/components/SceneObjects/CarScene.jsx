import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Loader, Stats, OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import { Car } from './Car';
import { City } from './City';
import '../../styles/CarScene.css';
import * as THREE from 'three';
import { PhysicsWorld } from '../../utils/physics.jsx';

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

// Physics-based car controller
function PhysicsCarController({ carPhysicsApi, enabled }) {
  // Store the current states of keys with useRef for persistence between renders
  const keysPressed = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // Vehicle physics constants - significantly increased for better control
  const ENGINE_FORCE = 4000;  // Much stronger engine force
  const BRAKE_FORCE = 2000;   // Stronger braking force
  const MAX_STEER = 2.0;      // Higher steering angle for better turning
  const STEER_FORCE = 60;     // How strong the steering torque is
  
  // Keep track of current physics values
  const currentForce = useRef(0);
  const currentSteer = useRef(0);
  const isMoving = useRef(false);
  
  // Store last velocity for measuring changes
  const lastVelocity = useRef(null);

  // Detect keyboard input with high priority event listeners
  useEffect(() => {
    if (!enabled) return;
    
    // Event handlers
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keysPressed.current[e.key] = true;
        e.preventDefault();
        console.log(`Key pressed: ${e.key}`);
      }
    };
    
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keysPressed.current[e.key] = false;
        e.preventDefault();
      }
    };
    
    // Use both keydown and keypress for better responsiveness
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    
    // Debug interval to verify key handling
    const debugInterval = setInterval(() => {
      const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = keysPressed.current;
      if (ArrowUp || ArrowDown || ArrowLeft || ArrowRight) {
        console.log(`Active keys: ↑:${ArrowUp}, ↓:${ArrowDown}, ←:${ArrowLeft}, →:${ArrowRight}`);
      }
    }, 1000); // Log active keys every second
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      clearInterval(debugInterval);
    };
  }, [enabled]);

  // Apply physics forces on each frame
  useFrame(() => {
    if (!enabled || !carPhysicsApi.current) return;
    
    try {
      // Skip if API methods aren't available
      if (!carPhysicsApi.current.velocity || 
          !carPhysicsApi.current.position || 
          !carPhysicsApi.current.applyLocalForce ||
          !carPhysicsApi.current.applyTorque) {
        return;
      }
      
      // Get current velocity and position
      const velocity = new THREE.Vector3();
      carPhysicsApi.current.velocity.get(velocity);
      const speed = velocity.length();
      
      const position = new THREE.Vector3();
      carPhysicsApi.current.position.get(position);
      
      // Active key states
      const accelerating = keysPressed.current.ArrowUp;
      const braking = keysPressed.current.ArrowDown;
      const turningLeft = keysPressed.current.ArrowLeft;
      const turningRight = keysPressed.current.ArrowRight;
      
      // Handle acceleration and braking
      if (accelerating) {
        // Powerful acceleration
        currentForce.current = ENGINE_FORCE;
        isMoving.current = true;
      } else if (braking) {
        if (speed < 1) {
          // Reverse if nearly stopped
          currentForce.current = -ENGINE_FORCE * 0.6;
        } else {
          // Strong braking force
          currentForce.current = -BRAKE_FORCE;
        }
        isMoving.current = true;
      } else {
        // Gradual deceleration when no acceleration/braking input
        currentForce.current *= 0.90;
        if (Math.abs(currentForce.current) < 10) {
          currentForce.current = 0;
        }
      }
      
      // Always apply significant downward force to prevent floating
      carPhysicsApi.current.applyLocalForce([0, -3000, 0], [0, 0, 0]);
      
      // Handle steering with more responsive control
      if (turningLeft) {
        currentSteer.current = MAX_STEER;
      } else if (turningRight) {
        currentSteer.current = -MAX_STEER;
      } else {
        // Gradually return steering to center
        currentSteer.current *= 0.8;
        if (Math.abs(currentSteer.current) < 0.1) {
          currentSteer.current = 0;
        }
      }
      
      // Apply steering torque based on speed
      // More effective steering at higher speeds
      const steerMultiplier = Math.min(1, speed / 5) * STEER_FORCE;
      carPhysicsApi.current.applyTorque([0, currentSteer.current * steerMultiplier, 0]);
      
      // Apply driving force - pushing car forward/backward
      carPhysicsApi.current.applyLocalForce([0, 0, currentForce.current], [0, 0, 0]);
      
      // Auto-correction: prevent excessive sliding and drifting
      if (speed > 0.5) {
        // Calculate the direction the car is actually moving vs. where it's pointing
        const carDirection = new THREE.Vector3(0, 0, 1);
        const rotation = new THREE.Euler();
        carPhysicsApi.current.rotation.get(rotation);
        
        // Convert the car's rotation to a direction vector
        const quaternion = new THREE.Quaternion().setFromEuler(rotation);
        carDirection.applyQuaternion(quaternion);
        
        // Measure the alignment between velocity and car direction
        const alignment = velocity.clone().normalize().dot(carDirection);
        
        // If the car is sliding sideways (low alignment), apply correction force
        if (alignment < 0.7 && speed > 2) {
          // Calculate lateral correction force
          const correctionForce = carDirection.clone().multiplyScalar(speed * 10);
          correctionForce.sub(velocity);
          correctionForce.multiplyScalar(10); // Strength of correction
          
          // Apply lateral correction
          carPhysicsApi.current.applyLocalForce(
            [correctionForce.x, 0, correctionForce.z],
            [0, 0, 0]
          );
        }
      }
      
      // Store current velocity for next frame
      lastVelocity.current = velocity.clone();
      
      // Update isMoving state based on speed
      isMoving.current = speed > 0.5;
      
    } catch (error) {
      console.error("Error in physics controller frame:", error);
    }
  });
  
  return null;
}

// Main CarScene component
export default function CarScene({ 
  carPosition, 
  carRotation, 
  showStats = false,
  cameraView = 'third-person',
  carMovementDetected = false,
  onCarPositionChange,
  onCarRotationChange,
  usePhysics = true // Accept the physics toggle prop from App.jsx
}) {
  // Add 15 degrees (in radians) to the car's Y rotation
  const adjustedCarRotation = carRotation ? carRotation.map((rot, index) => {
    // Only adjust the Y rotation (index 1)
    return index === 1 ? rot + (Math.PI / 12) : rot;
  }) : [0, Math.PI / 12, 0];

  // Define a fixed Y position for the car to ensure it's on the road
  const carFixedPosition = carPosition ? [carPosition[0], 0.3, carPosition[2]] : [0, 0.3, 0];
  
  // Track if user is using orbit controls
  const [userControllingCamera, setUserControllingCamera] = useState(false);
  
  // Refs for tracking physics state
  const carPhysicsApi = useRef(null);
  const carPhysicsPosition = useRef(carFixedPosition);
  const carPhysicsRotation = useRef(adjustedCarRotation);
  
  // Track the latest car physics position and rotation with error handling
  useEffect(() => {
    if (!usePhysics) return;
    
    let unsubPosition;
    let unsubRotation;
    
    // Only set up subscriptions if the physics API is available
    if (carPhysicsApi.current && 
        carPhysicsApi.current.position && 
        carPhysicsApi.current.rotation) {
      
      try {
        // Subscribe to position changes
        unsubPosition = carPhysicsApi.current.position.subscribe((v) => {
          if (v) {
            carPhysicsPosition.current = v;
            if (onCarPositionChange) {
              onCarPositionChange([v[0], v[1], v[2]]);
            }
          }
        });
        
        // Subscribe to rotation changes
        unsubRotation = carPhysicsApi.current.rotation.subscribe((v) => {
          if (v) {
            carPhysicsRotation.current = v;
            if (onCarRotationChange) {
              onCarRotationChange([v[0], v[1] - (Math.PI / 12), v[2]]);
            }
          }
        });
      } catch (error) {
        console.error("Error setting up physics subscriptions:", error);
      }
    }
    
    return () => {
      // Clean up subscriptions
      if (unsubPosition) {
        try {
          unsubPosition();
        } catch (error) {
          console.error("Error unsubscribing position:", error);
        }
      }
      
      if (unsubRotation) {
        try {
          unsubRotation();
        } catch (error) {
          console.error("Error unsubscribing rotation:", error);
        }
      }
    };
  }, [carPhysicsApi.current, usePhysics, onCarPositionChange, onCarRotationChange]);

  // When physics mode changes, reset the car's position safely
  useEffect(() => {
    if (carPhysicsApi.current) {
      try {
        // Only attempt to set properties if the methods exist
        if (carPhysicsApi.current.position) {
          carPhysicsApi.current.position.set(
            carFixedPosition[0], 
            carFixedPosition[1], 
            carFixedPosition[2]
          );
        }
        
        if (carPhysicsApi.current.rotation) {
          carPhysicsApi.current.rotation.set(
            adjustedCarRotation[0], 
            adjustedCarRotation[1], 
            adjustedCarRotation[2]
          );
        }
        
        if (carPhysicsApi.current.velocity) {
          carPhysicsApi.current.velocity.set(0, 0, 0);
        }
        
        if (carPhysicsApi.current.angularVelocity) {
          carPhysicsApi.current.angularVelocity.set(0, 0, 0);
        }
      } catch (error) {
        console.error("Error resetting car physics state:", error);
      }
    }
  }, [usePhysics, carFixedPosition, adjustedCarRotation]);

  return (
    <div className="car-scene-container">
      <Canvas 
        shadows  
        camera={{ 
          position: [1.5, 1.2, 2.5],
          fov: 60,
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
          <PhysicsWorld>
            {/* City model with physics ground */}
            <City 
              position={[0, 0.28, 0]}
              scale={0.05}
              rotation={[0, Math.PI / 6, 0]}
            />
            
            {/* Car model with physics */}
            <Car 
              position={carFixedPosition}
              rotation={adjustedCarRotation}
              scale={1.5}
              usePhysics={usePhysics}
              physicsApi={carPhysicsApi}
            />
            
            {/* Physics-based car controller */}
            <PhysicsCarController 
              carPhysicsApi={carPhysicsApi} 
              enabled={usePhysics}
            />
            
            {/* Enhanced shadow beneath the car */}
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.7}
              scale={8}
              blur={0.8}
              far={0.1}
              resolution={512}
              color="#000000"
            />
          </PhysicsWorld>
          
          <Environment preset="sunset" />
          
          {/* Follow camera that uses either direct position or physics position */}
          <FollowCamera 
            carPosition={usePhysics ? carPhysicsPosition.current : carFixedPosition} 
            carRotation={usePhysics ? carPhysicsRotation.current : adjustedCarRotation}
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
          target={[
            usePhysics ? carPhysicsPosition.current[0] : carPosition ? carPosition[0] : 0, 
            0.5, 
            usePhysics ? carPhysicsPosition.current[2] : carPosition ? carPosition[2] : 0
          ]}
          onStart={() => setUserControllingCamera(true)}
          onEnd={() => setUserControllingCamera(false)}
        />
        
        {showStats && <Stats />}
      </Canvas>
      <Loader />
    </div>
  );
}