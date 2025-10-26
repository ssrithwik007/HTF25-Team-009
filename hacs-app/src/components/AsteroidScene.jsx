import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, Center, SpotLight } from "@react-three/drei";
import { Suspense, useRef } from "react";
import Galaxy from "./Galaxy";

function AsteroidModel() {
  const { scene } = useGLTF("/models/asteroid_01.glb");
  const groupRef = useRef();
  
  // Rotate asteroid continuously around its center
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.2;
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.z += delta * 0.3;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 20, -60]} scale={0.03}>
      <Center>
        <primitive object={scene} scale={2} />
      </Center>
    </group>
  );
}

// Asteroid following elliptical path
function EllipticalAsteroid({ offset = 0, speed = 1 }) {
  const { scene } = useGLTF("/models/asteroid_01.glb");
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Elliptical path parameters
      const time = state.clock.elapsedTime * speed + offset;
      const a = 24; // Semi-major axis (horizontal width)
      const b = 13;  // Semi-minor axis (vertical height)
      const z = -7; // Position in front of camera
      
      // Calculate elliptical position (only show the top arc above Earth)
      const x = a * Math.cos(time);
      const y = b * Math.sin(time) - 8; // Position above Earth's horizon
      
      groupRef.current.position.set(x, y, z);
      
      // Rotate asteroid
      groupRef.current.rotation.x += delta * 0.3;
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.z += delta * 0.25;
    }
  });
  
  return (
    <group ref={groupRef} scale={0.008}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  );
}

function EarthModel() {
  const { scene } = useGLTF("/models/earth_3k.glb");
  const groupRef = useRef();
  
  // Rotate asteroid continuously around its center
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.2; // Rotate around X-axis
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -17, 0]} scale={0.002} rotation={[0, 0, 90 * (Math.PI / 180)]}>
      <Center>
        <primitive object={scene} scale={2} />
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
      intensity={170}
      distance={12}
      decay={0}
      color="#FFFFFF"
    />
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
              {/* <AsteroidModel /> */}
              <EarthModel />
              
              {/* Five asteroids following elliptical paths evenly distributed */}
              <EllipticalAsteroid offset={0} speed={0.3} />
              <EllipticalAsteroid offset={1.26} speed={0.3} />
              <EllipticalAsteroid offset={2.51} speed={0.3} />
              <EllipticalAsteroid offset={3.77} speed={0.3} />
              <EllipticalAsteroid offset={5.03} speed={0.3} />
          </Suspense>

          <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
}
