import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

function FloatingOrb({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const initialY = position[1]

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    meshRef.current.position.y = initialY + Math.sin(t) * 0.5
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.3
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <Stars
        radius={80}
        depth={60}
        count={2500}
        factor={3}
        saturation={0.2}
        fade
        speed={0.4}
      />
      <FloatingOrb position={[-3, 2, -5]} color="#f0c040" speed={0.8} />
      <FloatingOrb position={[4, -1, -8]} color="#8b5cf6" speed={0.6} />
      <FloatingOrb position={[1, 3, -10]} color="#3b82f6" speed={0.5} />
    </>
  )
}

export default function ParticleBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
