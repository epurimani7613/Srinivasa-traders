import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';

/**
 * 3D Animated Logo Component
 * Creates an interactive 3D shopping bag logo with floating animation
 */
function AnimatedLogo() {
  const meshRef = useRef();
  const torusRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Swing the entire group horizontally (left and right) and float slightly
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(t * 0.8) * 0.6;
      groupRef.current.position.y = Math.cos(t * 0.5) * 0.2;
    }
    
    // Rotate the main sphere
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
    
    // Rotate the torus ring
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.3;
      torusRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main sphere with distortion effect */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Floating torus ring */}
      <Torus ref={torusRef} args={[1.4, 0.1, 16, 100]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </Torus>
      
      {/* Small orbiting spheres */}
      <Sphere args={[0.15, 16, 16]} position={[1.8, 0.5, 0]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere args={[0.12, 16, 16]} position={[-1.5, -0.3, 0.5]}>
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </Sphere>
    </group>
  );
}

/**
 * 3D Logo Canvas Component
 * Wraps the 3D scene with proper lighting and camera
 */
export default function ThreeDLogo() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
        
        {/* Animated Logo */}
        <AnimatedLogo />
      </Canvas>
    </div>
  );
}
