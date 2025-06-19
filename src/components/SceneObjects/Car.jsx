import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three' 
import { useBox } from '@react-three/cannon'

export function Car(props) {
  // The correct path to the model in the public directory
  const modelPath = '/models/2024_byd_sealion_7/scene.gltf'
  const { scene, nodes, materials } = useGLTF(modelPath)
  
  // Get car dimensions from props or use defaults - adjusted for better collision
  const carWidth = 1.6
  const carHeight = 0.7  // Reduced height to lower center of mass
  const carLength = 3.5  // Adjusted for better visual match

  // Create physics body for the car with properly tuned physics properties
  const [ref, api] = useBox(() => ({
    mass: 800, // Lowered mass for better control
    position: props.position ? [props.position[0], 0, props.position[2]] : [0, 0, 0], // Start directly on ground
    rotation: props.rotation || [0, 0, 0],
    args: [carWidth, carHeight, carLength], // Car dimensions [width, height, length]
    allowSleep: false,
    linearDamping: 0.5, // Lower damping for better responsiveness
    angularDamping: 0.5, // Lower angular damping for more responsive steering
    material: {
      friction: 0.7, // Good balance of grip vs sliding
      restitution: 0.0 // No bounce
    },
    fixedRotation: false,
    angularFactor: [0.2, 0.5, 0.2], // Limit rotation except for y-axis
    linearFactor: [1, 1, 1], // Allow movement in all directions
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
    type: props.usePhysics ? 'Dynamic' : 'Kinematic' // Dynamic in physics mode, kinematic in non-physics mode
  }), useRef())

  // Sync position and rotation for non-physics mode and handle physics type changes
  useEffect(() => {
    if (!api) return;
    
    try {
      console.log(`Car physics type: ${props.usePhysics ? 'Dynamic' : 'Kinematic'}`);
      
      if (!props.usePhysics) {
        // In non-physics mode
        if (api.type) api.type.set('Kinematic');
        if (props.position && api.position) {
          api.position.set(props.position[0], props.position[1], props.position[2]);
        }
        if (props.rotation && api.rotation) {
          api.rotation.set(props.rotation[0], props.rotation[1], props.rotation[2]);
        }
        if (api.velocity) api.velocity.set(0, 0, 0);
        if (api.angularVelocity) api.angularVelocity.set(0, 0, 0);
      } else {
        // In physics mode
        if (api.type) api.type.set('Dynamic');
        
        // Reset position to ensure it's on the ground
        if (props.position && api.position) {
          api.position.set(props.position[0], 0, props.position[2]);
        }
        
        // Reset velocities when switching to physics mode
        if (api.velocity) api.velocity.set(0, 0, 0);
        if (api.angularVelocity) api.angularVelocity.set(0, 0, 0);
      }
    } catch (error) {
      console.error("Error updating car physics:", error);
    }
  }, [props.usePhysics, props.position, props.rotation, api]);

  // Fix material transparency issues
  useEffect(() => {
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

  // Expose physics API for external control
  useEffect(() => {
    if (props.physicsApi) {
      props.physicsApi.current = api;
      
      // Apply immediate downward force when physics is enabled
      if (props.usePhysics && api && api.applyLocalForce) {
        try {
          console.log("Applying initial grounding force");
          // Apply a very strong initial downward force
          api.applyLocalForce([0, -20000, 0], [0, 0, 0]);
          
          // Reset to ground level if needed
          const position = new THREE.Vector3();
          api.position.get(position);
          if (position.y > 0.1) {
            api.position.set(position.x, 0, position.z);
          }
        } catch (error) {
          console.error("Error applying initial force:", error);
        }
      }
    }
    
    console.log('Car physics initialized:', {
      usePhysics: props.usePhysics,
      api: api ? 'Available' : 'Not Available'
    });
    
    return () => {
      if (props.physicsApi) {
        props.physicsApi.current = null;
      }
    };
  }, [api, props.physicsApi, props.usePhysics]);

  // Keep car grounded consistently - more aggressive anti-floating system
  useEffect(() => {
    if (!props.usePhysics || !api) return;
    
    // Apply constant downward force to prevent floating
    const groundingInterval = setInterval(() => {
      try {
        if (api.position && api.velocity && api.applyLocalForce) {
          const position = new THREE.Vector3();
          api.position.get(position);
          
          if (position.y > 0.1) {
            // Car is above ground level - apply correction
            const velocity = new THREE.Vector3();
            api.velocity.get(velocity);
            
            // Reset vertical velocity and apply strong downward force
            api.velocity.set(velocity.x, Math.min(velocity.y, -1), velocity.z);
            api.applyLocalForce([0, -15000, 0], [0, 0, 0]);
            
            // If really high, teleport back down
            if (position.y > 2) {
              console.log("Car too high, resetting position");
              api.position.set(position.x, 0, position.z);
              api.velocity.set(0, 0, 0);
            }
          }
        }
      } catch (error) {
        console.error("Error in grounding system:", error);
      }
    }, 100); // Check frequently
    
    return () => clearInterval(groundingInterval);
  }, [api, props.usePhysics]);

  return (
    <group ref={ref} {...props} dispose={null}>
      {scene && <primitive object={scene} scale={props.scale} />}
    </group>
  )
}

// Preload the model with the correct path
useGLTF.preload('/models/2024_byd_sealion_7/scene.gltf')