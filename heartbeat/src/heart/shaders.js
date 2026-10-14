const common = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightViewProj: mat4x4f,
  view: mat4x4f,
  camPos: vec4f,
  lightPos: vec4f,
  flesh: vec4f,
  pith: vec4f,
  rind: vec4f,
  membrane: vec4f,
  params: vec4f,
  screen: vec4f,
  params2: vec4f,
};
@group(0) @binding(0) var<uniform> u: U;

fn hash3(p: vec3f) -> f32 {
  var q = fract(p * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

fn hash33(p: vec3f) -> vec3f {
  var q = fract(p * vec3f(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.xxy + q.yxx) * q.zyx);
}

fn noise3(p: vec3f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = mix(hash3(i), hash3(i + vec3f(1.0, 0.0, 0.0)), w.x);
  let b = mix(hash3(i + vec3f(0.0, 1.0, 0.0)), hash3(i + vec3f(1.0, 1.0, 0.0)), w.x);
  let c = mix(hash3(i + vec3f(0.0, 0.0, 1.0)), hash3(i + vec3f(1.0, 0.0, 1.0)), w.x);
  let d = mix(hash3(i + vec3f(0.0, 1.0, 1.0)), hash3(i + vec3f(1.0, 1.0, 1.0)), w.x);
  return mix(mix(a, b, w.y), mix(c, d, w.y), w.z);
}

fn rectL(d: vec3f, axis: vec3f, w: f32, h: f32, soft: f32) -> f32 {
  let c = dot(d, axis);
  if (c <= 0.0) { return 0.0; }
  var r = vec3f(0.0, 1.0, 0.0);
  if (abs(axis.y) > 0.9) { r = vec3f(0.0, 0.0, 1.0); }
  let t = normalize(cross(r, axis));
  let b = cross(axis, t);
  let x = dot(d, t) / c;
  let y = dot(d, b) / c;
  return (1.0 - smoothstep(w - soft, w + soft, abs(x))) * (1.0 - smoothstep(h - soft, h + soft, abs(y)));
}

fn env(d: vec3f) -> vec3f {
  let up = d.y;
  var col = mix(vec3f(0.34, 0.31, 0.28), vec3f(0.80, 0.76, 0.70), smoothstep(-0.35, 0.12, up));
  col = mix(col, vec3f(0.10, 0.095, 0.09), smoothstep(0.28, 0.85, up));
  col += vec3f(1.0, 0.98, 0.95) * 9.0 * rectL(d, normalize(vec3f(-0.38, 0.92, -0.3)), 0.62, 0.38, 0.05);
  col += vec3f(1.0, 0.95, 0.88) * 6.0 * rectL(d, normalize(vec3f(-0.78, 0.32, -0.54)), 0.05, 0.55, 0.015);
  col += vec3f(1.0, 0.97, 0.93) * 1.7 * rectL(d, normalize(vec3f(0.62, 0.22, 0.75)), 0.5, 0.45, 0.12);
  return col;
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

struct VIn {
  @location(0) pos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) rest: vec3f,
};

struct VO {
  @builtin(position) clip: vec4f,
  @location(0) wpos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) rest: vec3f,
  @location(3) vz: f32,
};

@vertex fn vsJelly(i: VIn) -> VO {
  var o: VO;
  o.clip = u.viewProj * vec4f(i.pos, 1.0);
  o.wpos = i.pos;
  o.nrm = i.nrm;
  o.rest = i.rest;
  o.vz = -(u.view * vec4f(i.pos, 1.0)).z;
  return o;
}
`

export const sceneWGSL =
  common +
  /* wgsl */ `
@group(0) @binding(1) var shadowTex: texture_depth_2d;
@group(0) @binding(2) var shadowCmp: sampler_comparison;

var<private> POISSON: array<vec2f, 16> = array<vec2f, 16>(
  vec2f(-0.94201624, -0.39906216), vec2f(0.94558609, -0.76890725), vec2f(-0.09418410, -0.92938870), vec2f(0.34495938, 0.29387760),
  vec2f(-0.91588581, 0.45771432), vec2f(-0.81544232, -0.87912464), vec2f(-0.38277543, 0.27676845), vec2f(0.97484398, 0.75648379),
  vec2f(0.44323325, -0.97511554), vec2f(0.53742981, -0.47373420), vec2f(-0.26496911, -0.41893023), vec2f(0.79197514, 0.19090188),
  vec2f(-0.24188840, 0.99706507), vec2f(-0.81409955, 0.91437590), vec2f(0.19984126, 0.78641367), vec2f(0.14383161, -0.14100790)
);

fn shadowVis(p: vec3f, px: vec2f) -> f32 {
  let lp = u.lightViewProj * vec4f(p, 1.0);
  let nd = lp.xyz / lp.w;
  let uv = nd.xy * vec2f(0.5, -0.5) + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || nd.z > 1.0) { return 1.0; }
  let zr = nd.z;
  let dims = vec2f(textureDimensions(shadowTex));
  let ang = hash3(vec3f(px, 3.7)) * 6.2831853;
  let cs = cos(ang);
  let sn = sin(ang);
  let rot = mat2x2f(cs, sn, -sn, cs);
  var sum = 0.0;
  var cnt = 0.0;
  let search = 0.045;
  for (var i = 0; i < 16; i++) {
    let o = rot * POISSON[i] * search;
    let c = clamp(vec2i((uv + o) * dims), vec2i(0), vec2i(dims) - 1);
    let d = textureLoad(shadowTex, c, 0);
    if (d < zr - 0.002) {
      sum += d;
      cnt += 1.0;
    }
  }
  if (cnt < 0.5) { return 1.0; }
  let blk = sum / cnt;
  let pen = clamp((zr - blk) * u.lightPos.w, 0.0012, 0.06);
  var vis = 0.0;
  for (var i = 0; i < 16; i++) {
    let o = rot * POISSON[i] * pen;
    vis += textureSampleCompareLevel(shadowTex, shadowCmp, uv + o, zr - 0.002);
  }
  return vis / 16.0;
}

