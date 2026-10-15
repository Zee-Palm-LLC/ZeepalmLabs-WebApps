const header = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightViewProj: mat4x4f,
  view: mat4x4f,
  camPos: vec4f,
  moonDir: vec4f,
  moonCol: vec4f,
  skyTop: vec4f,
  skyHorizon: vec4f,
  ambSky: vec4f,
  ambGround: vec4f,
  fogCol: vec4f,
  grassA: vec4f,
  grassB: vec4f,
  dirt: vec4f,
  pathCol: vec4f,
  moonSky: vec4f,
  screen: vec4f,
  params: vec4f,
  warm: vec4f,
  lights: array<vec4f, 48>,
  push: array<vec4f, 16>,
};
@group(0) @binding(0) var<uniform> u: U;

fn hash3(p: vec3f) -> f32 {
  var q = fract(p * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

fn hash2(p: vec2f) -> f32 {
  var q = fract(vec3f(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

fn noise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = hash2(i);
  let b = hash2(i + vec2f(1.0, 0.0));
  let c = hash2(i + vec2f(0.0, 1.0));
  let d = hash2(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

fn fbm(p0: vec2f) -> f32 {
  var p = p0;
  var s = 0.0;
  var a = 0.5;
  for (var i = 0; i < 5; i++) {
    s += a * noise2(p);
    p = p * 2.03 + vec2f(17.1, 3.7);
    a *= 0.5;
  }
  return s;
}

fn sky(d: vec3f, withMoon: bool) -> vec3f {
  let up = d.y;
  let t = u.camPos.w;
  var c = mix(u.skyHorizon.rgb, u.skyTop.rgb, smoothstep(-0.08, 0.6, up));
  c = mix(c, u.fogCol.rgb, 1.0 - smoothstep(-0.12, 0.06, up));
  let md = normalize(u.moonSky.xyz);
  let cm = max(dot(d, md), 0.0);
  c += u.moonCol.rgb * (pow(cm, 900.0) * 0.6 + pow(cm, 60.0) * 0.18 + pow(cm, 6.0) * 0.06);
  if (up > 0.0) {
    let g = d * 220.0;
    let cell = floor(g);
    let h = hash3(cell);
    if (h > 0.9965) {
      let sp = cell + 0.5 + (vec3f(hash3(cell + 3.1), hash3(cell + 7.7), hash3(cell + 1.3)) - 0.5) * 0.6;
      let dd = length(g - sp);
      let tw = 0.55 + 0.45 * sin(t * (1.0 + h * 5.0) + h * 80.0);
      c += vec3f(0.9, 0.92, 1.0) * (1.0 - smoothstep(0.0, 0.32, dd)) * tw * u.skyTop.w * smoothstep(0.0, 0.25, up);
    }
  }
  let R = u.moonSky.w;
  let ang = acos(clamp(dot(d, md), -1.0, 1.0));
  if (withMoon && u.params.w > 0.5) {
    let a = 1.0 - smoothstep(R * 0.9, R * 1.05, ang);
    c = mix(c, u.moonCol.rgb * 9.0 + vec3f(1.2, 1.1, 0.9), a);
    c += u.moonCol.rgb * (pow(cm, 18.0) * 0.9 + pow(cm, 4.0) * 0.18);
  } else if (withMoon && ang < R * 1.05) {
    var tx = normalize(cross(md, vec3f(0.0, 1.0, 0.0)));
    let ty = cross(tx, md);
    let lp = vec2f(dot(d - md, tx), dot(d - md, ty)) / R;
    let n = fbm(lp * 3.2 + 4.0) * 0.6 + fbm(lp * 9.0) * 0.4;
    let crater = smoothstep(0.52, 0.6, n) * 0.25;
    let limb = sqrt(max(0.0, 1.0 - dot(lp, lp)));
    var mc = u.moonCol.rgb * 3.2 * (0.82 + 0.18 * limb) * (1.0 - crater);
    let a = 1.0 - smoothstep(R * 0.97, R * 1.03, ang);
    c = mix(c, mc, a);
  }
  if (up > -0.02) {
    let pp = d.xz / (up + 0.18) * 1.6 + vec2f(t * 0.012, t * 0.004);
    let n = fbm(pp * 0.9);
    let dens = smoothstep(0.48, 0.78, n) * u.skyHorizon.w * smoothstep(-0.02, 0.18, up);
    let lit = pow(cm, 10.0);
    var cc = mix(u.skyTop.rgb * 1.6 + vec3f(0.02, 0.02, 0.04), u.moonCol.rgb * 1.4, lit * 0.8);
    if (u.params.w > 0.5) { cc = mix(mix(vec3f(1.0, 0.98, 0.95), u.skyHorizon.rgb, 0.35) * 1.05, u.moonCol.rgb * 2.2, lit * 0.7); }
    c = mix(c, cc, dens * 0.85);
  }
  return c;
}

fn shadowAt(p: vec3f, n: vec3f) -> f32 {
  return 1.0;
}

fn pointLights(p: vec3f, n: vec3f, wrap: f32) -> vec3f {
  var acc = vec3f(0.0);
  let cnt = i32(u.params.y);
  for (var i = 0; i < cnt; i++) {
    let a = u.lights[i * 2];
    let b = u.lights[i * 2 + 1];
    let L = a.xyz - p;
    let d2 = dot(L, L);
    let r2 = a.w * a.w;
    if (d2 > r2) { continue; }
    let d = sqrt(d2);
    let fall = (1.0 - d2 / r2);
    let att = fall * fall / (1.0 + d2 * 0.9);
    let nd = (dot(n, L / d) + wrap) / (1.0 + wrap);
    acc += b.rgb * b.w * max(nd, 0.0) * att;
  }
  return acc;
}

fn fogMix(c: vec3f, p: vec3f) -> vec3f {
  let dist = length(p - u.camPos.xyz);
  let hf = exp(-max(p.y + 0.5, 0.0) * 0.35);
  let f = 1.0 - exp(-dist * u.ambSky.w * (0.55 + 0.9 * hf));
  return mix(c, u.fogCol.rgb, clamp(f, 0.0, 0.92));
}

struct FS {
  @builtin(position) pos: vec4f,
  @location(0) ndc: vec2f,
};

@vertex fn vsFull(@builtin(vertex_index) i: u32) -> FS {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u)) * 2.0 - 1.0;
  var o: FS;
  o.pos = vec4f(p, 0.0, 1.0);
  o.ndc = p;
  return o;
}
`

const shadowFn = /* wgsl */ `
@group(0) @binding(1) var shadowTex: texture_depth_2d;
@group(0) @binding(2) var shadowCmp: sampler_comparison;

fn shadowVis(p: vec3f, n: vec3f) -> f32 {
  let lp = u.lightViewProj * vec4f(p + n * 0.03, 1.0);
  let nd = lp.xyz / lp.w;
  let uv = nd.xy * vec2f(0.5, -0.5) + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || nd.z > 1.0) { return 1.0; }
  let texel = 1.0 / f32(textureDimensions(shadowTex).x);
  var vis = 0.0;
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      vis += textureSampleCompareLevel(shadowTex, shadowCmp, uv + vec2f(f32(x), f32(y)) * texel * 1.6, nd.z - 0.0015);
    }
  }
  return vis / 9.0;
}

fn lit(p: vec3f, n: vec3f, alb: vec3f, sh: f32, wrap: f32) -> vec3f {
  let L = normalize(u.moonDir.xyz);
  let nd = max((dot(n, L) + wrap) / (1.0 + wrap), 0.0);
  let moon = u.moonCol.rgb * u.moonDir.w * nd * mix(1.0, sh, u.moonCol.w);
  let hemi = mix(u.ambGround.rgb, u.ambSky.rgb, n.y * 0.5 + 0.5);
  let fill = u.ambSky.rgb * 0.35 * max(dot(n, normalize(u.camPos.xyz - p)), 0.0);
  return alb * (moon + hemi + fill + pointLights(p, n, wrap) * u.warm.w);
}
`

export const skyWGSL =
  header +
  /* wgsl */ `
@fragment fn fsSky(i: FS) -> @location(0) vec4f {
  let a = u.invViewProj * vec4f(i.ndc, 0.0, 1.0);
  let b = u.invViewProj * vec4f(i.ndc, 1.0, 1.0);
  let o = a.xyz / a.w;
  let d = normalize(b.xyz / b.w - o);
  return vec4f(sky(d, true), 1.0);
}
`

const envIO = /* wgsl */ `
struct VIn {
  @location(0) pos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) col: vec3f,
  @location(3) ex: vec4f,
};

