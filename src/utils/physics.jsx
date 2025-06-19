import { Physics } from '@react-three/cannon';

// Custom Physics component with optimized settings for car simulation
export const PhysicsWorld = ({ children }) => {
  return (
    <Physics
      iterations={30} // More iterations for better stability and ground contact
      tolerance={0.000001} // Lower tolerance for more accurate collision detection
      defaultContactMaterial={{
        friction: 1.0, // Maximum friction to keep car from sliding
        restitution: 0.0, // No bounce at all
        contactEquationStiffness: 1e10, // Ultra rigid contacts for better ground interaction
        contactEquationRelaxation: 1, // Minimum relaxation to prevent sinking
        frictionEquationStiffness: 1e9, // Higher friction stiffness for better traction
        frictionEquationRelaxation: 2, // Better friction stability
      }}
      gravity={[0, -40, 0]} // Significantly stronger gravity to keep car grounded
      step={1/120} // Smaller step for more accurate physics
      broadphase="SAP" // Sweep and prune broadphase for better performance
      allowSleep={false} // Never allow objects to sleep
    >
      {children}
    </Physics>
  );
};