fn studio(o: vec3f, d: vec3f, px: vec2f) -> vec3f {
  let zc = -2.4;
  let rc = 2.8;
  var t = 1e9;
  var n = vec3f(0.0, 1.0, 0.0);
  if (d.y < -1e-4) {
    let tf = -o.y / d.y;
    let pf = o + d * tf;
    if (pf.z >= zc) {
      t = tf;
      n = vec3f(0.0, 1.0, 0.0);
    }
  }
  let oy = o.y - rc;
  let oz = o.z - zc;
  let a = d.y * d.y + d.z * d.z;
  let b = 2.0 * (oy * d.y + oz * d.z);
  let c = oy * oy + oz * oz - rc * rc;
  let disc = b * b - 4.0 * a * c;
  if (disc > 0.0 && a > 1e-6) {
    let tc = (-b + sqrt(disc)) / (2.0 * a);
    let pc = o + d * tc;
    if (tc > 0.0 && pc.z < zc && pc.y < rc && tc < t) {
      t = tc;
      n = normalize(vec3f(0.0, rc - pc.y, zc - pc.z));
    }
  }
  if (d.z < -1e-4) {
    let tw = (zc - rc - o.z) / d.z;
    let pw = o + d * tw;
    if (pw.y >= rc && tw < t) {
      t = tw;
      n = vec3f(0.0, 0.0, 1.0);
    }
  }
  if (t > 1e8) { return vec3f(0.07, 0.065, 0.06); }
  let p = o + d * t;
  let alb = vec3f(0.80, 0.755, 0.69);
  let L1 = u.lightPos.xyz - p;
  let d1 = length(L1);
  let key = 46.0 * max(dot(n, L1 / d1), 0.0) / (d1 * d1 + 3.0);
  let L2 = vec3f(-4.6, 2.6, -2.8) - p;
  let d2 = length(L2);
  let strip = 8.0 * max(dot(n, L2 / d2), 0.0) / (d2 * d2 + 4.0);
  let L3 = vec3f(4.2, 1.8, 4.6) - p;
  let d3 = length(L3);
  let fill = 10.0 * max(dot(n, L3 / d3), 0.0) / (d3 * d3 + 6.0);
  var vis = 1.0;
  if (n.y > 0.99) { vis = shadowVis(p, px); }
  let tint = pow(u.flesh.rgb, vec3f(1.6));
  let shade = vec3f(vis) + (1.0 - vis) * tint * 0.45;
  let ao = 1.0 - (1.0 - vis) * 0.3;
  return alb * (key * shade + (strip + fill + 0.26) * ao);
}

