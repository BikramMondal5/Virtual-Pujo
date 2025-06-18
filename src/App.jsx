import './App.css'
import { useState, useEffect } from 'react'
import MapComponent from './components/Map/MapComponent'
import CarScene from './components/SceneObjects/CarScene'
import MapControls from './components/MapControls'

function App() {
  const [showStats, setShowStats] = useState(false)
  const [carPosition, setCarPosition] = useState([0, -0.15, 0])
  const [carRotation, setCarRotation] = useState([0, Math.PI / 4, 0])
  
  // Map transformation states
  const [mapZoom, setMapZoom] = useState(13) // Google Maps API zoom level
  const [mapRotation, setMapRotation] = useState(0)
  const [mapCenter, setMapCenter] = useState({ lat: 22.535, lng: 88.365 }) // Initial center coordinates
  
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
  
  // Handle map panning
  const handlePan = (direction) => {
    // Approximate latitude/longitude changes based on direction
    const latStep = 0.01;
    const lngStep = 0.01;
    
    switch(direction) {
      case 'up':
        setMapCenter(prev => ({ ...prev, lat: prev.lat + latStep }))
        break
      case 'down':
        setMapCenter(prev => ({ ...prev, lat: prev.lat - latStep }))
        break
      case 'left':
        setMapCenter(prev => ({ ...prev, lng: prev.lng - lngStep }))
        break
      case 'right':
        setMapCenter(prev => ({ ...prev, lng: prev.lng + lngStep }))
        break
    }
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
          
        // Map panning with WASD keys
        case 'w':
          handlePan('up')
          e.preventDefault()
          break
        case 'a':
          handlePan('left')
          e.preventDefault()
          break
        case 's':
          handlePan('down')
          e.preventDefault()
          break
        case 'd':
          handlePan('right')
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
      {/* Map Component - using Google Maps built-in controls */}
      <MapComponent 
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        mapRotation={mapRotation}
      />
      
      {/* Car Scene Component */}
      <CarScene 
        carPosition={carPosition}
        carRotation={carRotation}
        showStats={showStats}
      />
      
      {/* Map Controls - only for rotation and panning */}
      <MapControls 
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onPan={handlePan}
      />
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Arrow keys: Move car</p>
        <p>Q/E: Rotate map left/right</p>
        <p>W/A/S/D: Pan map</p>
        <p>Use Google Maps controls to zoom</p>
      </div>
    </div>
  )
}

export default App
