import './App.css'
import { useState, useEffect } from 'react'
import CarScene from './components/SceneObjects/CarScene'
import MapComponent from './components/Map/MapComponent'
import MapControls from './components/MapControls'

function App() {
  const [showStats, setShowStats] = useState(false)
  const [carPosition, setCarPosition] = useState([0, -0.15, 0])
  const [carRotation, setCarRotation] = useState([0, Math.PI, 0])
  
  // Map rotation and zoom state
  const [mapRotation, setMapRotation] = useState(0)
  const [mapZoom, setMapZoom] = useState(1.0)
  
  // Movement speed
  const moveSpeed = 0.1
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 's') setShowStats(prev => !prev)

      // Handle arrow key presses for car movement
      switch (e.key) {
        case 'ArrowUp':
          setCarPosition(prev => [prev[0], prev[1], prev[2] - moveSpeed])
          setCarRotation([0, 0, 0]) // Point forward
          e.preventDefault()
          break
        case 'ArrowDown':
          setCarPosition(prev => [prev[0], prev[1], prev[2] + moveSpeed])
          setCarRotation([0, Math.PI, 0]) // Point backward
          e.preventDefault()
          break
        case 'ArrowLeft':
          setCarPosition(prev => [prev[0] - moveSpeed, prev[1], prev[2]])
          setCarRotation([0, Math.PI / 2, 0]) // Point left
          e.preventDefault()
          break
        case 'ArrowRight':
          setCarPosition(prev => [prev[0] + moveSpeed, prev[1], prev[2]])
          setCarRotation([0, -Math.PI / 2, 0]) // Point right
          e.preventDefault()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Map control functions
  const handleRotateLeft = () => {
    setMapRotation(prev => prev - 15)
  }
  
  const handleRotateRight = () => {
    setMapRotation(prev => prev + 15)
  }
  
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.2, 3.0))
  }
  
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  return (
    <div className="canvas-container">
      {/* Google Maps Component */}
      <MapComponent 
        mapRotation={mapRotation}
        mapZoom={mapZoom}
      />
      
      {/* Map Controls */}
      <MapControls 
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      {/* Car Scene Component - now taking full screen */}
      <CarScene 
        carPosition={carPosition}
        carRotation={carRotation}
        showStats={showStats}
      />
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Arrow keys: Move car</p>
        <p>Mouse: Orbit camera view</p>
        <p>Map controls: Rotate/zoom map</p>
      </div>
    </div>
  )
}

export default App
