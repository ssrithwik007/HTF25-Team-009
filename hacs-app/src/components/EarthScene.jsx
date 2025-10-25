import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, Center } from "@react-three/drei";
import { Suspense, useRef } from "react";
import Galaxy from "./Galaxy";

function EarthModel() {
  const { scene } = useGLTF("/models/earth.glb");
  const groupRef = useRef();
  
  // Rotate Earth continuously around its tilted axis
  useFrame((state, delta) => {
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.2;
    }
  });
  
  // Earth's axial tilt is 23.5 degrees (converted to radians)
  const earthTilt = (23.5 * Math.PI) / 180;
  
  return (
    <group ref={groupRef} position={[-7, -6, -10]} scale={0.02} rotation={[0, 0, earthTilt]}>
      <Center>
        <primitive object={scene} scale={1}/>
      </Center>
    </group>
  );
}


export default function EarthScene() {
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

      {/* Three.js Canvas with Earth */}
      <div className="absolute inset-0 z-10">
        <Canvas 
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />

          <Suspense fallback={null}>
              <EarthModel />
          </Suspense>

          <OrbitControls 
            enableZoom={false} 
            enableRotate={false} 
            enablePan={false}
          />
        </Canvas>
      </div>
    </div>
  );
}