struct VO {
  @builtin(position) clip: vec4f,
  @location(0) wpos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) col: vec3f,
  @location(3) ex: vec4f,
  @location(4) lpos: vec3f,
  @location(5) inst: vec4f,
};

fn sway(p: vec3f, ex: vec4f) -> vec3f {
  if (abs(ex.x - 3.0) > 0.5) { return p; }
  let t = u.camPos.w;
  let w = u.grassA.w;
  let k = ex.z * w;
  return p + vec3f(sin(t * 1.3 + ex.w + p.x * 0.4) + 0.4 * sin(t * 2.9 + ex.w * 2.0), 0.0, cos(t * 1.1 + ex.w + p.z * 0.3)) * k;
}
`

const envShade = /* wgsl */ `
fn pumpkinFace(lp: vec3f, face: f32) -> f32 {
  if (lp.z < 0.35) { return 0.0; }
  let q = vec2f(lp.x, lp.y - 0.78);
  var m = 0.0;
  let ex = abs(q.x) - 0.3;
  let ey = q.y - 0.16;
  if (face < 0.5) {
    let tri = max(abs(ex) * 1.7 + ey * 0.9 - 0.13, -ey - 0.06);
    m = max(m, step(tri, 0.0));
    let nose = max(abs(q.x) * 2.0 + (q.y + 0.0) - 0.07, -(q.y + 0.06));
    m = max(m, step(nose, 0.0));
    let c = -0.3 + 0.55 * q.x * q.x;
    let inMouth = step(abs(q.x), 0.48) * step(c - 0.15, q.y) * step(q.y, c + 0.03);
    let tooth = step(abs(fract(q.x * 4.0 + 0.5) - 0.5), 0.12) * step(q.y, c - 0.07) * step(abs(q.x), 0.36);
    m = max(m, inMouth * (1.0 - tooth));
  } else if (face < 1.5) {
    let eye = length(vec2f(ex * 1.1, ey)) - 0.1;
    m = max(m, step(eye, 0.0));
    let c = -0.26 + 0.25 * q.x * q.x;
    let jag = 0.05 * sign(sin(q.x * 26.0));
    let inMouth = step(abs(q.x), 0.42) * step(c - 0.12 + jag, q.y) * step(q.y, c + 0.04 - jag * 0.5);
    m = max(m, inMouth);
  } else {
    let slant = ey - ex * sign(q.x) * 0.0 + (q.x * sign(q.x) - 0.3) * 0.6;
    let tri = max(abs(ex) * 1.5 - 0.12 + slant * 0.3, max(-ey - 0.08, ey - 0.08 + (abs(q.x) - 0.3) * 0.7 * sign(q.x) * sign(q.x)));
    m = max(m, step(tri, 0.0));
    let c = -0.22 + 0.42 * q.x * q.x;
    let inMouth = step(abs(q.x), 0.52) * step(c - 0.2, q.y) * step(q.y, c);
    let tooth = step(abs(q.x), 0.06) * step(c - 0.08, q.y);
    m = max(m, inMouth * (1.0 - tooth));
  }
  return m;
}

