import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

const mouse = { x: 0, y: 0 }

function MouseParallax() {
  const { camera } = useThree()

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    const targetX = mouse.x * 0.3
    const targetY = mouse.y * 0.3
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
  })

  return null
}

function FloatingOrb({
  position,
  color,
  speed = 1,
  radius = 0.08,
}: {
  position: [number, number, number]
  color: string
  speed?: number
  radius?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const initialY = position[1]
  const initialX = position[0]

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    meshRef.current.position.y = initialY + Math.sin(t) * 0.5
    meshRef.current.position.x = initialX + Math.cos(t * 0.7) * 0.3
    meshRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.15)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

function OrganicBlob() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = t * 0.1
    meshRef.current.rotation.y = t * 0.15
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -15]}>
      <sphereGeometry args={[3, 32, 32]} />
      <MeshDistortMaterial
        color="#1a1a3e"
        emissive="#8b5cf6"
        emissiveIntensity={0.05}
        roughness={0.8}
        metalness={0.2}
        distort={0.3}
        speed={1.5}
        transparent
        opacity={0.4}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <MouseParallax />

      <Stars
        radius={80}
        depth={60}
        count={3000}
        factor={3}
        saturation={0.2}
        fade
        speed={0.4}
      />

      <Sparkles
        count={40}
        scale={12}
        size={1.5}
        speed={0.3}
        opacity={0.4}
        color="#f0c040"
      />

      <OrganicBlob />

      {/* Original orbs */}
      <FloatingOrb position={[-3, 2, -5]} color="#f0c040" speed={0.8} />
      <FloatingOrb position={[4, -1, -8]} color="#8b5cf6" speed={0.6} />
      <FloatingOrb position={[1, 3, -10]} color="#3b82f6" speed={0.5} />

      {/* Additional orbs with varied sizes */}
      <FloatingOrb position={[-5, -2, -12]} color="#22c55e" speed={0.4} radius={0.12} />
      <FloatingOrb position={[6, 1, -15]} color="#f0c040" speed={0.35} radius={0.15} />
      <FloatingOrb position={[-2, -3, -7]} color="#8b5cf6" speed={0.7} radius={0.05} />
      <FloatingOrb position={[3, 4, -13]} color="#3b82f6" speed={0.45} radius={0.1} />
      <FloatingOrb position={[-4, 0, -9]} color="#ef4444" speed={0.55} radius={0.06} />
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
