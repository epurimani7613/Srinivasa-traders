import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Glowing Grid Floor Component
 * Creates a professional grid floor with glow effect
 */
function GlowingGrid() {
  const gridRef = useRef();
  
  useFrame((state) => {
    if (gridRef.current) {
      // Subtle grid movement for dynamic effect
      gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 10;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[100, 100, 0x6366f1, 0x1e1b4b]}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

/**
 * 3D Data Bar Component
 * Individual bar that grows and pulses with light
 */
function DataBar({ position, delay, maxHeight, color }) {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + delay;
    
    if (meshRef.current) {
      // Dynamic height animation
      const targetHeight = 0.5 + Math.sin(t * 0.5) * 0.3 + Math.random() * 0.2;
      const currentHeight = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        targetHeight * maxHeight,
        0.05
      );
      meshRef.current.scale.y = currentHeight;
      meshRef.current.position.y = currentHeight / 2 - 2;
      
      // Pulsing emissive effect
      const pulse = 0.3 + Math.sin(t * 2) * 0.2;
      meshRef.current.material.emissiveIntensity = pulse;
    }
    
    if (glowRef.current) {
      // Glow follows the bar
      glowRef.current.position.y = meshRef.current.position.y + meshRef.current.scale.y / 2;
      glowRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Main bar */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow sphere at top */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Data point indicator */}
      <mesh position={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Data Visualization Field Component
 * Creates a field of animated data bars
 */
function DataVisualizationField() {
  const bars = useMemo(() => {
    const positions = [];
    const gridSize = 8;
    const spacing = 2;
    
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        // Skip center area for cleaner look
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
        
        const height = 1 + Math.random() * 3;
        const delay = Math.random() * Math.PI * 2;
        
        // Color based on height (gradient from blue to purple to pink)
        let color;
        if (height < 1.5) {
          color = 0x6366f1; // Indigo
        } else if (height < 2.5) {
          color = 0x8b5cf6; // Violet
        } else {
          color = 0xec4899; // Pink
        }
        
        positions.push({
          position: [x * spacing, 0, z * spacing],
          delay,
          maxHeight: height,
          color
        });
      }
    }
    return positions;
  }, []);

  return (
    <group>
      {bars.map((bar, i) => (
        <DataBar key={i} {...bar} />
      ))}
    </group>
  );
}

/**
 * Floating Data Particles Component
 * Adds floating particles around the data visualization
 */
function FloatingParticles({ count = 50 }) {
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push(
        (Math.random() - 0.5) * 40,
        Math.random() * 10 - 2,
        (Math.random() - 0.5) * 40
      );
    }
    return new Float32Array(pos);
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.getElapsedTime();
      particlesRef.current.rotation.y = t * 0.1;
      
      // Animate individual particles
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3 + 1; // Y position
        positions[idx] += Math.sin(t + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#6366f1"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Immersive 3D Data Background Component
 * Complete data visualization scene with grid, bars, and particles
 */
export default function DataBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)'
      }}
    >
      <Canvas
        camera={{ position: [15, 12, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 20, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, 15, -10]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#ec4899" />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0f172a', 20, 60]} />
        
        {/* Grid Floor */}
        <GlowingGrid />
        
        {/* Data Visualization Bars */}
        <DataVisualizationField />
        
        {/* Floating Particles */}
        <FloatingParticles count={100} />
      </Canvas>
    </div>
  );
}
