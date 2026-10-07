import { TILES } from '../data/tiles.js'
import gsap from 'gsap'
import { W, H, HEAD } from './layout.js'

const VERT = `
attribute vec2 aPos;
uniform vec4 uRect;
uniform vec2 uView;
uniform vec2 uShift;
varying vec2 vUv;
void main() {
  vUv = aPos;
  vec2 p = uRect.xy + aPos * uRect.zw + uShift;
  vec2 clip = vec2(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}`

const COMMON = `
precision highp float;
uniform vec2 uRes;
uniform float uPx;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHeat;
uniform vec2 uOrigin;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 5; k++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}
vec2 cssPos() { return (vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) - uOrigin) / uPx; }
`

const TILE_FRAG = `${COMMON}
uniform sampler2D uTiles;
uniform vec2 uGrid;
uniform float uDrip;
uniform float uExt;
uniform float uBleed;
void main() {
  vec2 p = cssPos();
  float T = ${(W / 22).toFixed(6)};
  float colI = floor(p.x / T);
  float sp = 0.35 + hash(vec2(colI, 3.0)) * 1.25;
  float drop = pow(uDrip, 1.6) * ${H}.0 * sp;
  vec2 q = vec2(p.x, max(p.y - drop, T * 0.5));
  vec2 t = q / T;
  vec2 i = floor(t);
  vec2 f = t - i;
  float w = 1.55 / T;
  vec2 o = sign(f - 0.5) * 0.5 * clamp((abs(f - 0.5) - (0.5 - w)) / w, 0.0, 1.0);
  vec2 ti = vec2(i.x + uExt, clamp(i.y, 0.0, uGrid.y - 1.0));
  vec3 c = texture2D(uTiles, (ti + 0.5 + o) / uGrid).rgb * 255.0;
  float h = hash(i);
  c += (h * 2.0 - 1.0) * 1.6 * sin(uTime * 0.35 + hash(i + 7.0) * 6.2831);
  vec2 tc = (i + 0.5) * T;
  float heat = uHeat * smoothstep(300.0, 0.0, distance(tc, uMouse)) * (0.55 + 0.45 * h);
  c += vec3(15.0, 10.0, 5.0) * heat;
  c += vec3(6.0, 4.0, 2.0) * uHeat * smoothstep(220.0, 0.0, distance(p, uMouse));
  float C = ${(W / 11).toFixed(6)};
  float k = floor(p.x / C + 0.5);
  float d = abs(p.x - k * C);
  float cov = ((k > 0.5 && k < 10.5) || uBleed > 0.5) ? clamp(0.5 + (0.4264 - d) * uPx, 0.0, 1.0) : 0.0;
  c += (255.0 - c) * 0.048 * cov;
  gl_FragColor = vec4(c / 255.0, 1.0);
}`

const HEAD_FRAG = `${COMMON}
uniform sampler2D uStill;
uniform sampler2D uVideo;
uniform float uMix;
uniform float uRipple;
uniform float uGlint;
uniform float uFade;
uniform vec4 uHead;
varying vec2 vUv;
vec4 still(vec2 uv) { return texture2D(uStill, uv); }
vec4 vid(vec2 uv) {
  vec3 col = texture2D(uVideo, vec2(uv.x * 0.5, uv.y)).rgb;
  float a = texture2D(uVideo, vec2(0.5 + uv.x * 0.5, uv.y)).g;
  return vec4(col, a);
}
void main() {
  vec2 uv = vUv;
  vec2 p = uHead.xy + uv * uHead.zw;
  float md = distance(p, uMouse);
  float ring = smoothstep(150.0, 0.0, md) * uRipple;
  vec2 dir = normalize(p - uMouse + 0.0001);
  float wave = sin(md * 0.09 - uTime * 4.0) * 0.5 + 0.5;
  uv += dir * ring * wave * 2.2 / uHead.zw;
  uv += (vec2(fbm(p * 0.03 + uTime * 0.2), fbm(p * 0.03 - uTime * 0.17)) - 0.5) * ring * 6.0 / uHead.zw;
  vec4 s = still(uv);
  vec4 v = uMix > 0.001 ? vid(uv) : vec4(0.0);
  vec4 c = mix(s, v, uMix);
  float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  float band = (uv.x * 0.8 + uv.y * 0.6) - uGlint;
  float g = exp(-band * band * 90.0) * smoothstep(0.35, 0.85, lum);
  c.rgb += vec3(0.75, 0.86, 0.95) * g * 0.55;
  c.rgb += vec3(0.07, 0.05, 0.02) * ring;
  vec2 ep = vUv * uHead.zw;
  float edge = smoothstep(0.0, 26.0, ep.x) * smoothstep(0.0, 26.0, uHead.z - ep.x) * smoothstep(0.0, 18.0, ep.y);
  c.a *= uFade * mix(1.0, edge, uMix);
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`

