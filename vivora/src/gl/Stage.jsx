import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial, Text3D, Center } from '@react-three/drei';
import helvetiker from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { P, S, stepSmooth } from '../lib/progress.js';
import { store } from '../lib/store.js';
import { dumbbellGeometry } from '../lib/zMark.js';
import { wordmarkCanvas, outlineTexture, cardTexture, rng } from '../lib/textures.js';
import { wallVert, wallFrag, cardVert, cardFrag } from './shaders.js';
import { WORKS } from '../data/content.js';
import { range, easeInOut, easeOut, lerp } from '../lib/scroll.js';

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ----------------------------- Hero ----------------------------- */
function Wall() {
  const mat = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMode: { value: 0 }, uIntensity: { value: 1 }, uGridOnly: { value: 0 }, uOpacity: { value: 1 } }), []);
  useFrame((s) => {
    const u = mat.current.uniforms; u.uTime.value = s.clock.elapsedTime;
    const h = S.hero, w = S.worksIntro, r = S.works;
    u.uMode.value = ss(0.15, 0.85, h) * (1 - ss(0.1, 0.3, w));
    u.uGridOnly.value = ss(0.12, 0.35, w) * (1 - ss(0.0, 0.08, r) * 0.4);
    u.uIntensity.value = lerp(1, 0.55, ss(0.12, 0.35, w)) * (1 - ss(0.0, 0.1, r) * 0.25);
  });
  return (
    <mesh position={[0, 0, 4]} renderOrder={-2}>
      <cylinderGeometry args={[14, 14, 22, 160, 1, true]} />
      <shaderMaterial ref={mat} side={THREE.BackSide} uniforms={uniforms} vertexShader={wallVert} fragmentShader={wallFrag} depthWrite={false} transparent />
    </mesh>
  );
}

function GhostLetters() {
  const tex = useMemo(() => outlineTexture('VIVORA'), []);
  const ref = useRef();
  useFrame(() => { ref.current.material.opacity = 0.07 * (1 - ss(0.05, 0.25, S.worksIntro)); });
  return (
    <mesh ref={ref} position={[-1, 0.5, -6]} rotation={[0, 0, -0.32]}>
      <planeGeometry args={[22, 22]} />
      <meshBasicMaterial map={tex} transparent opacity={0.07} depthWrite={false} />
    </mesh>
  );
}

