import './App.css'
import { useState, useEffect, useRef } from 'react'
import CarScene from './components/SceneObjects/CarScene'
import MapComponent from './components/Map/MapComponent'
import MapControls from './components/MapControls'

function App() {
  const [showStats, setShowStats] = useState(false)
  const [carPosition, setCarPosition] = useState([0, 0.1, 0])
  const [carRotation, setCarRotation] = useState([0, Math.PI, 0])
  
  // Map rotation and zoom state
  const [mapRotation, setMapRotation] = useState(0)
  const [mapZoom, setMapZoom] = useState(1.0)
  
  // Camera view state - setting close-up as default
  const [cameraView, setCameraView] = useState('third-person')
  
  // Track when car movement keys are pressed
  const [carMovementDetected, setCarMovementDetected] = useState(false)
  
  // Movement speed for non-physics mode
  const moveSpeed = 0.15
  
  // Track active keys for smoother movement
  const keysDown = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  })
  
  // Track if we're using physics-based movement
  const [usePhysicsMovement, setUsePhysicsMovement] = useState(true)
  
  // Set up animation frame for movement
  const animationFrameRef = useRef(null)
  
  // Handle keyboard controls
  useEffect(() => {
    console.log('Setting up keyboard controls')
    
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
      
      // Toggle physics mode with 'p' key
      if (e.key === 'p') {
        setUsePhysicsMovement(prev => !prev)
      }

      // Update active keys for arrow keys and set movement detected flag
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keysDown.current[e.key] = true
        setCarMovementDetected(true)
        console.log('Key down in App:', e.key)
        e.preventDefault()
      }
    }
    
    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keysDown.current[e.key] = false
        
        // Only reset movement detected if no arrow keys are pressed
        const anyKeyDown = Object.values(keysDown.current).some(isDown => isDown)
        if (!anyKeyDown) {
          setCarMovementDetected(false)
        }
        
        e.preventDefault()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  // Update car position for non-physics mode
  useEffect(() => {
    // Skip if physics mode is on
    if (usePhysicsMovement) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }
    
    const updateCarPosition = () => {
      let positionChanged = false
      let rotationChanged = false
      
      // Get current rotation and position values
      const currentRotationY = carRotation[1]
      const currentPosition = [...carPosition]
      
      // Handle forward/backward movement
      if (keysDown.current.ArrowUp) {
        const newX = currentPosition[0] + Math.sin(currentRotationY) * moveSpeed
        const newZ = currentPosition[2] + Math.cos(currentRotationY) * moveSpeed
        currentPosition[0] = newX
        currentPosition[2] = newZ
        positionChanged = true
      }
      
      if (keysDown.current.ArrowDown) {
        const newX = currentPosition[0] - Math.sin(currentRotationY) * moveSpeed
        const newZ = currentPosition[2] - Math.cos(currentRotationY) * moveSpeed
        currentPosition[0] = newX
        currentPosition[2] = newZ
        positionChanged = true
      }
      
      // Handle rotation
      let newRotationY = currentRotationY
      if (keysDown.current.ArrowLeft) {
        newRotationY = currentRotationY + Math.PI/36 // Rotate by 5 degrees
        rotationChanged = true
      }
      
      if (keysDown.current.ArrowRight) {
        newRotationY = currentRotationY - Math.PI/36 // Rotate by 5 degrees
        rotationChanged = true
      }
      
      // Update states only if values changed
      if (positionChanged) {
        setCarPosition(currentPosition)
      }
      
      if (rotationChanged) {
        setCarRotation([0, newRotationY, 0])
      }
      
      // Continue the animation frame loop
      animationFrameRef.current = requestAnimationFrame(updateCarPosition)
    }
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateCarPosition)
    
    // Cleanup on unmount or when physics mode changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [carPosition, carRotation, moveSpeed, usePhysicsMovement])

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

  // Callback handlers for car physics position and rotation updates
  const handleCarPositionChange = (newPosition) => {
    setCarPosition(newPosition);
  };

  const handleCarRotationChange = (newRotation) => {
    setCarRotation(newRotation);
  };
  
  // Toggle physics mode
  const handlePhysicsToggle = () => {
    setUsePhysicsMovement(prev => !prev);
  };

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
      
      {/* Car Scene Component - now with physics callbacks */}
      <CarScene 
        carPosition={carPosition}
        carRotation={carRotation}
        showStats={showStats}
        cameraView={cameraView}
        carMovementDetected={carMovementDetected}
        onCarPositionChange={handleCarPositionChange}
        onCarRotationChange={handleCarRotationChange}
        usePhysics={usePhysicsMovement}
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
      
      {/* Physics toggle button */}
      <button 
        className="physics-toggle-button" 
        onClick={handlePhysicsToggle}
        title="Toggle physics mode"
      >
        {usePhysicsMovement ? 'Physics: ON' : 'Physics: OFF'}
      </button>
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Press 'V' to change camera view</p>
        <p>Press 'P' to toggle physics</p>
        <p>Arrow keys: Move car</p>
        <p>Mouse: Orbit camera view</p>
        <p>Map controls: Rotate/zoom map</p>
      </div>
    </div>
  )
}

export default App
