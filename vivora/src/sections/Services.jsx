import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSectionProgress, useNearViewport, range, easeInOut, easeOut, lerp, remeasure } from '../lib/scroll.js';
import { useSectionMeta } from '../lib/sectionMeta.js';
import { serviceTextTexture, photoTexture } from '../lib/textures.js';
import { wallVert, warpFrag, svcFrag } from '../gl/shaders.js';
import { SERVICES } from '../data/content.js';
import ScrambleText from '../components/ScrambleText.jsx';
import Crosses from '../components/Crosses.jsx';
import { store } from '../lib/store.js';

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- SERVICE intro: warped panel growing from the vision slab ---------- */
function WarpPanel({ prog }) {
  const mesh = useRef();
  const uniforms = useMemo(() => ({ uTex: { value: serviceTextTexture('COACHING') }, uTime: { value: 0 }, uWarp: { value: 1 }, uSplit: { value: 1 }, uOpacity: { value: 1 } }), []);
  useFrame((s) => {
    const p = prog.current; const g = easeInOut(range(p, 0.0, 0.7));
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uWarp.value = lerp(1.15, 0.55, g) + Math.sin(s.clock.elapsedTime * 0.8) * 0.08;
    uniforms.uSplit.value = lerp(2.2, 0.6, g);
    mesh.current.scale.set(lerp(0.42, 1.55, g), lerp(0.62, 1.55, g), 1);
    mesh.current.rotation.set(lerp(0.05, 0, g), lerp(-0.25, 0, g), lerp(-0.12, 0, g));
    uniforms.uOpacity.value = 1 - ss(0.86, 1, p);
  });
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[7.2, 4.6, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={wallVert} fragmentShader={warpFrag} transparent />
    </mesh>
  );
}

export function ServiceIntro() {
  const ref = useRef(null); const { progress } = useSectionProgress(ref);
  useSectionMeta(ref, { theme: 'dark', index: 4 });
  const near = useNearViewport(ref);
  return (
    <section className="sec light service-intro" ref={ref} style={{ height: '220vh', zIndex: 2 }}>
      <div className="sticky">
        <Crosses color="rgba(11,12,13,.22)" />
        <div className="gl">{near && <Canvas dpr={[1, 1.5]} camera={{ fov: 35, position: [0, 0, 10] }} gl={{ alpha: true }} onCreated={remeasure}><WarpPanel prog={progress} /></Canvas>}</div>
      </div>
    </section>
  );
}

/* ---------- Services: grid room + tilted card ---------- */
function Room() {
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.14 }), []);
  const geo = useMemo(() => {
    const pts = []; const W = 16, H = 9, D = 24, step = 1.2;
    for (let x = -W; x <= W; x += step) { pts.push(x, -H / 2, 2, x, -H / 2, -D, x, H / 2, 2, x, H / 2, -D); }
    for (let z = 2; z >= -D; z -= step) { pts.push(-W, -H / 2, z, W, -H / 2, z, -W, H / 2, z, W, H / 2, z); }
    for (let y = -H / 2; y <= H / 2; y += step) { pts.push(-W, y, -D, W, y, -D); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  return <lineSegments geometry={geo} material={mat} />;
}

function Crosses3D() {
  const geo = useMemo(() => {
    const pts = []; const s = 0.09;
    for (let x = -12; x <= 12; x += 2.4) for (let z = 1; z >= -20; z -= 2.4) for (const y of [-4.5, 4.5]) { pts.push(x - s, y, z, x + s, y, z, x, y, z - s, x, y, z + s); }
    for (let x = -12; x <= 12; x += 2.4) for (let y = -4.5; y <= 4.5; y += 2.25) { pts.push(x - s, y, -20, x + s, y, -20, x, y - s, -20, x, y + s, -20); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  return <lineSegments geometry={geo}><lineBasicMaterial color="#ffffff" transparent opacity={0.9} /></lineSegments>;
}

function SvcCard({ prog }) {
  const mesh = useRef(); const cam = useRef(0);
  const tex = useMemo(() => SERVICES.map((s) => photoTexture(s.img)), []);
  const uniforms = useMemo(() => ({ uTex: { value: tex[0] }, uTex2: { value: tex[1] }, uTime: { value: 0 }, uMix: { value: 0 }, uGlitch: { value: 0 }, uOpacity: { value: 0 } }), [tex]);
  useFrame((s) => {
    const p = prog.current; const n = SERVICES.length;
    const f = Math.min(n - 1.0001, Math.max(0, p * n - 0.15)); const i = Math.floor(f); const local = f - i;
    const tr = ss(0.78, 1, local);
    uniforms.uTex.value = tex[i]; uniforms.uTex2.value = tex[Math.min(n - 1, i + 1)];
    uniforms.uMix.value = tr; uniforms.uGlitch.value = Math.sin(tr * Math.PI) * 1.0;
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uOpacity.value = ss(0.0, 0.06, p) * (1 - ss(0.95, 1, p));
    const k = easeOut(range(p, 0, 0.08));
    mesh.current.position.set(lerp(-3.5, -1.15, k), 0.15, lerp(-3, 0, k));
    mesh.current.rotation.set(0, lerp(0.9, 0.42, k) + Math.sin(s.clock.elapsedTime * 0.4) * 0.02, 0);
    cam.current = lerp(cam.current, p, 0.08);
    s.camera.position.set(Math.sin(cam.current * 2) * 0.4, 0.2, 10 - cam.current * 1.5); s.camera.lookAt(0, 0, -3);
  });
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[5.2, 2.95]} />
      <shaderMaterial uniforms={uniforms} vertexShader={wallVert} fragmentShader={svcFrag} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function Services() {
  const ref = useRef(null); const { progress } = useSectionProgress(ref);
  useSectionMeta(ref, { theme: 'dark', index: 4 });
  const near = useNearViewport(ref);
  const [i, setI] = useState(0); const [show, setShow] = useState(0);
  useEffect(() => {
    let raf; const loop = () => { const p = progress.current; const n = SERVICES.length; setI(Math.min(n - 1, Math.max(0, Math.floor(p * n - 0.15 + 0.22)))); setShow(p > 0.04 && p < 0.96 ? 1 : 0); raf = requestAnimationFrame(loop); };
    loop(); return () => cancelAnimationFrame(raf);
  }, [progress]);
  useEffect(() => { if (show) store.set({ index: 4 }); }, [show]);
  const s = SERVICES[i];
  return (
    <section id="service" className="sec services" ref={ref} style={{ height: `${SERVICES.length * 110 + 60}vh`, background: 'var(--bg)', zIndex: 2 }}>
      <div className="sticky">
        <div className="gl">{near && <Canvas dpr={[1, 1.5]} camera={{ fov: 38, position: [0, 0.2, 10] }} onCreated={remeasure}><color attach="background" args={['#0b0c0d']} /><fog attach="fog" args={['#0b0c0d', 8, 30]} /><Room /><Crosses3D /><SvcCard prog={progress} /></Canvas>}</div>
        <div className="svc-copy" style={{ opacity: show, transform: show ? 'none' : 'translateY(24px)', transition: 'opacity .7s, transform .9s cubic-bezier(.22,1,.36,1)' }}>
          <div className="badge"><small>{s.badge.split(' ').slice(0, -1).join(' ')}</small>{s.badge.split(' ').slice(-1)[0]}</div>
          <ScrambleText as="h3" text={s.title} duration={750} />
          <p key={s.title} className="svc-body">{s.body}</p>
          <div className="foot">{s.foot}</div>
        </div>
      </div>
    </section>
  );
}