fn shadeEnv(i: VO, front: bool) -> vec4f {
  var n = normalize(i.nrm);
  if (!front) { n = -n; }
  let p = i.wpos;
  let mat = i.ex.x;
  var alb = i.col;
  var em = vec3f(0.0);
  var wrap = 0.15;
  let V = normalize(u.camPos.xyz - p);
  if (abs(mat - 1.0) < 0.5) {
    let nz = i.ex.w;
    let g = mix(u.grassA.rgb, u.grassB.rgb, smoothstep(0.3, 0.75, nz + noise2(p.xz * 3.1) * 0.25));
    let d = u.dirt.rgb * (0.8 + 0.4 * noise2(p.xz * 5.0));
    let pa = u.pathCol.rgb * (0.82 + 0.3 * noise2(p.xz * 7.0));
    alb = g * i.col.x + d * i.col.y + pa * i.col.z;
    let cell = floor(p.xz * 7.0);
    let h = hash2(cell);
    if (h > 0.9 && i.col.x > 0.4) {
      let lc = fract(p.xz * 7.0) - 0.5 - (vec2f(hash2(cell + 1.7), hash2(cell + 9.1)) - 0.5) * 0.4;
      let ang = h * 40.0;
      let rot = vec2f(lc.x * cos(ang) - lc.y * sin(ang), lc.x * sin(ang) + lc.y * cos(ang));
      let leaf = length(rot * vec2f(1.0, 2.2));
      if (leaf < 0.22) {
        var lcols = array<vec3f, 3>(vec3f(0.75, 0.22, 0.04), vec3f(0.85, 0.5, 0.06), vec3f(0.5, 0.08, 0.05));
        alb = lcols[u32(h * 300.0) % 3u];
      }
    }
  } else if (abs(mat - 2.0) < 0.5) {
    em = i.col * i.ex.y * u.fogCol.w;
  } else if (abs(mat - 4.0) < 0.5) {
    let f = pumpkinFace(i.lpos, i.inst.y);
    if (i.inst.y > -0.5 && f > 0.5) {
      let fl = 0.85 + 0.15 * sin(u.camPos.w * 11.0 + i.inst.z * 7.0) * sin(u.camPos.w * 7.3 + i.inst.z);
      alb = vec3f(0.02, 0.01, 0.0);
      em = vec3f(1.0, 0.55, 0.12) * 6.0 * i.inst.x * fl * u.fogCol.w + vec3f(0.05, 0.015, 0.0);
    }
  } else if (abs(mat - 5.0) < 0.5) {
    let r = reflect(-V, n);
    em = sky(r, false) * 0.5;
    alb = vec3f(0.02);
  } else if (abs(mat - 6.0) < 0.5) {
    let fl = 0.85 + 0.15 * sin(u.camPos.w * 13.0 + i.inst.z * 3.0);
    em = i.col * i.ex.y * i.inst.x * fl * u.fogCol.w;
    alb = i.col * 0.15;
  } else if (abs(mat - 7.0) < 0.5) {
    let t = u.camPos.w;
    let q = p.xz * 2.2;
    let w1 = noise2(q + vec2f(t * 0.35, t * 0.2));
    let w2 = noise2(q * 1.9 - vec2f(t * 0.25, -t * 0.3));
    var nn = normalize(vec3f((w1 - 0.5) * 0.18 + (w2 - 0.5) * 0.12, 1.0, (w2 - 0.5) * 0.18 - (w1 - 0.5) * 0.1));
    let r = reflect(-V, nn);
    let F = 0.04 + 0.96 * pow(1.0 - max(dot(nn, V), 0.0), 5.0);
    var refl = sky(r, true);
    refl += pointLights(p + vec3f(0.0, 0.05, 0.0), vec3f(0.0, 1.0, 0.0), 0.0) * 0.25;
    let deep = vec3f(0.01, 0.025, 0.04);
    let col = mix(deep, refl, clamp(F * 1.6 + 0.25, 0.0, 1.0));
    return vec4f(fogMix(col, p), 1.0);
  }
  if (abs(mat - 3.0) < 0.5) { wrap = 0.45; }
  let sh = shadowVis(p, n);
  var col = lit(p, n, alb, sh, wrap) + em;
  let sp = pow(max(dot(n, normalize(normalize(u.moonDir.xyz) + V)), 0.0), 40.0) * 0.06 * sh;
  col += u.moonCol.rgb * sp;
  return vec4f(fogMix(col, p), 1.0);
}
`

export const envWGSL =
  header +
  shadowFn +
  envIO +
  envShade +
  /* wgsl */ `