const FROST_FRAG = `${COMMON}
uniform float uMelt;
uniform vec2 uCenter;
float cell(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float m1 = 8.0;
  float m2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash(i + g), hash(i + g + 3.7));
      float d = length(g + o - f);
      if (d < m1) { m2 = m1; m1 = d; } else if (d < m2) { m2 = d; }
    }
  }
  return m2 - m1;
}
void main() {
  vec2 p = cssPos();
  float r = uMelt * 1700.0;
  float n = fbm(p * 0.006 + 3.0) * 260.0 + fbm(p * 0.03) * 60.0;
  float d = distance(p, uCenter) + n;
  float a = smoothstep(r - 40.0, r + 120.0, d);
  float edge = smoothstep(r - 40.0, r + 30.0, d) * (1.0 - smoothstep(r + 30.0, r + 160.0, d));
  float cr = 1.0 - smoothstep(0.0, 0.06, cell(p * 0.045));
  float cr2 = 1.0 - smoothstep(0.0, 0.05, cell(p * 0.12 + 9.0));
  float grain = fbm(p * 0.35);
  vec3 ice = vec3(0.62, 0.71, 0.77);
  vec3 col = ice * (0.42 + 0.28 * grain) + vec3(0.85, 0.92, 0.97) * (cr * 0.35 + cr2 * 0.2);
  col += vec3(0.9, 0.96, 1.0) * edge * 0.45;
  float alpha = clamp(a * 0.9 + edge * 0.35, 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

function program(gl, frag) {
  const p = gl.createProgram()
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag))
  gl.bindAttribLocation(p, 0, 'aPos')
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
  const u = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)
    u[info.name] = gl.getUniformLocation(p, info.name)
  }
  return { p, u }
}

function texture(gl, filter = gl.LINEAR) {
  const t = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
  return t
}

export const TURN_FRAMES = 300
export const TURN_FPS = 60

const EXT = 16

function extendTiles() {
  const rows = TILES.length
  const cols = TILES[0].length
  const pool = [0, 1, 2, 3, 4, 5, 6, 16, 17, 18, 19, 20, 21]
  const out = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let k = -EXT; k < cols + EXT; k++) {
      if (k >= 0 && k < cols) {
        row.push(TILES[r][k])
        continue
      }
      const h = Math.abs(Math.sin(r * 91.7 + k * 37.3) * 43758.5453) % 1
      const src = TILES[r][pool[Math.floor(h * pool.length)]]
      const j = (Math.abs(Math.sin(r * 12.9 + k * 78.2) * 9631.17) % 1) * 3 - 1.5
      row.push(src.map((v) => Math.max(0, Math.round(v + j))))
    }
    out.push(row)
  }
  return out
}

const defaultFit = (r) => ({ s: r.width / W, ox: 0, oy: 0 })

export function createStage(canvas, { stillSrc = '/media/head-still.webp', videoSrc = '/media/head-turn.mp4', onHover, fit = defaultFit } = {}) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: false })
  const state = {
    time: 0,
    mouse: [-9999, -9999],
    mouseT: [-9999, -9999],
    heat: 0,
    heatT: 0,
    ripple: 0,
    rippleT: 0,
    mix: 0,
    glint: -1,
    melt: 1,
    mixT: 0,
    drip: 0,
    lift: 0,
    fade: 1,
    dragging: false,
    videoReady: false,
    frameDirty: false,
  }
  if (!gl) return { settle() {}, destroy() {}, state, video: null }

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const tiles = program(gl, TILE_FRAG)
  const head = program(gl, HEAD_FRAG)
  const frost = program(gl, FROST_FRAG)

  const GRID = extendTiles()
  const rows = GRID.length
  const cols = GRID[0].length
  const data = new Uint8Array(rows * cols * 4)
  GRID.forEach((row, r) =>
    row.forEach((c, k) => {
      const o = (r * cols + k) * 4
      data.set([c[0], c[1], c[2], 255], o)
    })
  )
  const tileTex = texture(gl)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)

  const stillTex = texture(gl)
  const videoTex = texture(gl)
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, stillTex)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    state.stillReady = true
  }
  img.src = stillSrc

  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.crossOrigin = 'anonymous'
  video.src = videoSrc
  video.addEventListener('loadeddata', () => {
    state.videoReady = true
    state.frameDirty = true
  })
  const markDirty = () => {
    state.frameDirty = true
  }
  video.addEventListener('seeked', markDirty)
  video.addEventListener('timeupdate', markDirty)

  let turnTween = null
  let pendingTurn = false
  const turn = () => {
    if (!state.videoReady) {
      pendingTurn = true
      return
    }
    pendingTurn = false
    video.currentTime = 0
    video.playbackRate = 1
    const go = () => {
      state.mixT = 1
      video.play().catch(() => {
        state.mixT = 0
      })
    }
    if (video.readyState >= 3) go()
    else video.addEventListener('canplay', go, { once: true })
  }
  video.addEventListener('ended', () => {
    if (!state.dragging) state.mixT = 0
  })
  video.addEventListener('canplaythrough', () => {
    if (pendingTurn && performance.now() - born < 4000) turn()
  })
  const born = performance.now()

  let px = 1
  let raf = 0
  const view = { s: 1, ox: 0, oy: 0, w: W, h: H, dpr: 1 }
  const resize = () => {
    const r = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(r.width * dpr))
    const h = Math.max(1, Math.round(r.height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    const f = fit(r)
    Object.assign(view, f, { w: r.width, h: r.height, dpr: w / Math.max(1, r.width) })
    px = view.s * view.dpr
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  const toCss = (e) => {
    const r = canvas.getBoundingClientRect()
    const k = r.width / Math.max(1, view.w)
    return [(e.clientX - r.left - view.ox * k) / (view.s * k), (e.clientY - r.top - view.oy * k) / (view.s * k)]
  }
  const inHead = ([x, y]) => x > HEAD.x + 60 && x < HEAD.x + HEAD.w - 40 && y > HEAD.y + 20 && y < HEAD.y + HEAD.h
  let drag = null
  const onMove = (e) => {
    const p = toCss(e)
    state.mouseT = p
    state.heatT = p[1] >= 0 && p[1] <= H ? 1 : 0
    state.rippleT = inHead(p) && !drag ? 1 : 0
    canvas.style.cursor = drag ? 'grabbing' : inHead(p) ? 'grab' : ''
    onHover?.(inHead(p) || !!drag, e.clientX, e.clientY, !!drag)
    if (drag && state.videoReady) {
      const d = video.duration || 5
      let t = drag.t0 + ((p[0] - drag.x0) / 520) * d
      t = ((t % d) + d) % d
      video.currentTime = Math.min(d - 0.02, t)
    }
  }
  const onDown = (e) => {
    const p = toCss(e)
    if (!inHead(p) || !state.videoReady) return
    if (turnTween) turnTween.kill()
    video.pause()
    drag = { x0: p[0], t0: video.currentTime || 0 }
    state.dragging = true
    state.mixT = 1
    canvas.setPointerCapture?.(e.pointerId)
    canvas.style.cursor = 'grabbing'
  }
  const onUp = () => {
    if (!drag) return
    drag = null
    state.dragging = false
    const d = video.duration || 5
    const t = video.currentTime
    const to = t > d / 2 ? d - 0.02 : 0
    const st = { t }
    turnTween = gsap.to(st, {
      t: to,
      duration: 0.4 + Math.abs(to - t) * 0.35,
      ease: 'power3.out',
      onUpdate: () => {
        video.currentTime = st.t
      },
      onComplete: () => {
        state.mixT = 0
      },
    })
  }
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  const onLeave = () => {
    state.heatT = 0
    state.rippleT = 0
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)

  const uniforms = (pr, extra) => {
    gl.useProgram(pr.p)
    gl.uniform2f(pr.u.uRes, canvas.width, canvas.height)
    gl.uniform1f(pr.u.uPx, px)
    gl.uniform1f(pr.u.uTime, state.time)
    gl.uniform2f(pr.u.uMouse, state.mouse[0], state.mouse[1])
    gl.uniform1f(pr.u.uHeat, state.heat)
    gl.uniform2f(pr.u.uView, view.w / view.s, view.h / view.s)
    gl.uniform2f(pr.u.uShift, view.ox / view.s, view.oy / view.s)
    gl.uniform2f(pr.u.uOrigin, view.ox * view.dpr, view.oy * view.dpr)
    extra?.()
  }

  let visible = true
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
  })
  io.observe(canvas)

  let last = performance.now()
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!visible) return
    state.time += dt
    const k = 1 - Math.pow(0.001, dt)
    state.mouse = state.mouse[0] < -9000 ? state.mouseT : [state.mouse[0] + (state.mouseT[0] - state.mouse[0]) * k * 1.4, state.mouse[1] + (state.mouseT[1] - state.mouse[1]) * k * 1.4]
    state.heat += (state.heatT - state.heat) * k * 0.6
    state.ripple += (state.rippleT - state.ripple) * k * 0.8
    state.mix += (state.mixT - state.mix) * Math.min(1, dt * (state.mixT > state.mix ? 14 : 7))
    if (state.glintAuto !== false) {
      state.glint = ((state.time * 0.16) % 2.2) - 0.4
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.disable(gl.BLEND)
    uniforms(tiles, () => {
      gl.uniform4f(tiles.u.uRect, -view.ox / view.s, -view.oy / view.s, view.w / view.s, view.h / view.s)
      gl.uniform2f(tiles.u.uGrid, cols, rows)
      gl.uniform1f(tiles.u.uExt, EXT)
      gl.uniform1f(tiles.u.uBleed, view.ox > 0.5 ? 1 : 0)
      gl.uniform1f(tiles.u.uDrip, state.drip)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tileTex)
      gl.uniform1i(tiles.u.uTiles, 0)
    })
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    if (state.videoReady && state.frameDirty && video.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, videoTex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      state.frameDirty = !video.paused
    }

    if (state.stillReady) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      uniforms(head, () => {
        const sc = 1 + state.lift * 0.06
        const hx = HEAD.x - (HEAD.w * (sc - 1)) / 2
        const hy = HEAD.y - state.lift * 150 - (HEAD.h * (sc - 1)) / 2
        gl.uniform4f(head.u.uRect, hx, hy, HEAD.w * sc, HEAD.h * sc)
        gl.uniform4f(head.u.uHead, hx, hy, HEAD.w * sc, HEAD.h * sc)
        gl.uniform1f(head.u.uFade, state.fade)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, stillTex)
        gl.uniform1i(head.u.uStill, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, videoTex)
        gl.uniform1i(head.u.uVideo, 1)
        gl.uniform1f(head.u.uMix, state.videoReady ? state.mix : 0)
        gl.uniform1f(head.u.uRipple, state.ripple)
        gl.uniform1f(head.u.uGlint, state.glint)
      })
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    if (state.melt < 0.999) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      uniforms(frost, () => {
        gl.uniform4f(frost.u.uRect, -view.ox / view.s, -view.oy / view.s, view.w / view.s, view.h / view.s)
        gl.uniform1f(frost.u.uMelt, state.melt)
        gl.uniform2f(frost.u.uCenter, HEAD.x + HEAD.w * 0.45, HEAD.y + HEAD.h * 0.42)
      })
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }
  raf = requestAnimationFrame(frame)

  return {
    state,
    video,
    turn,
    settle() {
      state.melt = 1
      state.mix = 0
      state.mixT = 0
    },
    destroy() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerdown', onDown)
      turnTween?.kill()
      document.removeEventListener('pointerleave', onLeave)
      video.removeAttribute('src')
      video.load()
    },
  }
}