@fragment fn fsScene(i: FS) -> @location(0) vec4f {
  let a = u.invViewProj * vec4f(i.ndc, 0.0, 1.0);
  let b = u.invViewProj * vec4f(i.ndc, 1.0, 1.0);
  let o = a.xyz / a.w;
  let d = normalize(b.xyz / b.w - o);
  return vec4f(studio(u.camPos.xyz, d, i.pos.xy), 1.0);
}
`

export const shadowWGSL =
  common +
  /* wgsl */ `
@vertex fn vsShadow(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return u.lightViewProj * vec4f(pos, 1.0);
}
`

export const backWGSL =
  common +
  /* wgsl */ `
@fragment fn fsBack(i: VO) -> @location(0) vec4f {
  return vec4f(i.rest, i.vz);
}
`

export const copyWGSL = /* wgsl */ `
@group(0) @binding(0) var src: texture_2d<f32>;

@vertex fn vsFull(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u)) * 2.0 - 1.0;
  return vec4f(p, 0.0, 1.0);
}

@fragment fn fsCopy(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  return textureLoad(src, vec2i(pos.xy), 0);
}
`

export const frontWGSL =
  common +
  /* wgsl */ `
@group(0) @binding(1) var sceneTex: texture_2d<f32>;
@group(0) @binding(2) var linSamp: sampler;
@group(0) @binding(3) var backTex: texture_2d<f32>;

var<private> CH_C: array<vec3f, 4> = array<vec3f, 4>(
  vec3f(-0.52, 0.02, 0.52),
  vec3f(0.52, -0.06, 0.56),
  vec3f(-0.34, 0.06, -0.18),
  vec3f(0.34, -0.02, -0.24)
);
var<private> CH_R: array<vec3f, 4> = array<vec3f, 4>(
  vec3f(0.33, 0.24, 0.27),
  vec3f(0.31, 0.22, 0.26),
  vec3f(0.36, 0.22, 0.5),
  vec3f(0.34, 0.25, 0.56)
);

fn chamberE(p: vec3f, q: i32, aA: f32, aV: f32) -> f32 {
  var sc = 1.0 - 0.26 * aA;
  if (q >= 2) { sc = 1.0 - 0.3 * aV; }
  return length((p - CH_C[q]) / (CH_R[q] * sc));
}

