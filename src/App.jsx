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
  
  // Camera view state - setting close-up as default
  const [cameraView, setCameraView] = useState('close-up')
  
  // Track when car movement keys are pressed
  const [carMovementDetected, setCarMovementDetected] = useState(false)
  
  // Movement speed
  const moveSpeed = 0.1
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 's') setShowStats(prev => !prev)
      
      // Toggle between camera views with 'v' key
      if (e.key === 'v') {
        setCameraView(prev => {
          if (prev === 'close-up') return 'third-person'
          if (prev === 'third-person') return 'first-person'
          if (prev === 'first-person') return 'top-down'
          return 'close-up'
        })
      }

      // Get current car rotation angle (y-axis)
      const currentRotationY = carRotation[1]
      
      // Set car movement detected flag for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setCarMovementDetected(true)
      }
      
      // Handle arrow key presses for car movement relative to its current rotation
      switch (e.key) {
        case 'ArrowUp': {
          // Move forward in the direction the car is facing
          const newX = carPosition[0] + Math.sin(currentRotationY) * moveSpeed
          const newZ = carPosition[2] + Math.cos(currentRotationY) * moveSpeed
          setCarPosition([newX, carPosition[1], newZ])
          e.preventDefault()
          break
        }
        case 'ArrowDown': {
          // Move backward relative to car's facing direction
          const newX = carPosition[0] - Math.sin(currentRotationY) * moveSpeed
          const newZ = carPosition[2] - Math.cos(currentRotationY) * moveSpeed
          setCarPosition([newX, carPosition[1], newZ])
          e.preventDefault()
          break
        }
        case 'ArrowLeft': {
          // Only change rotation, don't move position
          setCarRotation([0, currentRotationY + Math.PI/36, 0]) // Rotate by 5 degrees (pi/36 radians)
          e.preventDefault()
          break
        }
        case 'ArrowRight': {
          // Only change rotation, don't move position
          setCarRotation([0, currentRotationY - Math.PI/36, 0]) // Rotate by 5 degrees (pi/36 radians)
          e.preventDefault()
          break
        }
      }
    }
    
    // Reset car movement flag when key is released
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Add a small delay before resetting to ensure smooth camera transitions
        setTimeout(() => {
          setCarMovementDetected(false)
        }, 200)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [carPosition, carRotation])

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
  
  // Handle camera view change
  const handleCameraViewChange = () => {
    setCameraView(prev => {
      if (prev === 'close-up') return 'third-person'
      if (prev === 'third-person') return 'first-person'
      if (prev === 'first-person') return 'top-down'
      return 'close-up'
    })
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
      
      {/* Car Scene Component - now with camera view */}
      <CarScene 
        carPosition={carPosition}
        carRotation={carRotation}
        showStats={showStats}
        cameraView={cameraView}
        carMovementDetected={carMovementDetected}
      />
      
      {/* Camera view toggle button */}
      <button 
        className="camera-toggle-button" 
        onClick={handleCameraViewChange}
        title="Change camera view"
      >
        {cameraView === 'close-up' && 'View: Close-up'}
        {cameraView === 'third-person' && 'View: 3rd Person'}
        {cameraView === 'first-person' && 'View: 1st Person'}
        {cameraView === 'top-down' && 'View: Top Down'}
      </button>
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Press 'V' to change camera view</p>
        <p>Arrow keys: Move car</p>
        <p>Mouse: Orbit camera view</p>
        <p>Map controls: Rotate/zoom map</p>
      </div>
    </div>
  )
}

export default App
