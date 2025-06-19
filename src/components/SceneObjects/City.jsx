import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { usePlane } from '@react-three/cannon';
import * as THREE from 'three';

export function City(props) {
  // The correct path to the model in the public directory
  const modelPath = '/models/city_for_my_game/scene.gltf';
  const { nodes, materials, scene } = useGLTF(modelPath);
  
  // Create invisible ground plane for physics - positioned precisely at ground level
  // Added additional ground collision properties for better car interaction
  const [groundRef] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], // Make it horizontal
    position: [0, -0.02, 0], // Slightly higher to prevent car from sinking
    material: {
      friction: 1.0,  // Maximum friction to prevent sliding
      restitution: 0.0,  // No bounce
      contactEquationStiffness: 1e9, // Very rigid ground
      contactEquationRelaxation: 1 // Minimum relaxation to prevent sinking
    },
    type: 'Static',  // Explicitly set as static
    mass: 0,         // Make it immovable
    collisionFilterGroup: 1, // Ground collision group
    collisionFilterMask: 1,  // What can collide with the ground
  }));

  // Additional side barriers to prevent car from falling off the map
  const [leftBarrierRef] = usePlane(() => ({
    rotation: [0, Math.PI / 2, 0], // Vertical plane facing right
    position: [-100, 0, 0],        // Far left edge
    material: { friction: 0.5, restitution: 0.1 },
    type: 'Static'
  }));
  
  const [rightBarrierRef] = usePlane(() => ({
    rotation: [0, -Math.PI / 2, 0], // Vertical plane facing left
    position: [100, 0, 0],          // Far right edge
    material: { friction: 0.5, restitution: 0.1 },
    type: 'Static'
  }));
  
  const [frontBarrierRef] = usePlane(() => ({
    rotation: [0, Math.PI, 0],    // Vertical plane facing back
    position: [0, 0, 100],        // Far front edge
    material: { friction: 0.5, restitution: 0.1 },
    type: 'Static'
  }));
  
  const [backBarrierRef] = usePlane(() => ({
    rotation: [0, 0, 0],          // Vertical plane facing front
    position: [0, 0, -100],       // Far back edge
    material: { friction: 0.5, restitution: 0.1 },
    type: 'Static'
  }));

  // Fix material transparency issues and enhance visuals
  useEffect(() => {
    // Process all materials in the scene
    if (materials) {
      Object.values(materials).forEach(material => {
        // Ensure all materials are visible
        material.transparent = false;
        material.opacity = 1;
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;
        
        // Enhance material properties
        if (material.name && material.name.includes('floor_tiles')) {
          material.roughness = 0.7;  
          material.metalness = 0.3;
        }
      });
    }
    
    // Process all meshes in the scene to ensure visibility
    if (scene) {
      scene.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          
          // If the object has a material
          if (object.material) {
            // Make sure parts aren't transparent
            object.material.transparent = false;
            object.material.opacity = 1;
            object.material.side = THREE.DoubleSide;
            object.material.needsUpdate = true;
            
            // Special handling for glass materials
            if (object.material.name && 
                (object.material.name.includes('glass') || 
                 object.material.name.includes('Glass'))) {
              object.material.transparent = true;
              object.material.opacity = 0.6;
              object.material.refractionRatio = 0.98;
              object.material.envMapIntensity = 1;
            }
          }
        }
      });
    }
  }, [scene, nodes, materials]);
  
  return (
    <group {...props} dispose={null}>
      {/* City visual model */}
      {scene && <primitive object={scene} />}
      
      {/* Invisible physics ground - make it extra large */}
      <group ref={groundRef}>
        {/* This plane is invisible, purely for physics */}
        <mesh visible={false}>
          <planeGeometry args={[2000, 2000]} /> {/* Much larger plane */}
          <meshStandardMaterial color="#666666" transparent opacity={0} />
        </mesh>
      </group>
      
      {/* Invisible barriers to keep car from falling off the map */}
      <group ref={leftBarrierRef}><mesh visible={false}><planeGeometry args={[200, 20]} /></mesh></group>
      <group ref={rightBarrierRef}><mesh visible={false}><planeGeometry args={[200, 20]} /></mesh></group>
      <group ref={frontBarrierRef}><mesh visible={false}><planeGeometry args={[200, 20]} /></mesh></group>
      <group ref={backBarrierRef}><mesh visible={false}><planeGeometry args={[200, 20]} /></mesh></group>
    </group>
  );
}

// Preload the model with the correct path
useGLTF.preload('/models/city_for_my_game/scene.gltf');