@fragment fn fsFront(i: VO) -> @location(0) vec4f {
  let aA = u.params2.z;
  let aV = u.params2.w;
  let px = vec2i(i.clip.xy);
  let back = textureLoad(backTex, px, 0);
  let V = normalize(u.camPos.xyz - i.wpos);
  var N = normalize(i.nrm);
  let ndv0 = dot(N, V);
  if (ndv0 < 0.04) { N = normalize(N + V * (0.04 - ndv0)); }
  let NdV = clamp(dot(N, V), 0.0, 1.0);
  let fwd = -vec3f(u.view[0].z, u.view[1].z, u.view[2].z);
  let cosR = max(dot(-V, fwd), 0.3);
  var thick = 0.05;
  var bRest = i.rest;
  if (back.w > i.vz) {
    thick = (back.w - i.vz) / cosR;
    bRest = back.xyz;
  }
  thick = clamp(thick, 0.0, 2.4);

  let rd = refract(-V, N, 1.0 / 1.38);
  let ex = i.wpos + rd * thick * 0.9;
  let ce = u.viewProj * vec4f(ex, 1.0);
  let uvr = clamp(ce.xy / ce.w * vec2f(0.5, -0.5) + 0.5, vec2f(0.002), vec2f(0.998));
  let bg = textureSampleLevel(sceneTex, linSamp, uvr, 0.0).rgb;

  let Lk = normalize(u.lightPos.xyz - i.wpos);
  let H = normalize(Lk + V);
  let myoA = -log(max(u.flesh.rgb, vec3f(0.002))) * u.flesh.w;
  let bloodA = -log(max(u.pith.rgb, vec3f(0.002))) * u.pith.w;
  let ds = thick / 28.0;
  let jit = hash3(vec3f(vec2f(px), 2.1));
  var Tr = vec3f(1.0);
  var Ls = vec3f(0.0);
  for (var s = 0; s < 28; s++) {
    let f = (f32(s) + jit) / 28.0;
    let p = mix(i.rest, bRest, f);
    var e = 9.0;
    for (var q = 0; q < 4; q++) { e = min(e, chamberE(p, q, aA, aV)); }
    let blood = 1.0 - smoothstep(0.86, 1.0, e);
    let endo = smoothstep(0.8, 0.97, e) * (1.0 - smoothstep(0.97, 1.12, e));
    let ang = atan2(p.y, p.x);
    let fib = noise3(vec3f(ang * 5.0 + p.z * 3.0, p.z * 11.0, length(p.xy) * 6.0));
    var sa = mix(myoA * (0.8 + 0.4 * fib), bloodA, blood);
    var ss = mix(0.9 + 1.1 * fib, 0.2, blood) + 11.0 * endo;
    let alb = mix(mix(vec3f(0.95, 0.3, 0.27), u.membrane.rgb, endo), vec3f(0.45, 0.03, 0.03), blood);
    let ext = sa + vec3f(ss);
    let stepT = exp(-ext * ds);
    let light = (0.7 + 0.9 * smoothstep(-1.0, 1.1, p.z)) * vec3f(1.0, 0.97, 0.95);
    Ls += Tr * alb * light * (vec3f(ss) / max(ext, vec3f(1e-4))) * (1.0 - stepT);
    Tr *= stepT;
  }

  let r0 = i.rest;
  let n1 = noise3(r0 * 3.1 + vec3f(1.7, 0.0, 0.0));
  let n2 = noise3(r0 * 6.3 + vec3f(0.0, 4.1, 0.0));
  let vessel = (1.0 - smoothstep(0.0, 0.022, abs(n1 - 0.5))) * smoothstep(-0.9, 0.4, r0.z) * 0.8;
  let twig = (1.0 - smoothstep(0.0, 0.014, abs(n2 - 0.5))) * 0.35 * smoothstep(-0.6, 0.6, r0.z);
  let gAV = 1.0 - smoothstep(0.0, 0.045, abs(r0.z - 0.36 - 0.07 * sin(atan2(r0.y, r0.x) * 2.0)));
  let gIV = (1.0 - smoothstep(0.0, 0.035, abs(r0.x - 0.06 - 0.16 * r0.z))) * step(0.0, r0.y) * (1.0 - smoothstep(0.2, 0.45, r0.z)) * smoothstep(-0.95, -0.6, r0.z);
  let fat = max(gAV, gIV);

  var body = bg * Tr + Ls;
  body = mix(body, body * vec3f(0.42, 0.16, 0.16), clamp(vessel * 0.75 + twig * 0.5, 0.0, 1.0));
  body = mix(body, u.rind.rgb * (0.55 + 0.45 * NdV), fat * 0.32);
  body += vec3f(0.55, 0.04, 0.04) * 0.22 * aV;

  let F = 0.035 + 0.965 * pow(1.0 - NdV, 5.0);
  let refl = env(reflect(-V, N));
  let NdH = max(dot(N, H), 0.0);
  let a2 = 0.006;
  let dd2 = NdH * NdH * (a2 - 1.0) + 1.0;
  let D = a2 / (3.14159265 * dd2 * dd2);
  let NdL = max(dot(N, Lk), 0.0);
  let Fh = 0.04 + 0.96 * pow(1.0 - max(dot(H, V), 0.0), 5.0);
  let spec = D * NdL * Fh * 0.35;
  let col = (1.0 - F) * body + F * refl + vec3f(spec);
  return vec4f(col, 1.0);
}
`

export const lineWGSL =
  common +
  /* wgsl */ `
@vertex fn vsLine(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return u.viewProj * vec4f(pos, 1.0);
}

@fragment fn fsLine() -> @location(0) vec4f {
  return vec4f(0.12, 0.07, 0.04, 0.5);
}
`

export const postWGSL =
  common +
  /* wgsl */ `
@group(0) @binding(1) var hdr: texture_2d<f32>;

fn neutral(c0: vec3f) -> vec3f {
  let start = 0.8 - 0.04;
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
  var c = textureLoad(hdr, vec2i(i.pos.xy), 0).rgb * u.params.x;
  c *= 1.0 - 0.16 * smoothstep(0.7, 1.7, length(i.ndc * vec2f(0.8, 1.0)));
  c = srgb(neutral(max(c, vec3f(0.0))));
  let dth = (hash3(vec3f(i.pos.xy, u.camPos.w * 60.0)) - 0.5) / 255.0;
  return vec4f(c + dth, 1.0);
}
`
