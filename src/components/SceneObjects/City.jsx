import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function City(props) {
  // The correct path to the model in the public directory
  const modelPath = '/models/city_for_my_game/scene.gltf';
  const { nodes, materials, scene } = useGLTF(modelPath);

  // Fix material transparency issues and enhance visuals
  useEffect(() => {
    console.log('City model loaded:', nodes);
    
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
      {scene && <primitive object={scene} />}
    </group>
  );
}

// Preload the model with the correct path
useGLTF.preload('/models/city_for_my_game/scene.gltf');