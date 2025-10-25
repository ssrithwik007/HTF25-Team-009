import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, Center } from "@react-three/drei";
import { Suspense, useRef } from "react";

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
    <group ref={groupRef} position={[0, -14, 0]} scale={2.7}>
      <Center>
        <primitive object={scene} scale={2} />
      </Center>
    </group>
  );
}


export default function AsteroidScene() {
  return (
    <div className="w-full h-screen bg-black">
     <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} />

        <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={2000} factor={4} fade />
            <AsteroidModel />
        </Suspense>

        <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
    </Canvas>

    </div>
  );
}