@vertex fn vsEnv(i: VIn) -> VO {
  var o: VO;
  let p = sway(i.pos, i.ex);
  o.clip = u.viewProj * vec4f(p, 1.0);
  o.wpos = p;
  o.nrm = i.nrm;
  o.col = i.col;
  o.ex = i.ex;
  o.lpos = i.pos;
  o.inst = vec4f(0.0, -1.0, 0.0, 0.0);
  return o;
}

struct PIn {
  @location(0) pos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) col: vec3f,
  @location(3) ex: vec4f,
  @location(4) m0: vec4f,
  @location(5) m1: vec4f,
  @location(6) m2: vec4f,
  @location(7) prm: vec4f,
};

@vertex fn vsProp(i: PIn) -> VO {
  var o: VO;
  let wp = i.m0.xyz * i.pos.x + i.m1.xyz * i.pos.y + i.m2.xyz * i.pos.z + vec3f(i.m0.w, i.m1.w, i.m2.w);
  let wn = normalize(i.m0.xyz * i.nrm.x / dot(i.m0.xyz, i.m0.xyz) + i.m1.xyz * i.nrm.y / dot(i.m1.xyz, i.m1.xyz) + i.m2.xyz * i.nrm.z / dot(i.m2.xyz, i.m2.xyz));
  o.clip = u.viewProj * vec4f(wp, 1.0);
  o.wpos = wp;
  o.nrm = wn;
  o.col = i.col;
  o.ex = i.ex;
  o.lpos = i.pos;
  o.inst = i.prm;
  return o;
}

@fragment fn fsEnv(i: VO, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  return shadeEnv(i, ff);
}
`

const deformIO = /* wgsl */ `
@group(1) @binding(0) var<storage, read> parts: array<vec4f>;
@group(1) @binding(1) var<storage, read> tets: array<vec4u>;
@group(1) @binding(2) var<storage, read> dmi: array<vec4f>;

struct Def {
  p: vec3f,
  n: vec3f,
};

fn deform(t: u32, w: vec4f, n0: vec3f) -> Def {
  let id = tets[t];
  let p0 = parts[id.x].xyz;
  let p1 = parts[id.y].xyz;
  let p2 = parts[id.z].xyz;
  let p3 = parts[id.w].xyz;
  var d: Def;
  d.p = p0 * w.x + p1 * w.y + p2 * w.z + p3 * w.w;
  let e1 = p1 - p0;
  let e2 = p2 - p0;
  let e3 = p3 - p0;
  let r0 = dmi[t * 3u];
  let r1 = dmi[t * 3u + 1u];
  let r2 = dmi[t * 3u + 2u];
  let c0 = e1 * r0.x + e2 * r1.x + e3 * r2.x;
  let c1 = e1 * r0.y + e2 * r1.y + e3 * r2.y;
  let c2 = e1 * r0.z + e2 * r1.z + e3 * r2.z;
  d.n = normalize(cross(c1, c2) * n0.x + cross(c2, c0) * n0.y + cross(c0, c1) * n0.z);
  return d;
}

