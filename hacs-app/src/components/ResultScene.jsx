import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, Center, SpotLight } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import Galaxy from "./Galaxy";

// Particle system for explosion
function ExplosionParticles({ position, isActive }) {
  const particlesRef = useRef();
  const particleCount = 50;
  const particles = useRef([]);
  const startTime = useRef(null);
  
  // Initialize particles
  if (particles.current.length === 0) {
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        angle: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 4,
        size: 0.1 + Math.random() * 0.3,
        color: Math.random() > 0.5 ? '#ff8800' : '#ffff00', // Orange or Yellow
        elevation: (Math.random() - 0.5) * 2,
      });
    }
  }
  
  useFrame((state, delta) => {
    if (particlesRef.current && isActive) {
      if (!startTime.current) {
        startTime.current = state.clock.elapsedTime;
      }
      
      const explosionProgress = (state.clock.elapsedTime - startTime.current) / 3;
      
      if (explosionProgress < 1) {
        particlesRef.current.children.forEach((particle, i) => {
          const p = particles.current[i];
          const distance = p.speed * explosionProgress * 5;
          
          particle.position.x = position[0] + Math.cos(p.angle) * distance;
          particle.position.y = position[1] + Math.sin(p.angle) * distance + p.elevation * explosionProgress * 3;
          particle.position.z = position[2] + (Math.random() - 0.5) * distance * 0.5;
          
          // Fade out
          particle.material.opacity = 1 - explosionProgress;
        });
      }
    }
  });
  
  if (!isActive) return null;
  
  return (
    <group ref={particlesRef} position={position}>
      {particles.current.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

// Explosion effect at crash site
function Explosion({ position, isActive, onExplosionEnd, onExplosionMidpoint }) {
  const groupRef = useRef();
  const startTime = useRef(null);
  const hasNotifiedEnd = useRef(false);
  const hasNotifiedReload = useRef(false);
  const hasNotifiedMidpoint = useRef(false);
  
  useFrame((state, delta) => {
    if (groupRef.current && isActive) {
      if (!startTime.current) {
        startTime.current = state.clock.elapsedTime;
      }
      
      const explosionDuration = 3; // 3 seconds for bigger explosion
      const explosionProgress = (state.clock.elapsedTime - startTime.current) / explosionDuration;
      
      // Trigger midpoint callback at 50% of explosion (1.5 seconds)
      if (explosionProgress >= 0.5 && !hasNotifiedMidpoint.current) {
        hasNotifiedMidpoint.current = true;
        if (onExplosionMidpoint) {
          onExplosionMidpoint();
        }
      }
      
      // Trigger reload 0.5 seconds before explosion finishes
      if (explosionProgress >= 0.833 && !hasNotifiedReload.current) { // 0.833 = (3 - 0.5) / 3
        hasNotifiedReload.current = true;
        if (onExplosionEnd) {
          onExplosionEnd();
        }
      }
      
      if (explosionProgress < 1) {
        // Expand dramatically - much bigger scale
        const scale = explosionProgress * 15; // Scale up to 15x
        
        groupRef.current.scale.set(scale, scale, scale);
        
        // Rotate the explosion faster
        groupRef.current.rotation.z += delta * 4;
      } else if (!hasNotifiedEnd.current) {
        // Explosion finished
        hasNotifiedEnd.current = true;
      }
    }
  });
  
  if (!isActive) return null;
  
  return (
    <group ref={groupRef} position={position}>
      {/* Multiple overlapping spheres for massive OPAQUE explosion effect */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#ff4500" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#ff8800" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      {/* Add multiple point lights for massive glow effect */}
      <pointLight intensity={500} color="#ff0000" distance={30} />
      <pointLight intensity={400} color="#ff4500" distance={25} />
      <pointLight intensity={300} color="#ffaa00" distance={20} />
    </group>
  );
}

// Single crashing asteroid
function CrashingAsteroid({ shouldCrash = false, crashDelay = 3, onCrashComplete }) {
  const { scene } = useGLTF("/models/asteroid_01.glb");
  const groupRef = useRef();
  const isCrashing = useRef(false);
  const crashStartTime = useRef(null);
  const hasNotifiedCrash = useRef(false);
  
  // Starting position: top right
  const startPosition = { x: 25, y: 15, z: -5 };
  // Target position: Middle of screen (center, in front)
  const targetPosition = { x: 0, y: -2, z: 5 };
  
  // Starting scale: small
  const startScale = 0.0;
  // Final scale: large
  const finalScale = 0.008;
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Check if should start crashing
      if (shouldCrash && !isCrashing.current && state.clock.elapsedTime > crashDelay) {
        isCrashing.current = true;
        crashStartTime.current = state.clock.elapsedTime;
      }

      if (isCrashing.current) {
        // Crash animation - 4 seconds duration
        const crashDuration = 5;
        const crashProgress = Math.min((state.clock.elapsedTime - crashStartTime.current) / crashDuration, 1);
        
        if (crashProgress < 1) {
          // Ease-in effect for acceleration
          const easedProgress = crashProgress * 0.125 * crashProgress * crashProgress + 0.875 * crashProgress;
          
          // Interpolate position from top right to Earth
          groupRef.current.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
          groupRef.current.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
          groupRef.current.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;
          
          // Grow from small to large
          const currentScale = startScale + (finalScale - startScale) * easedProgress;
          groupRef.current.scale.set(currentScale, currentScale, currentScale);
          
          // Accelerating rotation for dramatic effect
          groupRef.current.rotation.x += delta * (0.5 + easedProgress * 3);
          groupRef.current.rotation.y += delta * (0.3 + easedProgress * 2);
          groupRef.current.rotation.z += delta * (0.4 + easedProgress * 2.5);
        } else {
          // Crash completed - make asteroid disappear
          groupRef.current.scale.set(0, 0, 0);
          
          // Trigger crash complete callback once
          if (!hasNotifiedCrash.current && onCrashComplete) {
            hasNotifiedCrash.current = true;
            onCrashComplete();
          }
        }
      } else {
        // Before crash: idle at starting position
        groupRef.current.position.set(startPosition.x, startPosition.y, startPosition.z);
        groupRef.current.scale.set(startScale, startScale, startScale);
        
        // Gentle rotation while idle
        groupRef.current.rotation.x += delta * 0.2;
        groupRef.current.rotation.y += delta * 0.15;
        groupRef.current.rotation.z += delta * 0.1;
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene.clone()} onUpdate={(self) => {
          self.traverse((child) => {
            if (child.isMesh) {
              child.renderOrder = 10; // Render above Earth
            }
          });
        }} />
      </Center>
    </group>
  );
}


function EarthModel({ isFrozen = false, isVisible = true }) {
  const { scene } = useGLTF("/models/earth_3k_2.glb");
  const groupRef = useRef();
  
  // Rotate asteroid continuously around its center
  useFrame((state, delta) => {
    if (groupRef.current && !isFrozen) {
      groupRef.current.rotation.x += delta * 0.2; // Rotate around X-axis
    }
  });
  
  if (!isVisible) return null;
  
  return (
    <group ref={groupRef} position={[0, -17, -2]} scale={0.002} rotation={[0, 0, 90 * (Math.PI / 180)]}>
      <Center>
        <primitive object={scene} scale={2} onUpdate={(self) => {
          self.traverse((child) => {
            if (child.isMesh) {
              child.renderOrder = 0; // Render Earth behind asteroids
              child.material.depthTest = true;
              child.material.depthWrite = true;
            }
          });
        }} />
      </Center>
    </group>
  );
}

// Camera Light Component
function CameraLight() {
  const lightRef = useRef();
  
  useFrame(({ camera }) => {
    if (lightRef.current) {
      // Make the light follow the camera position
      lightRef.current.position.copy(camera.position);
    }
  });
  
  return (
    <pointLight
      ref={lightRef}
      intensity={100}
      distance={15}
      decay={0}
      color="#FFFFFF"
    />
  );
}

export default function AsteroidScene({ isHazardous = false }) {
  const [hasCrashed, setHasCrashed] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showEarth, setShowEarth] = useState(true);
  
  const handleCrashComplete = () => {
    setHasCrashed(true);
    setShowExplosion(true);
  };
  
  const handleExplosionMidpoint = () => {
    // Hide Earth at the middle of the explosion
    setShowEarth(false);
  };
  
  const handleExplosionEnd = () => {
    // Explosion finished
  };
  
  return (
    <div className="w-full h-screen bg-black relative">
      {/* Galaxy background */}
      <div className="absolute inset-0 z-0">
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.2}
          glowIntensity={0.5}
          saturation={0}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
          hueShift={140}
        />
      </div>

      {/* Three.js Canvas with asteroid */}
      <div className="absolute inset-0 z-10">
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 60 }}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          
          {/* Camera-attached light for Earth */}
          <CameraLight />
          
          {/* Additional light specifically for Earth */}
          <pointLight position={[0, -18, 15]} intensity={180} color="#ffffff" />

          <Suspense fallback={null}>
              {/* Earth - only freeze if hazardous and crashed, hide after explosion */}
              <EarthModel isFrozen={isHazardous && hasCrashed} isVisible={showEarth} />
              
              {/* Only show crash-related elements if hazardous */}
              {isHazardous && (
                <>
                  {/* Single crashing asteroid - starts top right, crashes into Earth if hazardous */}
                  <CrashingAsteroid 
                    shouldCrash={isHazardous} 
                    crashDelay={1.5} 
                    onCrashComplete={handleCrashComplete}
                  />
                  
                  {/* Explosion effect at crash site */}
                  <Explosion 
                    position={[0, -2, 5]} 
                    isActive={showExplosion} 
                    onExplosionMidpoint={handleExplosionMidpoint}
                    onExplosionEnd={handleExplosionEnd}
                  />
                  
                  {/* Flying particles around explosion */}
                  <ExplosionParticles 
                    position={[0, -2, 5]} 
                    isActive={showExplosion} 
                  />
                </>
              )}
          </Suspense>

          <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
}
