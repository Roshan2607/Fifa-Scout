"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const [positions, colors] = useMemo(() => {
    const count = 1600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 50;
      pos[i*3+1] = (Math.random() - 0.5) * 35;
      pos[i*3+2] = (Math.random() - 0.5) * 25;
      const t = Math.random();
      // Hard-coded greens/blues — no CSS vars
      col[i*3]   = t < 0.5 ? 0 : 0.05;
      col[i*3+1] = t < 0.5 ? 0.56 + t*0.4 : 0.4 + t*0.2;
      col[i*3+2] = t < 0.5 ? 0.38 : 0.6 + t*0.3;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.012 + mouse.x * 0.15;
    mesh.current.rotation.x = t * 0.006 + mouse.y * 0.10;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Ring({ r, spd, tilt, opacity = 0.06 }: { r: number; spd: number; tilt: number; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(s => { if (ref.current) { ref.current.rotation.z = s.clock.getElapsedTime() * spd; ref.current.rotation.x = tilt; } });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[r, 0.01, 6, 100]} />
      {/* Hard-coded hex — no CSS vars */}
      <meshBasicMaterial color="#00e5a0" transparent opacity={opacity} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <Particles />
      <Ring r={8}  spd={0.05}  tilt={0.3}  opacity={0.05} />
      <Ring r={12} spd={-0.03} tilt={1.2}  opacity={0.035} />
      <Ring r={17} spd={0.02}  tilt={0.65} opacity={0.025} />
    </>
  );
}

export function Background() {
  return (
    <>
      <div className="pitch-bg" />
      <div className="fluid-bg">
        <div className="fluid-blob blob-1" />
        <div className="fluid-blob blob-2" />
        <div className="fluid-blob blob-3" />
      </div>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Canvas
          camera={{ position: [0, 0, 16], fov: 65 }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </div>
    </>
  );
}