function Wordmark() {
  const { viewport } = useThree();
  const canvas = useMemo(() => document.createElement('canvas'), []);
  const tex = useMemo(() => { wordmarkCanvas('VIVORA', store.get().material.noiseScale, canvas); const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }, [canvas]);
  const mat = useRef(); const mesh = useRef(); const lastNoise = useRef(store.get().material.noiseScale);
  useEffect(() => store.subscribe(() => {
    const m = store.get().material;
    mat.current.color.set(m.color);
    if (Math.abs(m.noiseScale - lastNoise.current) > 0.05) { lastNoise.current = m.noiseScale; wordmarkCanvas('VIVORA', m.noiseScale, canvas); tex.needsUpdate = true; }
  }), [canvas, tex]);
  const vp = viewport.getCurrentViewport(undefined, [0, 0, 0]);
  const w = Math.min(vp.width * 0.84, 14); const h = w / 4;
  useFrame((s) => {
    const fade = 1 - ss(0.04, 0.2, S.worksIntro);
    mat.current.opacity = fade * (P.intro ?? 1);
    mesh.current.position.y = -0.08 + Math.sin(s.clock.elapsedTime * 0.5) * 0.01;
    mesh.current.scale.setScalar(1 + ss(0, 0.25, S.worksIntro) * 0.25);
  });
  return (
    <mesh ref={mesh} position={[0, -0.08, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial ref={mat} map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Prism() {
  const mesh = useRef(); const group = useRef();
  const geom = useMemo(() => dumbbellGeometry(), []);
  const { viewport } = useThree();
  const drag = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const [roughness, setRoughness] = useState(store.get().material.roughness);
  useEffect(() => store.subscribe(() => setRoughness(store.get().material.roughness)), []);
  useEffect(() => {
    const onDrag = (e) => { drag.current.vx += e.detail.dx * 0.004; drag.current.vy += e.detail.dy * 0.004; };
    let lastReset = store.get().resetQuat;
    const unsub = store.subscribe(() => { const r = store.get().resetQuat; if (r !== lastReset) { lastReset = r; drag.current.x = 0; drag.current.y = 0; } });
    window.addEventListener('prism-drag', onDrag);
    return () => { window.removeEventListener('prism-drag', onDrag); unsub(); };
  }, []);
  const frame = useRef(0);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime; const d = drag.current;
    d.x += d.vx; d.y += d.vy; d.vx *= 0.9; d.vy *= 0.9;
    const h = S.hero, w = S.worksIntro;
    const vp = viewport.getCurrentViewport(undefined, [0, 0, 1.2]);
    const base = Math.min(vp.height * 0.78, vp.width * 0.5);
    const fly = easeInOut(range(w, 0.02, 0.3));
    group.current.position.set(S.mouse.x * 0.08, 0.05 + S.mouse.y * 0.05 + fly * 0.2, lerp(1.2, 9.6, fly));
    group.current.scale.setScalar(base * (0.92 + 0.08 * (P.intro ?? 1)) * lerp(1, 1.6, fly));
    mesh.current.rotation.set(
      0.35 + Math.sin(t * 0.21) * 0.08 + d.y + S.mouse.y * -0.12,
      t * 0.35 + d.x + h * Math.PI * 1.2 + S.mouse.x * 0.25,
      -0.32 + Math.sin(t * 0.17) * 0.06,
    );
    group.current.visible = w < 0.32;
    if (++frame.current % 6 === 0) { const q = mesh.current.quaternion; store.set({ quat: [q.x, q.y, q.z, q.w] }); }
  });
  return (
    <group ref={group} position={[0, 0, 1.2]}>
      <mesh ref={mesh} geometry={geom}>
        <MeshTransmissionMaterial backside backsideThickness={0.4} samples={4} resolution={512} transmission={1} roughness={roughness} thickness={0.9}
          ior={1.38} chromaticAberration={0.55} anisotropy={0.3} distortion={0.35} distortionScale={0.35} temporalDistortion={0.08}
          iridescence={1} iridescenceIOR={1.5} iridescenceThicknessRange={[0, 1400]} clearcoat={1} clearcoatRoughness={0.1} color="#f6ffe0" attenuationColor="#ffffff" attenuationDistance={2.5} />
      </mesh>
    </group>
  );
}

/* ------------------------- Works intro: shattered type ------------------------- */
function Shatter() {
  const group = useRef(); const word = useRef(); const shards = useRef([]);
  const textures = useMemo(() => WORKS.map((w, i) => cardTexture(w, i)), []);
  const data = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 34 }, (_, i) => {
      const w = 0.22 + r() * 0.85, h = 0.35 + r() * 1.5;
      const z = -1.1 + r() * 2.8;
      const iri = r() < 0.4;
      // crop a window of the shared card texture through the plane's UVs (no texture copies)
      const geo = new THREE.PlaneGeometry(w, h);
      if (!iri) {
        const sx = w / 5.4, sy = h / 3.38, ox = r() * (1 - sx), oy = r() * (1 - sy);
        const uv = geo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, ox + uv.getX(k) * sx, oy + uv.getY(k) * sy);
      }
      return { w, h, iri, geo, map: iri ? null : textures[i % textures.length], base: new THREE.Vector3(-4.6 + r() * 9.2, -1.4 + r() * 2.8, z), rot: new THREE.Euler((r() - 0.5) * 0.6, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6), depth: 0.15 + ((z + 1.1) / 2.8) * 0.65, dir: new THREE.Vector3(r() - 0.5, r() - 0.5, 0.6 + r()).normalize(), spin: (r() - 0.5) * 2 };
    });
  }, [textures]);
  useFrame((s) => {
    const w = S.worksIntro, t = s.clock.elapsedTime;
    const show = ss(0.14, 0.3, w) * (1 - ss(0.9, 1, w) * 0.0);
    const burst = easeInOut(range(w, 0.78, 1));
    group.current.visible = show > 0.001 && S.works < 0.12;
    group.current.position.z = lerp(-2.5, 0.6, easeOut(range(w, 0.14, 0.78))) + burst * 4.5;
    group.current.rotation.y = S.mouse.x * 0.06; group.current.rotation.x = -S.mouse.y * 0.04;
    if (word.current) { word.current.traverse((o) => { if (o.material) { o.material.opacity = show * (1 - burst); } }); }
    shards.current.forEach((m, i) => {
      if (!m) return; const d = data[i];
      m.position.set(
        d.base.x + S.mouse.x * d.depth * 0.9 + d.dir.x * burst * 9,
        d.base.y + S.mouse.y * d.depth * 0.6 + Math.sin(t * 0.6 + i) * 0.04 + d.dir.y * burst * 7,
        d.base.z + d.dir.z * burst * 10,
      );
      m.rotation.set(d.rot.x + burst * d.spin, d.rot.y + Math.sin(t * 0.4 + i) * 0.05 + burst * d.spin, d.rot.z);
      m.material.opacity = show * (d.iri ? 0.62 : 0.85) * (1 - ss(0.85, 1, w) * 0.6);
    });
  });
  return (
    <group ref={group} visible={false}>
      <Center ref={word} position={[0, 0, 0]}>
        <Text3D font={helvetiker} size={2.25} height={0.3} bevelEnabled bevelSize={0.02} bevelThickness={0.03} bevelSegments={4} curveSegments={6} letterSpacing={0.06}>
          TRAIN
          <meshPhysicalMaterial color="#f2f3ef" metalness={1} roughness={0.153} iridescence={1} iridescenceIOR={1.9} iridescenceThicknessRange={[100, 800]} envMapIntensity={2.4} transparent />
        </Text3D>
      </Center>
      {data.map((d, i) => (
        <mesh key={i} ref={(el) => (shards.current[i] = el)} geometry={d.geo}>
          {d.iri
            ? <meshPhysicalMaterial color="#e8ffb0" metalness={0.9} roughness={0.12} iridescence={1} iridescenceIOR={1.9} iridescenceThicknessRange={[100, 800]} transparent side={THREE.DoubleSide} envMapIntensity={2} />
            : <meshBasicMaterial map={d.map} transparent side={THREE.DoubleSide} toneMapped={false} />}
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------- Works carousel ------------------------- */
const R = 9, STEP = 0.62;
function Carousel() {
  const group = useRef(); const cards = useRef([]);
  const textures = useMemo(() => WORKS.map((w, i) => cardTexture(w, i)), []);
  const mats = useMemo(() => textures.map((t) => new THREE.ShaderMaterial({
    uniforms: { uTex: { value: t }, uShift: { value: 0 }, uOpacity: { value: 0 }, uDim: { value: 0 }, uTime: { value: 0 }, uBend: { value: 0.028 } },
    vertexShader: cardVert, fragmentShader: cardFrag, transparent: true, side: THREE.DoubleSide, depthWrite: false,
  })), [textures]);
  const cur = useRef(0); const shift = useRef(0);
  useFrame((s) => {
    const r = S.works; const appear = ss(0.86, 1, S.worksIntro);
    group.current.visible = appear > 0.001;
    const target = Math.min(WORKS.length - 1, Math.max(0, r * (WORKS.length - 0.6) - 0.15));
    cur.current = lerp(cur.current, target, 0.09);
    shift.current = lerp(shift.current, Math.max(-1, Math.min(1, P.velocity / 2600)), 0.12);
    cards.current.forEach((m, i) => {
      if (!m) return; const off = i - cur.current; const a = off * STEP;
      m.position.set(Math.sin(a) * R, 0.12, 10 - Math.cos(a) * R - (1 - appear) * 3);
      m.rotation.set(0, -a, 0);
      const u = mats[i].uniforms; u.uTime.value = s.clock.elapsedTime; u.uShift.value = shift.current;
      u.uOpacity.value = appear * ss(2.6, 1.4, Math.abs(off)); u.uDim.value = Math.min(0.55, Math.abs(off) * 0.35);
    });
  });
  return (
    <group ref={group} visible={false}>
      {WORKS.map((w, i) => (
        <mesh key={w.title} ref={(el) => (cards.current[i] = el)} material={mats[i]}>
          <planeGeometry args={[5.4, 3.38, 48, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Lights() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#050507']} />
      <Lightformer form="rect" intensity={4} color="#ffffff" position={[0, 5, -6]} scale={[12, 1.2, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#d4ff3a" position={[-6, 0, -2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 2, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#ff7a3d" position={[6, -1, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 2, 1]} />
      <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 0, 6]} scale={4} />
      <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[0, -5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
    </Environment>
  );
}

function Stopper() {
  const { gl } = useThree();
  useFrame((_, dt) => { stepSmooth(dt); gl.domElement.style.visibility = P.stageActive ? 'visible' : 'hidden'; }, -1);
  return null;
}

export default function Stage() {
  const [active, setActive] = useState(true);
  useEffect(() => { const id = setInterval(() => setActive(P.stageActive), 250); return () => clearInterval(id); }, []);
  return (
    <Canvas className="stage" frameloop={active ? 'always' : 'never'} dpr={[1, 1.5]} camera={{ fov: 35, position: [0, 0, 10], near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: import.meta.env.DEV }} style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <color attach="background" args={['#0b0c0d']} />
      <Lights />
      <Wall />
      <GhostLetters />
      <Wordmark />
      <Prism />
      <Shatter />
      <Carousel />
      <Stopper />
    </Canvas>
  );
}
