import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Particle Component
 * Creates individual floating particles with glow effect
 */
function Particle({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Drift slowly horizontally (from left to right) and wrap around
      let x = position[0] + t * 0.3;
      x = ((x + 10) % 20) - 10;
      meshRef.current.position.x = x;
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.5;
      meshRef.current.material.opacity = 0.3 + Math.sin(t * 2 + position[0]) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * 3D Particle Field Component
 * Creates a field of floating particles
 */
function ParticleField({ count = 100 }) {
  const particles = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      ]);
    }
    return positions;
  }, [count]);

  return (
    <group>
      {particles.map((position, i) => (
        <Particle key={i} position={position} />
      ))}
    </group>
  );
}

/**
 * 3D Background Canvas Component
 * Provides an interactive particle background
 */
export default function ThreeDBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#10b981" />
        
        {/* Particle Field */}
        <ParticleField count={150} />
      </Canvas>
    </div>
  );
}
