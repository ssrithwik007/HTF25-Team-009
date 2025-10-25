import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, Center } from "@react-three/drei";
import { Suspense, useRef } from "react";
import Galaxy from "./Galaxy";

function AsteroidModel() {
  const { scene } = useGLTF("/models/asteroid_ceres.glb");
  const groupRef = useRef();
  
  // Rotate asteroid continuously around its center
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.2; // Rotate around Y-axis
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -4, 0]} scale={1}>
      <Center>
        <primitive object={scene} scale={2} />
      </Center>
    </group>
  );
}


export default function AsteroidScene() {
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
          animatonSpeed={1}
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
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} />

          <Suspense fallback={null}>
              <AsteroidModel />
          </Suspense>

          <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
}
