import { Physics } from '@react-three/cannon';

// Custom Physics component with optimized settings for car simulation
export const PhysicsWorld = ({ children }) => {
  return (
    <Physics
      iterations={8}
      tolerance={0.0001}
      defaultContactMaterial={{
        friction: 0.7,
        restitution: 0.3,
        contactEquationStiffness: 1e7,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e7
      }}
      gravity={[0, -9.81, 0]}
      step={1/60}
    >
      {children}
    </Physics>
  );
};