struct JIn {
  @location(0) tet: u32,
  @location(1) w: vec4f,
  @location(2) n0: vec3f,
  @location(3) rest: vec3f,
  @location(4) col: vec4f,
};
`

export const shadowWGSL =
  header +
  envIO +
  deformIO +
  /* wgsl */ `
@vertex fn vsShadowEnv(i: VIn) -> @builtin(position) vec4f {
  return u.lightViewProj * vec4f(sway(i.pos, i.ex), 1.0);
}

@vertex fn vsShadowProp(@location(0) pos: vec3f, @location(4) m0: vec4f, @location(5) m1: vec4f, @location(6) m2: vec4f) -> @builtin(position) vec4f {
  let wp = m0.xyz * pos.x + m1.xyz * pos.y + m2.xyz * pos.z + vec3f(m0.w, m1.w, m2.w);
  return u.lightViewProj * vec4f(wp, 1.0);
}

@vertex fn vsShadowJelly(i: JIn) -> @builtin(position) vec4f {
  let df = deform(i.tet, i.w, i.n0);
  return u.lightViewProj * vec4f(df.p, 1.0);
}
`

export const grassWGSL =
  header +
  shadowFn +
  /* wgsl */ `
struct GO {
  @builtin(position) clip: vec4f,
  @location(0) wpos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) v: f32,
  @location(3) tint: f32,
};

@vertex fn vsGrass(@builtin(vertex_index) vi: u32, @location(0) a: vec4f, @location(1) b: vec4f) -> GO {
  var lv = array<f32, 7>(0.0, 0.0, 0.38, 0.38, 0.74, 0.74, 1.0);
  var sd = array<f32, 7>(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 0.0);
  let v = lv[vi];
  let h = a.w;
  let yaw = b.x;
  let width = 0.028 * (1.0 - v * 0.85) * (0.8 + b.y * 0.5);
  let t = u.camPos.w;
  let base = a.xyz;
  var bend = vec2f(sin(t * 1.6 + base.x * 0.7 + base.z * 0.3) * 0.5 + sin(t * 3.7 + b.z * 6.0) * 0.2, cos(t * 1.3 + base.z * 0.6) * 0.35) * u.grassA.w * 0.22;
  bend += vec2f(cos(b.z * 6.28), sin(b.z * 6.28)) * 0.08;
  let np = i32(u.params.z);
  var flat = 0.0;
  for (var k = 0; k < np; k++) {
    let pp = u.push[k];
    let dv = base.xz - pp.xz;
    let dd = length(dv);
    if (dd < pp.w) {
      let f = 1.0 - dd / pp.w;
      bend += normalize(dv + vec2f(0.0001)) * f * 0.6;
      flat = max(flat, f);
    }
  }
  let side = vec2f(cos(yaw), sin(yaw));
  let hh = h * (1.0 - flat * 0.65);
  var p = base + vec3f(side.x * width * sd[vi], v * hh, side.y * width * sd[vi]);
  p += vec3f(bend.x, 0.0, bend.y) * v * v * hh;
  p.y -= length(bend) * v * v * hh * 0.35;
  var o: GO;
  o.clip = u.viewProj * vec4f(p, 1.0);
  o.wpos = p;
  o.nrm = normalize(vec3f(-side.y, 0.6, side.x));
  o.v = v;
  o.tint = b.y;
  return o;
}

@fragment fn fsGrass(i: GO, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  var n = normalize(i.nrm);
  if (!ff) { n = -n; }
  let alb = mix(u.grassA.rgb * 0.75, u.grassB.rgb * (1.05 + i.tint * 0.35), i.v);
  let sh = shadowVis(i.wpos, vec3f(0.0, 1.0, 0.0));
  var col = lit(i.wpos, normalize(n + vec3f(0.0, 0.8, 0.0)), alb, sh, 0.6);
  let V = normalize(u.camPos.xyz - i.wpos);
  let back = pow(max(dot(-V, normalize(u.moonDir.xyz)), 0.0), 4.0) * i.v * sh;
  col += u.moonCol.rgb * u.grassB.rgb * back * 0.6;
  col *= 0.55 + 0.45 * i.v;
  return vec4f(fogMix(col, i.wpos), 1.0);
}
`

const jellyIO = /* wgsl */ `
struct Animal {
  tint: vec4f,
  misc: vec4f,
};
@group(0) @binding(3) var<storage, read> animals: array<Animal>;

