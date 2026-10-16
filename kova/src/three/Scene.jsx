import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { FLAVORS } from '../data.js'
import { store, N, mod, clamp, smooth, lerp } from '../store.js'
import { canGeometries, labelTexture } from './can.js'

const tmpC = new THREE.Color()
const tmpD = new THREE.Color()

function seeded(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function heroT(i, t, af, mob) {
  let rel = mod(i - af + N / 2) - N / 2
  const a = rel * (mob ? 0.46 : 0.42)
  const R = mob ? 3.6 : 7.2
  const x = Math.sin(a) * R * (mob ? 0.9 : 1.02)
  const z = (Math.cos(a) - 1) * R * 0.9
  const ar = Math.abs(rel)
  const c = Math.max(0, 1 - ar)
  const y = 0.12 - ar * 0.05 + Math.sin(t * 0.8 + i * 1.7) * 0.05 + c * 0.05
  const tilt = lerp(-0.12 + (seeded(i) - 0.5) * 0.35, -0.36, c)
  const ry = lerp(t * 0.25 + i * 1.3, Math.sin(t * 0.7) * 0.28, c)
  return { x, y, z, rx: Math.sin(t * 0.5 + i) * 0.05, ry, rz: tilt, s: (mob ? 0.86 : 1.05) * (1 + c * 0.2), vis: ar < 4.2 ? 1 : 0 }
}

function Can({ i, geo, metal }) {
  const ref = useRef()
  const f = FLAVORS[i]
  const gl = useThree((s) => s.gl)
  const mat = useMemo(() => {
    const tex = labelTexture(f, gl.capabilities.getMaxAnisotropy())
    tex.offset.x = 0.25
    return new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.55, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.25 })
  }, [f, gl])
  const cur = useRef({ x: 0, y: -8, z: 0, rx: 0, ry: 0, rz: 0, s: 0.0001 })
  const ring = useRef()
  const ringY = useRef(0.55)
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const st = store
    const mob = st.mobile
    const af = st.activeF
    const hi = mod(Math.round(st.active))
    const isHero = i === hi
    let T = heroT(i, t, af, mob)
    const b = st.dive
    if (b > 0) {
      if (isHero) {
        const k1 = smooth(0, 0.22, b)
        const k2 = smooth(0.22, 0.4, b)
        const x0 = mob ? 0 : 1.35
        const p1 = { x: lerp(T.x, x0, k1), y: lerp(T.y, mob ? 0.6 : -0.25, k1), z: lerp(T.z, 3.4, k1), rz: lerp(T.rz, -0.6, k1), s: lerp(T.s, 1.35, k1) }
        const spin = smooth(0.4, 1, b) * Math.PI * 1.15
        T = {
          x: lerp(p1.x, mob ? 0 : 1.15, k2),
          y: lerp(p1.y, mob ? 0.9 : 0.05, k2) + Math.sin(t * 0.9) * 0.04,
          z: lerp(p1.z, 4.6, k2),
          rx: 0,
          ry: lerp(T.ry, -0.2, k1) + spin + Math.sin(t * 0.6) * 0.06 * k2,
          rz: lerp(p1.rz, -0.04, k2),
          s: lerp(p1.s, mob ? 1.15 : 1.5, k2),
          vis: 1,
        }
      } else {
        const k = smooth(0, 0.2, b - seeded(i + 4) * 0.05)
        T = { ...T, y: T.y - k * 9, rz: T.rz + k * (seeded(i) - 0.5) * 3, rx: T.rx + k * 1.2, vis: k < 0.99 ? 1 : 0 }
      }
    }
    const c = st.smoke
    if (c > 0 && isHero) {
      const k = smooth(0, 0.5, c)
      const k2 = smooth(0.55, 1, c)
      T = { x: lerp(T.x, mob ? 0.2 : 1.1, k), y: lerp(T.y, 0.35, k) + k2 * 7, z: lerp(T.z, 3, k), rx: k * 0.2, ry: T.ry + c * 7, rz: lerp(T.rz, -0.45, k) + k2 * 0.8, s: lerp(T.s, 1.05, k), vis: k2 < 0.99 ? 1 : 0 }
    } else if (c > 0) T.vis = 0
    const d = st.line + st.mid * 0.9 + st.faq * 0.9
    if (st.line > 0) {
      const u = i / (N - 1) - 0.5 + (0.6 - d * 1.25)
      const span = mob ? 6 : 9.2
      T = {
        x: u * span * 1.3,
        y: (mob ? -0.4 : -0.9) + u * (mob ? 3.6 : 3.4) + Math.sin(t * 0.7 + i) * 0.05 + st.faq * 6,
        z: -Math.abs(u) * 2.2 + 0.6,
        rx: 0.08,
        ry: Math.sin(t * 0.4 + i) * 0.3 - 0.15,
        rz: -0.32 + u * 0.15,
        s: mob ? 0.62 : 0.78,
        vis: Math.abs(u) < 1.1 && st.mid < 0.9 && st.faq < 0.95 ? 1 : 0,
      }
    }
    const j = st.join
    if (j > 0) {
      if (isHero) {
        const k = smooth(0, 0.55, j)
        const fo = smooth(0, 1, st.foot)
        T = { x: 0, y: lerp(7, mob ? -2.3 : -2.15, k) + Math.sin(t * 0.8) * 0.05 * k + fo * 9, z: 1.5, rx: 0.05, ry: t * 0.35 + fo * 4, rz: lerp(0.5, -0.06, k) + fo * 0.6, s: mob ? 0.62 : 0.72, vis: fo < 0.98 ? 1 : 0 }
      } else T.vis = 0
    }
    const g = ref.current
    const cu = cur.current
    const kk = 1 - Math.exp(-dt * (st.dive > 0 || st.join > 0 ? 7 : 6))
    for (const key of ['x', 'y', 'z', 'rx', 'ry', 'rz']) cu[key] += (T[key] - cu[key]) * kk
    const ts = T.vis ? T.s : 0.0001
    cu.s += (ts - cu.s) * (1 - Math.exp(-dt * (T.vis ? 6 : 14)))
    g.position.set(cu.x, cu.y, cu.z)
    g.rotation.set(cu.rx, cu.ry, cu.rz, 'ZXY')
    g.scale.setScalar(cu.s)
    g.visible = cu.s > 0.01
    const rg = ring.current
    const fp = (b - 0.4) / 0.15
    const showRing = isHero && b > 0.4 && st.smoke < 0.05
    const rys = [0.62, 0.18, -0.22, -0.62]
    ringY.current += (rys[clamp(Math.floor(fp), 0, 3)] - ringY.current) * (1 - Math.exp(-dt * 5))
    rg.position.y = ringY.current
    rg.material.opacity += ((showRing ? 0.95 : 0) - rg.material.opacity) * (1 - Math.exp(-dt * 6))
    rg.visible = rg.material.opacity > 0.01
    rg.material.color.set(f.glow)
  })
  return (
    <group
      ref={ref}
      onClick={(e) => {
        if (store.dive > 0.02) return
        e.stopPropagation()
        const rel = mod(i - store.activeF + N / 2) - N / 2
        if (Math.abs(rel) > 0.4) store.onPick?.(Math.round(store.activeF + rel))
      }}
      onPointerOver={() => {
        store.hoverCan = i
        document.body.style.cursor = store.dive > 0.02 ? '' : 'pointer'
      }}
      onPointerOut={() => {
        store.hoverCan = -1
        document.body.style.cursor = ''
      }}
    >
      <mesh geometry={geo.body} material={mat} />
      <mesh geometry={geo.top} material={metal} />
      <mesh geometry={geo.bottom} material={metal} />
      <mesh geometry={geo.tab} material={metal} />
      <mesh ref={ring} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.405, 0.008, 8, 96]} />
        <meshBasicMaterial transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  )
}

