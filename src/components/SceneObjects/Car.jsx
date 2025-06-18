import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three' // Import THREE for material handling

export function Car(props) {
  // The correct path to the model in the public directory
  const modelPath = '/models/2024_byd_sealion_7/scene.gltf'
  const { scene, nodes, materials } = useGLTF(modelPath)
  
  // Fix material transparency issues
  useEffect(() => {
    console.log('Car model nodes:', nodes)
    console.log('Car model materials:', materials)
    
    // Fix transparent materials - iterate through all materials in the model
    if (materials) {
      Object.values(materials).forEach(material => {
        // Ensure all materials are visible
        material.transparent = false
        material.opacity = 1
        material.side = THREE.DoubleSide
        material.needsUpdate = true
        
        // For carpaint material specifically (the car body)
        if (material.name === 'carpaint') {
          material.color = new THREE.Color(0x2980b9) // Set to blue color
          material.metalness = 0.7
          material.roughness = 0.2
          material.envMapIntensity = 1.5
        }
      })
    }
    
    // Process all meshes in the scene to ensure visibility
    if (scene) {
      scene.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true
          object.receiveShadow = true
          
          // If the object has a material
          if (object.material) {
            // Make sure body parts aren't transparent
            object.material.transparent = false
            object.material.opacity = 1
            object.material.side = THREE.DoubleSide
            object.material.needsUpdate = true
            
            // Special handling for glass materials
            if (object.material.name && 
                (object.material.name.includes('glass') || 
                 object.material.name.includes('Glass'))) {
              object.material.transparent = true
              object.material.opacity = 0.6
              object.material.refractionRatio = 0.98
              object.material.envMapIntensity = 1
            }
            
            // Enhance shadows for better visibility over the map
            if (object.material.name && object.material.name.includes('tire')) {
              object.castShadow = true
              object.receiveShadow = false
            }
          }
        }
      })
    }
  }, [scene, nodes, materials])

  return (
    <group {...props} dispose={null}>
      {scene && <primitive object={scene} />}
      {/* Add a shadow plane below the car to show it's positioned on the map */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
        <planeGeometry args={[5, 8]} />
        <shadowMaterial opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

// Preload the model with the correct path
useGLTF.preload('/models/2024_byd_sealion_7/scene.gltf')