struct JO {
  @builtin(position) clip: vec4f,
  @location(0) wpos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) rest: vec3f,
  @location(3) col: vec4f,
  @location(4) vz: f32,
  @location(5) @interpolate(flat) iid: u32,
};

@vertex fn vsJelly(i: JIn, @builtin(instance_index) iid: u32) -> JO {
  var o: JO;
  let df = deform(i.tet, i.w, i.n0);
  o.clip = u.viewProj * vec4f(df.p, 1.0);
  o.wpos = df.p;
  o.nrm = df.n;
  o.rest = i.rest;
  o.col = i.col;
  o.vz = -(u.view * vec4f(df.p, 1.0)).z;
  o.iid = iid;
  return o;
}
`

export const backWGSL =
  header +
  deformIO +
  jellyIO +
  /* wgsl */ `
@fragment fn fsBack(i: JO) -> @location(0) vec4f {
  return vec4f(i.vz, 0.0, 0.0, 1.0);
}
`

export const jellyWGSL =
  header +
  shadowFn +
  deformIO +
  jellyIO +
  /* wgsl */ `
@group(0) @binding(4) var sceneTex: texture_2d<f32>;
@group(0) @binding(5) var linSamp: sampler;
@group(0) @binding(6) var backTex: texture_2d<f32>;

fn ggx(n: vec3f, v: vec3f, l: vec3f, a2: f32) -> f32 {
  let h = normalize(l + v);
  let nh = max(dot(n, h), 0.0);
  let d = nh * nh * (a2 - 1.0) + 1.0;
  return a2 / (3.14159 * d * d) * max(dot(n, l), 0.0);
}

@fragment fn fsJelly(i: JO, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  let A = animals[i.iid];
  let p = i.wpos;
  let V = normalize(u.camPos.xyz - p);
  var N = normalize(i.nrm);
  if (!ff) { N = -N; }
  let ndv0 = dot(N, V);
  if (ndv0 < 0.05) { N = normalize(N + V * (0.05 - ndv0)); }
  let NdV = clamp(dot(N, V), 0.0, 1.0);
  let L = normalize(u.moonDir.xyz);
  let sh = shadowVis(p, N);
  let kind = i.col.w;
  let base = i.col.rgb * A.tint.rgb;
  let F = 0.035 + 0.965 * pow(1.0 - NdV, 5.0);
  let refl = sky(reflect(-V, N), false) * 0.9 + pointLights(p + N * 0.3, reflect(-V, N), 0.0) * 0.12 * u.warm.w;
  var spec = u.moonCol.rgb * u.moonDir.w * ggx(N, V, L, 0.004) * 0.05 * sh;
  let cnt = i32(u.params.y);
  for (var k = 0; k < cnt; k++) {
    let a = u.lights[k * 2];
    let b = u.lights[k * 2 + 1];
    let Lv = a.xyz - p;
    let d2 = dot(Lv, Lv);
    if (d2 > a.w * a.w * 1.5) { continue; }
    let fall = max(0.0, 1.0 - d2 / (a.w * a.w * 1.5));
    spec += b.rgb * b.w * ggx(N, V, normalize(Lv), 0.006) * 0.012 * fall * u.warm.w;
  }
  let hl = A.misc.z;
  let rim = pow(1.0 - NdV, 3.0);
  if (kind > 0.5 && kind < 1.5) {
    let right1 = vec3f(u.view[0].x, u.view[1].x, u.view[2].x);
    let key1 = normalize(V + vec3f(0.0, 0.9, 0.0) - right1 * 0.55);
    let kc = mix(u.moonCol.rgb, u.warm.rgb, 0.3) * 0.62;
    let c = lit(p, N, base * 0.6, sh, 0.1) + base * kc * max(dot(N, key1), 0.0) * 0.6 + spec * 2.5 + kc * ggx(N, V, key1, 0.002) * 0.12 + F * refl * 1.4 + rim * u.moonCol.rgb * 0.05;
    return vec4f(fogMix(c, p), 1.0);
  }
  if (kind > 1.5 && kind < 2.5) {
    let c = base * 3.2 * (0.8 + 0.2 * sin(u.camPos.w * 2.0)) + spec * 2.0 + F * refl;
    return vec4f(c, 1.0);
  }
  let px = vec2i(i.clip.xy);
  let back = textureLoad(backTex, px, 0).r;
  let fwd = -vec3f(u.view[0].z, u.view[1].z, u.view[2].z);
  let cosR = max(dot(-V, fwd), 0.3);
  var thick = 0.06;
  if (back > i.vz) { thick = (back - i.vz) / cosR; }
  thick = clamp(thick, 0.01, 1.6);
  let wool = kind > 2.5;
  let dens = A.tint.w * select(1.0, 0.75, wool);
  let absorb = -log(max(base, vec3f(0.03))) * dens + vec3f(select(0.25, 2.6, wool) + A.misc.w);
  let Tr = exp(-absorb * thick);
  let nv = (u.view * vec4f(N, 0.0)).xyz;
  let uv0 = i.clip.xy * u.screen.zw;
  let uvr = clamp(uv0 - nv.xy * vec2f(1.0, -1.0) * min(thick, 0.6) * 0.05, vec2f(0.002), vec2f(0.998));
  let bg = textureSampleLevel(sceneTex, linSamp, uvr, 0.0).rgb;
  let right = vec3f(u.view[0].x, u.view[1].x, u.view[2].x);
  let key = normalize(V * 1.0 + vec3f(0.0, 0.9, 0.0) - right * 0.55);
  let keyCol = mix(u.moonCol.rgb, u.warm.rgb, 0.42) * 0.7;
  spec += keyCol * ggx(N, V, key, 0.0025) * 0.09;
  let inner = lit(p - N * 0.05, N, vec3f(1.0), sh, 0.7) + keyCol * (0.55 + 0.45 * dot(N, key)) + u.ambSky.rgb * 0.8;
  let deep = select(base * base * 1.35, base, wool);
  let lum = dot(inner, vec3f(0.3, 0.5, 0.2));
  let scat = deep * mix(inner, vec3f(lum), 0.55) * select(1.0, 1.05, wool);
  let Ls = scat * (1.0 - Tr) * 1.7;
  let trans = pow(max(dot(-V, L), 0.0), 3.0) * exp(-thick * 2.5) * u.moonCol.rgb * u.moonDir.w * base * 1.2 * sh;
  var bub = 0.0;
  if (!wool) {
    let g = i.rest * 16.0 + A.misc.y;
    let cell = floor(g);
    if (hash3(cell) > 0.986) {
      let cp = cell + 0.5 + (vec3f(hash3(cell + 2.0), hash3(cell + 5.0), hash3(cell + 9.0)) - 0.5) * 0.5;
      let dd = length(g - cp);
      bub = (1.0 - smoothstep(0.1, 0.22, dd)) * 0.5 + (1.0 - smoothstep(0.0, 0.06, length(g - cp - vec3f(-0.06, 0.06, 0.06)))) * 1.4;
    }
  }
  var c = (1.0 - F) * (bg * Tr * mix(vec3f(1.0), base, 0.5) + Ls + trans) + F * refl + spec * 1.6;
  c += vec3f(bub) * (u.moonCol.rgb * 0.25 + u.ambSky.rgb * 1.5);
  c += rim * (u.moonCol.rgb * 0.1 + base * (u.ambSky.rgb * 1.2 + keyCol * 0.5));
  c += base * A.misc.x;
  c += rim * vec3f(1.0, 0.75, 0.35) * hl * 0.5;
  return vec4f(fogMix(c, p), 1.0);
}
`

export const glowWGSL =
  header +
  /* wgsl */ `
