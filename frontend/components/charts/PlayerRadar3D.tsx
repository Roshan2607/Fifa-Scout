"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

interface RadarData { stat: string; value: number; }

// Resolve CSS var to hex at runtime
function resolveColor(color: string): string {
  if (color.startsWith("var(")) {
    if (typeof window === "undefined") return "#00e5a0";
    const varName = color.slice(4, -1).trim();
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return resolved || "#00e5a0";
  }
  return color;
}

function RadarMesh({ data, color = "#00e5a0" }: { data: RadarData[]; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const n = data.length;
  const radius = 2.2;
  const resolvedColor = resolveColor(color);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) meshRef.current.rotation.y = t * 0.25;
    if (glowRef.current) glowRef.current.rotation.y = t * 0.25;
  });

  const shape = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = (data[i].value / 99) * radius;
      pts.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
    }
    return new THREE.Shape(pts);
  }, [data, n, radius]);

  const extrudeSettings = { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 };

  const gridRings = [0.25, 0.5, 0.75, 1.0].map(t => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * t * radius, Math.sin(angle) * t * radius, 0.09));
    }
    return pts;
  });

  const axes = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.1)];
  });

  const threeColor = new THREE.Color(resolvedColor);

  return (
    <group>
      <mesh ref={meshRef}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color={threeColor} transparent opacity={0.55} emissive={threeColor} emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glowRef}>
        <extrudeGeometry args={[shape, { ...extrudeSettings, depth: 0.22 }]} />
        <meshStandardMaterial color={threeColor} transparent opacity={0.12} emissive={threeColor} emissiveIntensity={0.8} side={THREE.DoubleSide} wireframe />
      </mesh>
      {gridRings.map((pts, ri) => (
        <line key={ri}><bufferGeometry setFromPoints={pts} /><lineBasicMaterial color="#ffffff" transparent opacity={0.07} /></line>
      ))}
      {axes.map((pts, ai) => (
        <line key={ai}><bufferGeometry setFromPoints={pts} /><lineBasicMaterial color="#ffffff" transparent opacity={0.12} /></line>
      ))}
      {data.map((d, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = radius + 0.5;
        return (
          <Text key={d.stat} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0.1]}
            fontSize={0.22} color="#8ba0b8" anchorX="center" anchorY="middle">
            {d.stat.toUpperCase()}
          </Text>
        );
      })}
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color={resolvedColor} />
      <pointLight position={[-4, -4, 4]} intensity={0.4} color="#0ea5e9" />
    </group>
  );
}

export function PlayerRadar3D({ data, color = "#00e5a0" }: { data: RadarData[]; color?: string }) {
  return (
    <div style={{ width: "100%", height: 240 }}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 55 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <RadarMesh data={data} color={color} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}