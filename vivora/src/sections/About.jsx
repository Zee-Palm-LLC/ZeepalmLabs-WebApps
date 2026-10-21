import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSectionProgress, useNearViewport, range, easeInOut, easeOut, lerp, remeasure } from '../lib/scroll.js';
import { useSectionMeta } from '../lib/sectionMeta.js';
import { P } from '../lib/progress.js';
import { store } from '../lib/store.js';
import { dumbbellGeometry } from '../lib/zMark.js';
import { iriFrag, wallVert } from '../gl/shaders.js';
import { MISSION, VISION } from '../data/content.js';
import Crosses from '../components/Crosses.jsx';

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function WireZ({ prog }) {
  const group = useRef(); const front = useRef(); const shadow = useRef();
  const points = useMemo(() => {
    const e = new THREE.EdgesGeometry(dumbbellGeometry({ radial: 18, knurl: false }), 25);
    const a = e.attributes.position.array; const pts = [];
    for (let i = 0; i < a.length; i += 3) pts.push(new THREE.Vector3(a[i], a[i + 1], a[i + 2]));
    return pts;
  }, []);
  // proxies so the frame loop below can keep driving opacity the same way
  const mat = useMemo(() => ({ opacity: 0 }), []);
  const mat2 = useMemo(() => ({ opacity: 0 }), []);
  useFrame((s) => {
    const p = prog.current; const t = s.clock.elapsedTime;
    const draw = easeOut(range(p, 0.02, 0.16));
    const zoom = easeInOut(range(p, 0.8, 1));
    group.current.scale.setScalar(lerp(5.2, 6.4, draw) * (1 + zoom * 0.6));
    group.current.position.set(lerp(0.4, 0.15, ss(0.4, 0.6, p)), 0.15, 0);
    group.current.rotation.set(0.12 * Math.sin(t * 0.2) + lerp(0.35, 0.08, draw), lerp(-0.5, 0.3, ss(0, 0.45, p)) + ss(0.42, 0.62, p) * 0.45 + Math.sin(t * 0.25) * 0.06, 0);
    mat.opacity = draw * (1 - ss(0.86, 0.96, p)); mat2.opacity = mat.opacity * 0.5;
    if (front.current) front.current.material.opacity = mat.opacity;
    if (shadow.current) shadow.current.material.opacity = mat2.opacity;
  });
  return (
    <group ref={group}>
      <Line ref={shadow} points={points} segments color="#8f9c9c" lineWidth={1.4} transparent position={[0.014, -0.014, -0.01]} />
      <Line ref={front} points={points} segments color="#ffffff" lineWidth={1.7} transparent />
    </group>
  );
}

function Slab({ prog }) {
  const mesh = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), []);
  useFrame((s) => {
    const p = prog.current; uniforms.uTime.value = s.clock.elapsedTime;
    const enter = easeOut(range(p, 0.5, 0.64)); const zoom = easeInOut(range(p, 0.8, 1));
    uniforms.uOpacity.value = enter;
    mesh.current.scale.set(lerp(1, 9, zoom), enter * lerp(1, 2.2, zoom), 1);
    mesh.current.rotation.set(0, lerp(-0.45, 0, zoom), lerp(-0.26, 0, zoom));
    mesh.current.position.set(lerp(-0.25, 0, zoom), lerp(0.25, 0, zoom), lerp(0.2, 1.5, zoom));
  });
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1.25, 4.6, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={wallVert} fragmentShader={iriFrag} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export default function About() {
  const ref = useRef(null); const ui = useRef(null);
  const { progress } = useSectionProgress(ref, {
    onUpdate: (p) => {
      const q = (s) => ui.current?.querySelectorAll(s) ?? [];
      const mIn = easeOut(range(p, 0.06, 0.18)), mOut = range(p, 0.36, 0.44);
      q('.mission-text .line').forEach((el, i) => { const t = easeOut(range(p, 0.06 + i * 0.03, 0.18 + i * 0.03)); el.style.transform = `translateY(${(1 - t) * 110}%)`; });
      const mt = ui.current?.querySelector('.mission-text'); if (mt) mt.style.opacity = String(mIn * (1 - mOut));
      const vt = ui.current?.querySelector('.vision-title'); if (vt) { const t = easeOut(range(p, 0.44, 0.56)); vt.style.clipPath = `inset(0 ${100 - t * 100}% 0 0)`; vt.style.opacity = String(1 - ss(0.82, 0.9, p)); }
      q('.vision-lines span').forEach((el, i) => { const t = easeOut(range(p, 0.6 + i * 0.04, 0.7 + i * 0.04)); el.style.clipPath = `inset(0 ${100 - t * 100}% 0 0)`; el.style.opacity = String(1 - ss(0.82, 0.88, p)); });
      q('.fade-v').forEach((el) => { el.style.opacity = String(ss(0.5, 0.6, p) * (1 - ss(0.82, 0.88, p))); });
      store.set({ index: p < 0.42 ? 2 : 3 });
    },
  });
  useSectionMeta(ref, { theme: 'light', index: 2 });
  const near = useNearViewport(ref);
  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: ref.current, start: 'top top', onEnter: () => { P.stageActive = false; }, onLeaveBack: () => { P.stageActive = true; } });
    return () => st.kill();
  }, []);
  return (
    <section id="about" className="sec light about" ref={ref} style={{ height: '520vh', zIndex: 2 }}>
      <div className="wipe" aria-hidden="true" />
      <div className="sticky" ref={ui}>
        <Crosses color="rgba(11,12,13,.22)" />
        <div className="gl">
          {near && (
            <Canvas dpr={[1, 1.5]} camera={{ fov: 35, position: [0, 0, 10] }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: import.meta.env.DEV }} onCreated={remeasure}>
              <WireZ prog={progress} />
              <Slab prog={progress} />
            </Canvas>
          )}
        </div>
        <div className="mission-text" style={{ transform: 'translateY(-50%)' }}>
          <div className="big">{MISSION.big.map((l) => <div key={l} style={{ overflow: 'hidden' }}><div className="line">{l}</div></div>)}</div>
          <div className="small">{MISSION.small}</div>
        </div>
        <div className="vision-title" style={{ clipPath: 'inset(0 100% 0 0)' }}>MOVE</div>
        <div className="vision-cap fade-v" style={{ opacity: 0 }}>{'// 02 — what we believe'}</div>
        <div className="vision-lines">{VISION.lines.map((l) => <span key={l} style={{ clipPath: 'inset(0 100% 0 0)' }}>{l}</span>)}</div>
        <div className="vision-small fade-v" style={{ opacity: 0 }}>{VISION.small}</div>
      </div>
    </section>
  );
}