struct GlO {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
  @location(1) col: vec4f,
};

@vertex fn vsGlow(@builtin(vertex_index) vi: u32, @location(0) a: vec4f, @location(1) b: vec4f, @location(2) c: vec4f) -> GlO {
  var corners = array<vec2f, 4>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(1.0, 1.0));
  let q = corners[vi];
  let t = u.camPos.w;
  var p = a.xyz;
  var size = a.w;
  var inten = b.w;
  let kind = c.x;
  let ph = c.y;
  if (kind > 0.5 && kind < 1.5) {
    p += vec3f(sin(t * 0.37 + ph * 6.0) * 0.9, sin(t * 0.61 + ph * 3.0) * 0.35, cos(t * 0.29 + ph * 5.0) * 0.9);
    let blink = smoothstep(0.55, 0.95, sin(t * (0.7 + ph) + ph * 40.0));
    inten *= blink * (0.12 + u.skyTop.w);
  } else if (kind > 1.5 && kind < 2.5) {
    let f = fract(t * 0.035 + ph);
    p += vec3f(sin(t * 0.3 + ph * 9.0) * 0.4, f * 3.2, cos(t * 0.27 + ph * 7.0) * 0.4);
    inten *= sin(f * 3.14159) * (0.6 + 0.4 * sin(t * 3.0 + ph * 20.0));
  } else if (kind > 2.5) {
    inten *= u.fogCol.w * c.z;
  }
  let right = vec3f(u.view[0].x, u.view[1].x, u.view[2].x);
  let up = vec3f(u.view[0].y, u.view[1].y, u.view[2].y);
  let wp = p + (right * q.x + up * q.y) * size;
  var o: GlO;
  o.clip = u.viewProj * vec4f(wp, 1.0);
  o.uv = q;
  o.col = vec4f(b.rgb, inten);
  return o;
}

