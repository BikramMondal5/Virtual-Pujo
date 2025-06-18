import './App.css'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Loader, Stats } from '@react-three/drei'
import { Car } from './components/SceneObjects/Car'
import { Suspense, useState } from 'react'

function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" wireframe />
    </mesh>
  )
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
          position: [3, 1.5, 3], 
          fov: 40, 
          near: 0.1,
          far: 100
        }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#f0f0f0']} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />
        <directionalLight position={[0, -10, 0]} intensity={0.25} />
        
        <Suspense fallback={<LoadingFallback />}>
          {/* Position and scale the car appropriately */}
          <Car 
            position={[0, -0.5, 0]} 
            rotation={[0, Math.PI / 4, 0]}
            scale={1} // Use the scale in the Car component itself
          />
          <Environment preset="city" />
          
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        </Suspense>
        
        <OrbitControls 
          target={[0, 0, 0]} 
          enableDamping 
          dampingFactor={0.05}
          minDistance={2}
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
