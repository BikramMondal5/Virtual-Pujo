import './App.css'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Loader, Stats } from '@react-three/drei'
import { Car } from './components/SceneObjects/Car'
import { Suspense, useState } from 'react'

// Replace the box fallback with an empty component
function LoadingFallback() {
  return null // Remove the cube completely
}

function App() {
  const [showStats, setShowStats] = useState(false)
  
  // Toggle stats display with 's' key
  window.addEventListener('keydown', (e) => {
    if (e.key === 's') setShowStats(prev => !prev)
  })

  return (
    <div className="canvas-container">
      <Canvas 
        shadows 
        camera={{ 
          position: [0.8, 0.5, 0.8], // Much closer camera position
          fov: 55, // Even wider field of view
          near: 0.1,
          far: 100
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#f0f0f0']} />
        
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
            position={[0, -0.15, 0]} // Raised even higher for better visibility
            rotation={[0, Math.PI / 4, 0]}
            scale={2.0} // Much larger scale to make car appear even closer
          />
          <Environment preset="city" />
          
          {/* Ground plane - adjusted to be closer to car bottom */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        </Suspense>
        
        <OrbitControls 
          target={[0, 0, 0]} 
          enableDamping 
          dampingFactor={0.05}
          minDistance={0.5} // Allow extremely close zooming
          maxDistance={10}
        />
        
        {showStats && <Stats />}
      </Canvas>
      <Loader />
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Use mouse to rotate view</p>
        <p>Scroll to zoom in/out</p>
      </div>
    </div>
  )
}

export default App