@fragment fn fsGlow(i: GlO) -> @location(0) vec4f {
  let r = length(i.uv);
  if (r > 1.0) { discard; }
  let core = exp(-r * r * 9.0);
  let halo = (1.0 - r) * (1.0 - r) * 0.35;
  return vec4f(i.col.rgb * (core + halo) * i.col.a, 0.0);
}

struct BO {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
  @location(1) flap: f32,
};

@vertex fn vsBat(@builtin(vertex_index) vi: u32, @location(0) a: vec4f) -> BO {
  var corners = array<vec2f, 4>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(1.0, 1.0));
  let q = corners[vi];
  let t = u.camPos.w * a.y + a.x * 30.0;
  let cyc = fract(t * 0.025 + a.x);
  let x = mix(-26.0, 26.0, cyc);
  let p = vec3f(x + sin(t * 0.7) * 2.0, a.z + sin(t * 1.3 + a.x * 9.0) * 0.8 + sin(cyc * 3.14159) * 3.0, -22.0 - a.x * 10.0);
  let right = vec3f(u.view[0].x, u.view[1].x, u.view[2].x);
  let up = vec3f(u.view[0].y, u.view[1].y, u.view[2].y);
  let wp = p + (right * q.x * 0.9 + up * q.y * 0.45) * a.w;
  var o: BO;
  o.clip = u.viewProj * vec4f(wp, 1.0);
  o.uv = q * vec2f(1.0, 0.5);
  o.flap = sin(t * 14.0);
  return o;
}

@fragment fn fsBat(i: BO) -> @location(0) vec4f {
  let x = abs(i.uv.x);
  let y = i.uv.y;
  let wingY = i.flap * 0.18 * x;
  let wing = step(x, 0.98) * step(abs(y - wingY - 0.02 + x * 0.06), 0.13 - x * 0.08 + 0.05 * sin(x * 18.0));
  let body = step(length(vec2f(i.uv.x * 1.8, (y + 0.02) * 1.2)), 0.12);
  let ears = step(abs(abs(i.uv.x) - 0.05), 0.02) * step(0.1, y) * step(y, 0.17);
  let m = max(max(wing, body), ears);
  if (m < 0.5) { discard; }
  return vec4f(u.skyTop.rgb * 0.25, 0.92);
}
`

export const lineWGSL =
  header +
  /* wgsl */ `
@vertex fn vsLine(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return u.viewProj * vec4f(pos, 1.0);
}

@fragment fn fsLine() -> @location(0) vec4f {
  return vec4f(0.55, 0.95, 1.0, 0.55);
}
`

export const postWGSL =
  header +
  /* wgsl */ `
@group(0) @binding(1) var hdr: texture_2d<f32>;

fn neutral(c0: vec3f) -> vec3f {
  let start = 0.76;
  let desat = 0.15;
  var c = c0;
  let x = min(c.r, min(c.g, c.b));
  var off = 0.04;
  if (x < 0.08) { off = x - 6.25 * x * x; }
  c -= off;
  let peak = max(c.r, max(c.g, c.b));
  if (peak < start) { return c; }
  let d = 1.0 - start;
  let np = 1.0 - d * d / (peak + d - start);
  c *= np / peak;
  let g = 1.0 - 1.0 / (desat * (peak - np) + 1.0);
  return mix(c, vec3f(np), g);
}

fn srgb(c: vec3f) -> vec3f {
  let lo = c * 12.92;
  let hi = 1.055 * pow(max(c, vec3f(0.0)), vec3f(1.0 / 2.4)) - 0.055;
  return select(hi, lo, c <= vec3f(0.0031308));
}

@fragment fn fsPost(i: FS) -> @location(0) vec4f {
  let px = vec2i(i.pos.xy);
  var c = textureLoad(hdr, px, 0).rgb * u.ambGround.w;
  var bloom = vec3f(0.0);
  let dims = vec2i(textureDimensions(hdr));
  for (var k = 0; k < 8; k++) {
    let a = f32(k) * 0.785398;
    let o = vec2i(vec2f(cos(a), sin(a)) * 6.0);
    let s = textureLoad(hdr, clamp(px + o, vec2i(0), dims - 1), 0).rgb;
    bloom += max(s - vec3f(1.6), vec3f(0.0));
  }
  c += bloom * 0.035 * u.fogCol.w;
  c *= 1.0 - 0.22 * smoothstep(0.65, 1.6, length(i.ndc * vec2f(0.85, 1.0)));
  c = srgb(neutral(max(c, vec3f(0.0))));
  let dth = (hash3(vec3f(i.pos.xy, u.camPos.w * 60.0)) - 0.5) / 255.0;
  return vec4f(c + dth, 1.0);
}
`
