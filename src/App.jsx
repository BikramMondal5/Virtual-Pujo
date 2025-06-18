import './App.css'
import { useState, useEffect } from 'react'
import MapComponent from './components/Map/MapComponent'
import CarScene from './components/SceneObjects/CarScene'
import MapControls from './components/MapControls'

function App() {
  const [showStats, setShowStats] = useState(false)
  const [carPosition, setCarPosition] = useState([0, -0.15, 0])
  const [carRotation, setCarRotation] = useState([0, Math.PI, 0]) // Updated to 180 degrees (Math.PI radians)
  
  // Map transformation states
  const [mapRotation, setMapRotation] = useState(0)
  
  // Movement speed
  const moveSpeed = 0.1
  
  // Map transformation values
  const rotationStep = 15
  
  // Handle map rotation
  const handleRotateLeft = () => {
    setMapRotation(prev => prev - rotationStep)
  }
  
  const handleRotateRight = () => {
    setMapRotation(prev => prev + rotationStep)
  }
  
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
          
        // Map rotation with Q and E keys
        case 'q':
          handleRotateLeft()
          e.preventDefault()
          break
        case 'e':
          handleRotateRight()
          e.preventDefault()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="canvas-container">
      {/* Map Component - using the fixed iframe URL */}
      <MapComponent 
        mapRotation={mapRotation}
      />
      
      {/* Car Scene Component */}
      <CarScene 
        carPosition={carPosition}
        carRotation={carRotation}
        showStats={showStats}
      />
      
      {/* Map Controls - only for rotation */}
      <MapControls 
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
      />
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Arrow keys: Move car</p>
        <p>Q/E: Rotate map left/right</p>
        <p>Use Google Maps controls to zoom and pan</p>
      </div>
    </div>
  )
}

export default App
