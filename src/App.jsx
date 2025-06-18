import './App.css'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Loader, Stats } from '@react-three/drei'
import { Car } from './components/SceneObjects/Car'
import { Suspense, useState, useEffect, useRef } from 'react'
import MapControls from './components/MapControls'

// Replace the box fallback with an empty component
function LoadingFallback() {
  return null // Remove the cube completely
}

function App() {
  const [showStats, setShowStats] = useState(false)
  const [carPosition, setCarPosition] = useState([0, -0.15, 0])
  const [carRotation, setCarRotation] = useState([0, Math.PI / 4, 0])
  
  // Map transformation states
  const [mapZoom, setMapZoom] = useState(13) // Initial zoom level for Google Maps
  const [mapRotation, setMapRotation] = useState(0)
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [mapCenter, setMapCenter] = useState({ lat: 22.535, lng: 88.365 }) // Initial center coordinates
  
  // References to track interaction state
  const mapContainerRef = useRef(null)
  const isDragging = useRef(false)
  const lastPosition = useRef({ x: 0, y: 0 })
  
  // Movement speed
  const moveSpeed = 0.1
  
  // Map transformation values
  const zoomStep = 1 // Changed to 1 for Google Maps zoom levels
  const rotationStep = 15
  const panStep = 20
  
  // Generate Google Maps iframe URL
  const generateMapUrl = () => {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.21689694983!2d${mapCenter.lng}!3d${mapCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${mapZoom}.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1750276466557!5m2!1sen!2sin`;
  };
  
  // Handle map zooming
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + zoomStep, 21)) // Max zoom level in Google Maps is 21
  }
  
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - zoomStep, 1)) // Min zoom level in Google Maps is 0
  }
  
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
    // These values would need adjustment based on current zoom level
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
  
  // Set up mouse drag handlers for map panning
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return
    
    const handleMouseDown = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'svg' || e.target.tagName === 'path') return
      isDragging.current = true
      lastPosition.current = { x: e.clientX, y: e.clientY }
    }
    
    const handleMouseUp = () => {
      isDragging.current = false
    }
    
    const handleMouseMove = (e) => {
      if (!isDragging.current) return
      
      const deltaX = e.clientX - lastPosition.current.x
      const deltaY = e.clientY - lastPosition.current.y
      lastPosition.current = { x: e.clientX, y: e.clientY }
      
      // Convert pixel movements to approximate lat/lng changes
      // This is a simplification and would need refinement
      const latChange = deltaY * 0.0001;
      const lngChange = deltaX * 0.0001;
      
      setMapCenter(prev => ({
        lat: prev.lat - latChange,
        lng: prev.lng - lngChange
      }))
    }
    
    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])
  
  // Handle mouse wheel for zooming the map
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return
    
    const handleWheel = (e) => {
      e.preventDefault()
      if (e.deltaY < 0) {
        setMapZoom(prev => Math.min(prev + 1, 21))
      } else {
        setMapZoom(prev => Math.max(prev - 1, 1))
      }
    }
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])
  
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
          
        // Map zoom with + and - keys
        case '+':
        case '=':
          handleZoomIn()
          e.preventDefault()
          break
        case '-':
        case '_':
          handleZoomOut()
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

  // Calculate transform style for map rotation
  const mapTransform = `rotate(${mapRotation}deg)`

  return (
    <div className="canvas-container">
      {/* Map with transformations */}
      <div 
        className="map-container" 
        ref={mapContainerRef}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <div 
          className="map-transform-container"
          style={{ 
            transform: mapTransform,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <iframe 
            src={generateMapUrl()}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      
      {/* Map Controls */}
      <MapControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onPan={handlePan}
      />
      
      {/* Canvas overlay with transparent background */}
      <div className="canvas-overlay">
        <Canvas 
          shadows 
          camera={{ 
            position: [0.8, 0.5, 0.8],
            fov: 55,
            near: 0.1, 
            far: 100
          }}
          gl={{ 
            antialias: true,
            alpha: true, // Enable transparency
            preserveDrawingBuffer: true
          }}
          dpr={[1, 2]}
        >
          {/* No background color */}
          
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
            {/* Use the carPosition and carRotation state for the car */}
            <Car 
              position={carPosition}
              rotation={carRotation}
              scale={0.5}
            />
            <Environment preset="city" />
          </Suspense>
          
          <OrbitControls 
            target={carPosition}
            enableDamping 
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={10}
          />
          
          {showStats && <Stats />}
        </Canvas>
        <Loader />
      </div>
      
      <div className="info-overlay">
        <p>Press 'S' to toggle stats</p>
        <p>Arrow keys: Move car</p>
        <p>Mouse drag: Move map</p>
        <p>Mouse wheel: Zoom map</p>
        <p>Q/E: Rotate map left/right</p>
        <p>W/A/S/D: Pan map</p>
        <p>+/-: Zoom in/out</p>
      </div>
    </div>
  )
}

export default App