const smokeVS = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const smokeFS = /* glsl */ `
uniform float uT;
uniform float uAmt;
uniform float uLow;
uniform vec3 uCol;
uniform vec3 uCol2;
varying vec2 vUv;
float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y); }
float fbm(vec2 p) { float s = 0.0; float a = 0.5; for (int i = 0; i < 6; i++) { s += a * noise(p); p = p * 2.02 + vec2(3.1, 1.7); a *= 0.5; } return s; }
void main() {
  vec2 p = (vUv - 0.5) * vec2(2.2, 1.2);
  float t = uT * 0.12;
  vec2 q = vec2(fbm(p * 1.6 + vec2(t, -t * 0.6)), fbm(p * 1.6 + vec2(-t * 0.7, t * 0.4) + 4.3));
  float n = fbm(p * 2.2 + q * 1.7 + vec2(0.0, -t * 1.5));
  float burst = uAmt * smoothstep(1.35, 0.0, length(p * vec2(0.8, 1.2)) - uAmt * 0.6);
  float low = uLow * smoothstep(0.15, -0.65, p.y) * 0.9;
  float a = clamp((n - 0.32) * 1.8, 0.0, 1.0) * clamp(burst + low, 0.0, 1.0);
  vec3 col = mix(uCol2, uCol, smoothstep(0.3, 0.8, n));
  gl_FragColor = vec4(col * (0.8 + n * 0.6), a * 0.92);
}
`

