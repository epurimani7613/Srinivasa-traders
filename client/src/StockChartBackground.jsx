import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Neon Line Component
 * Creates glowing neon lines that flow upward and to the right
 */
function NeonLine({ points, color, speed, delay }) {
  const lineRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + delay;
    
    if (lineRef.current) {
      // Animate line positions flowing upward and right
      const positions = lineRef.current.geometry.attributes.position.array;
      for (let i = 0; i < points.length; i++) {
        const idx = i * 3;
        const originalY = points[i][1];
        const originalX = points[i][0];
        
        // Flow upward and right with wave motion
        positions[idx] = originalX + Math.sin(t * speed + i * 0.5) * 0.5;
        positions[idx + 1] = originalY + t * 0.3;
        positions[idx + 2] = Math.sin(t * speed * 0.5 + i) * 0.3;
      }
      
      // Reset positions when they go too high for looping effect
      if (positions[1] > 20) {
        for (let i = 0; i < points.length; i++) {
          positions[i * 3 + 1] -= 25;
        }
      }
      
      lineRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Pulsing glow effect
      const pulse = 0.5 + Math.sin(t * 2) * 0.3;
      lineRef.current.material.opacity = pulse;
    }
    
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.2;
    }
  });

  const linePoints = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p[0], p[1], p[2]))
    );
  }, [points]);

  return (
    <group>
      {/* Main neon line */}
      <line ref={lineRef} geometry={linePoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flat())}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          linewidth={2}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </line>
      
      {/* Glow effect */}
      <line ref={glowRef} geometry={linePoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flat())}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          linewidth={6}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

/**
 * Data Node Component
 * Creates glowing data points on the chart
 */
function DataNode({ position, color, delay }) {
  const meshRef = useRef();
  const ringRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + delay;
    
    if (meshRef.current) {
      // Pulsing scale
      const scale = 1 + Math.sin(t * 3) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
      
      // Pulsing emissive
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;
      
      // Move upward slowly
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.2;
    }
    
    if (ringRef.current) {
      // Expanding ring effect
      const ringScale = 1 + Math.sin(t * 2) * 0.5;
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
      ringRef.current.material.opacity = 0.5 - Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Main node */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Expanding ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/**
 * Stock Chart Lines Component
 * Creates multiple neon lines representing stock data
 */
function StockChartLines() {
  const lines = useMemo(() => {
    const lineData = [];
    const colors = [0x00ff88, 0x00d4ff, 0x0099ff, 0x00ffcc];
    
    for (let i = 0; i < 4; i++) {
      const points = [];
      const startX = -15 + i * 5;
      const startY = -5 + Math.random() * 5;
      
      for (let j = 0; j < 20; j++) {
        points.push([
          startX + j * 1.5,
          startY + Math.sin(j * 0.5) * 2 + Math.random() * 1,
          (Math.random() - 0.5) * 2
        ]);
      }
      
      lineData.push({
        points,
        color: colors[i],
        speed: 0.5 + Math.random() * 0.5,
        delay: Math.random() * Math.PI * 2
      });
    }
    
    return lineData;
  }, []);

  return (
    <group>
      {lines.map((line, i) => (
        <NeonLine key={i} {...line} />
      ))}
    </group>
  );
}

/**
 * Data Nodes Component
 * Creates data points along the chart lines
 */
function DataNodes() {
  const nodes = useMemo(() => {
    const nodeData = [];
    const colors = [0x00ff88, 0x00d4ff, 0x0099ff, 0x00ffcc];
    
    for (let i = 0; i < 20; i++) {
      nodeData.push({
        position: [
          -15 + Math.random() * 30,
          -5 + Math.random() * 15,
          (Math.random() - 0.5) * 3
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * Math.PI * 2
      });
    }
    
    return nodeData;
  }, []);

  return (
    <group>
      {nodes.map((node, i) => (
        <DataNode key={i} {...node} />
      ))}
    </group>
  );
}

/**
 * Elegant Particles Component
 * Creates floating particles for ambient effect
 */
function ElegantParticles({ count = 200 }) {
  const particlesRef = useRef();
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );
    }
    return new Float32Array(pos);
  }, [count]);

  const colors = useMemo(() => {
    const col = [];
    const colorOptions = [
      new THREE.Color(0x00ff88),
      new THREE.Color(0x00d4ff),
      new THREE.Color(0x0099ff)
    ];
    for (let i = 0; i < count; i++) {
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      col.push(color.r, color.g, color.b);
    }
    return new Float32Array(col);
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.getElapsedTime();
      particlesRef.current.rotation.y = t * 0.05;
      particlesRef.current.rotation.x = t * 0.02;
      
      // Animate particles flowing upward and right
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        positions[idx] += Math.sin(t * 0.1 + i) * 0.01; // Slight right movement
        positions[idx + 1] += 0.02; // Upward movement
        
        // Reset for looping
        if (positions[idx + 1] > 15) {
          positions[idx + 1] = -15;
        }
        if (positions[idx] > 25) {
          positions[idx] = -25;
        }
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
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Camera Controller Component
 * Implements smooth camera movement
 */
function CameraController() {
  const cameraRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (state.camera) {
      // Smooth camera movement
      state.camera.position.x = Math.sin(t * 0.1) * 2;
      state.camera.position.y = 5 + Math.sin(t * 0.15) * 1;
      state.camera.position.z = 20 + Math.cos(t * 0.1) * 2;
      state.camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

/**
 * Futuristic Stock Market Chart Background
 * Complete 3D motion graphics scene
 */
export default function StockChartBackground() {
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
        background: 'linear-gradient(to bottom, #0a0a1a, #0d1b2a)'
      }}
    >
      <Canvas
        camera={{ position: [0, 5, 20], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Camera Controller */}
        <CameraController />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 20, 10]} intensity={1} color="#00ff88" />
        <pointLight position={[-10, 15, -10]} intensity={0.8} color="#00d4ff" />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#0099ff" />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a1a', 30, 80]} />
        
        {/* Stock Chart Lines */}
        <StockChartLines />
        
        {/* Data Nodes */}
        <DataNodes />
        
        {/* Elegant Particles */}
        <ElegantParticles count={300} />
      </Canvas>
    </div>
  );
}