function Smoke() {
  const ref = useRef()
  const { viewport, camera } = useThree()
  const uni = useMemo(() => ({ uT: { value: 0 }, uAmt: { value: 0 }, uLow: { value: 0 }, uCol: { value: new THREE.Color('#ff9fbe') }, uCol2: { value: new THREE.Color('#e3195a') } }), [])
  useFrame((state, dt) => {
    const st = store
    const f = FLAVORS[mod(Math.round(st.active))]
    uni.uT.value += dt * (1 + st.smoke * 4)
    const burst = Math.sin(clamp(st.smoke * 1.15) * Math.PI)
    uni.uAmt.value += (burst * 1.1 - uni.uAmt.value) * Math.min(1, dt * 6)
    const low = st.dive > 0.05 && st.smoke < 0.9 ? 0.55 : 0
    uni.uLow.value += (low - uni.uLow.value) * Math.min(1, dt * 2)
    tmpC.set(f.glow).lerp(new THREE.Color('#ffffff'), 0.45)
    uni.uCol.value.lerp(tmpC, Math.min(1, dt * 3))
    tmpD.set(f.bg[1])
    uni.uCol2.value.lerp(tmpD, Math.min(1, dt * 3))
    ref.current.visible = uni.uAmt.value + uni.uLow.value > 0.01
  })
  const vp = viewport.getCurrentViewport(camera, [0, 0, -1.5])
  return (
    <mesh ref={ref} position={[0, 0, -1.5]} renderOrder={-1}>
      <planeGeometry args={[vp.width * 1.15, vp.height * 1.15]} />
      <shaderMaterial vertexShader={smokeVS} fragmentShader={smokeFS} uniforms={uni} transparent depthWrite={false} />
    </mesh>
  )
}

function Rig() {
  const { camera, size } = useThree()
  useEffect(() => {
    store.mobile = size.width < 760
  }, [size])
  useFrame((state, dt) => {
    const st = store
    st.activeF += (st.active - st.activeF) * (1 - Math.exp(-dt * 5))
    const mx = st.mouse[0]
    const my = st.mouse[1]
    const k = 1 - Math.exp(-dt * 3)
    camera.position.x += (mx * 0.35 - camera.position.x) * k
    camera.position.y += (-my * 0.2 - camera.position.y) * k
    camera.position.z = st.mobile ? 17 : 14
    camera.lookAt(0, 0, 0)
    const f = FLAVORS[mod(Math.round(st.active))]
    const root = document.documentElement.style
    const flav = clamp(smooth(0.0, 0.16, st.dive) * (1 - smooth(0.0, 0.6, st.lab)))
    const beam = Math.max(smooth(0.0, 0.5, st.mid), smooth(0.2, 0.8, st.faq), st.join)
    root.setProperty('--o-flav', flav.toFixed(3))
    root.setProperty('--o-beam', beam.toFixed(3))
    root.setProperty('--flav-a', f.bg[0])
    root.setProperty('--flav-b', f.bg[1])
    root.setProperty('--flav-glow', f.glow)
  })
  return null
}

export default function Scene() {
  const geo = useMemo(() => canGeometries(), [])
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d8dce2', metalness: 1, roughness: 0.22, envMapIntensity: 1.3, side: THREE.DoubleSide }), [])
  return (
    <Canvas
      className="scene"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 14], fov: 30, near: 0.1, far: 80 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        window.__kovaGL = gl
      }}
      eventPrefix="client"
    >
      <Rig />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <directionalLight position={[-6, -2, 3]} intensity={0.5} color="#ffd9c4" />
      <spotLight position={[0, 9, 2]} angle={0.5} penumbra={1} intensity={60} distance={30} color="#fff3ea" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 6, 2]} scale={[12, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={2} position={[-6, 1, 3]} scale={[2, 8, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={2} position={[6, 1, 3]} scale={[2, 8, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer intensity={1.2} color="#ffb8a0" position={[0, -4, 4]} scale={[10, 2, 1]} rotation-x={-Math.PI / 2} />
        <Lightformer intensity={0.8} position={[0, 2, -6]} scale={[8, 4, 1]} />
      </Environment>
      <Smoke />
      {FLAVORS.map((f, i) => (
        <Can key={f.id} i={i} geo={geo} metal={metal} />
      ))}
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.45} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette offset={0.25} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  )
}
