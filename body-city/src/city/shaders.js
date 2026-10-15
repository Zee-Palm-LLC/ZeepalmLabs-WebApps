import { GRID, DIST } from './body.js'

const header = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  invViewProj: mat4x4f,
  lightViewProj: mat4x4f,
  view: mat4x4f,
  camPos: vec4f,
  sunDir: vec4f,
  sunCol: vec4f,
  ambSky: vec4f,
  ambGround: vec4f,
  fogCol: vec4f,
  params: vec4f,
  params2: vec4f,
  screen: vec4f,
  focus: vec4f,
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
  return mix(mix(hash2(i), hash2(i + vec2f(1.0, 0.0)), w.x), mix(hash2(i + vec2f(0.0, 1.0)), hash2(i + vec2f(1.0, 1.0)), w.x), w.y);
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

const shade = /* wgsl */ `
@group(0) @binding(1) var shadowTex: texture_depth_2d;
@group(0) @binding(2) var shadowCmp: sampler_comparison;
@group(0) @binding(3) var skinTex: texture_2d<f32>;
@group(0) @binding(4) var skinSamp: sampler;

fn shadowVis(p: vec3f, n: vec3f) -> f32 {
  let lp = u.lightViewProj * vec4f(p + n * 0.02, 1.0);
  let nd = lp.xyz / lp.w;
  let uv = nd.xy * vec2f(0.5, -0.5) + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || nd.z > 1.0) { return 1.0; }
  let texel = 1.0 / f32(textureDimensions(shadowTex).x);
  var vis = 0.0;
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      vis += textureSampleCompareLevel(shadowTex, shadowCmp, uv + vec2f(f32(x), f32(y)) * texel * 1.5, nd.z - 0.0012);
    }
  }
  return vis / 9.0;
}

fn skyEnv(d: vec3f) -> vec3f {
  let night = u.params.x;
  let day = mix(vec3f(0.98, 0.86, 0.72), vec3f(0.55, 0.72, 0.95), smoothstep(-0.1, 0.8, d.y));
  let nt = mix(vec3f(0.08, 0.08, 0.18), vec3f(0.02, 0.03, 0.09), smoothstep(-0.1, 0.8, d.y));
  return mix(day, nt, night);
}

fn lit(p: vec3f, n: vec3f, alb: vec3f, wrap: f32) -> vec3f {
  let L = normalize(u.sunDir.xyz);
  let sh = shadowVis(p, n);
  let nd = max((dot(n, L) + wrap) / (1.0 + wrap), 0.0);
  let sun = u.sunCol.rgb * u.sunDir.w * nd * mix(1.0, sh, u.sunCol.w);
  let hemi = mix(u.ambGround.rgb, u.ambSky.rgb, n.y * 0.5 + 0.5);
  return alb * (sun + hemi);
}

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
  @location(4) inst: vec4f,
  @location(5) lpos: vec3f,
};

fn jdisp(p: vec3f) -> f32 {
  let t = u.camPos.w;
  var d = sin(t * 1.7 + p.z * 0.45 + p.x * 0.2) * 0.012;
  let pulse = pow(max(0.0, sin(u.params.w * 6.2831)), 6.0);
  let hd = p.xz - vec2f(${DIST.heart.x.toFixed(3)}, ${DIST.heart.z.toFixed(3)});
  d += pulse * 0.06 * exp(-dot(hd, hd) * 0.3);
  let tp = u.params2;
  if (tp.z > 0.0 && tp.z < 4.0) {
    let r = length(p.xz - tp.xy);
    let front = tp.z * 6.5;
    d += tp.w * sin(r * 3.2 - tp.z * 11.0) * exp(-tp.z * 1.5) * exp(-r * 0.16) * smoothstep(front + 0.6, front - 1.6, r);
  }
  return d;
}

fn sway(p: vec3f, ex: vec4f) -> vec3f {
  if (abs(ex.x - 3.0) > 0.5) { return p; }
  let t = u.camPos.w;
  return p + vec3f(sin(t * 1.4 + ex.w + p.x), 0.0, cos(t * 1.1 + ex.w + p.z)) * ex.z;
}

fn windows(p: vec3f, n: vec3f, base: vec3f, k: f32) -> vec3f {
  if (abs(n.y) > 0.5) { return vec3f(0.0); }
  let horiz = select(p.z, p.x, abs(n.z) > abs(n.x));
  let gx = horiz * 16.0;
  let gy = (p.y - 0.02) * 14.0;
  let cell = vec2f(floor(gx), floor(gy));
  let f = fract(vec2f(gx, gy));
  let inside = step(0.22, f.x) * step(f.x, 0.78) * step(0.25, f.y) * step(f.y, 0.75);
  if (inside < 0.5 || gy < 0.6) { return vec3f(-1.0); }
  let on = step(0.35, hash3(vec3f(cell, floor(p.x * 3.0 + p.z * 5.0))));
  let night = u.params.x;
  let warm = vec3f(1.0, 0.72, 0.38) * (1.6 + k) * on * night;
  return warm + vec3f(0.001);
}

fn shadeAll(i: VO, front: bool) -> vec4f {
  let suv = (i.wpos.xz - vec2f(${GRID.x0.toFixed(4)}, ${GRID.z0.toFixed(4)})) / vec2f(${(GRID.x1 - GRID.x0).toFixed(4)}, ${(GRID.z1 - GRID.z0).toFixed(4)});
  let skin = textureSample(skinTex, skinSamp, suv);
  let vdir = normalize(u.camPos.xyz - i.wpos);
  let par = (vdir.xz / max(vdir.y, 0.35)) * 0.2;
  let deepS = textureSampleBias(skinTex, skinSamp, suv - par / vec2f(${(GRID.x1 - GRID.x0).toFixed(4)}, ${(GRID.z1 - GRID.z0).toFixed(4)}), 2.2);
  var n = normalize(i.nrm);
  if (!front) { n = -n; }
  let p = i.wpos;
  let mat = i.ex.x;
  var alb = i.col;
  var em = vec3f(0.0);
  var wrap = 0.12;
  let V = normalize(u.camPos.xyz - p);
  let t = u.camPos.w;
  let night = u.params.x;
  var skinSpec = 0.0;
  var jelly = 0.0;
  if (abs(mat - 1.0) < 0.5) {
    let jel = smoothstep(0.25, 0.55, skin.a);
    jelly = jel;
    let thick = clamp(p.y / 1.25, 0.0, 1.0);
    let tint = vec3f(1.0, 0.44, 0.38);
    let layered = mix(deepS.rgb, skin.rgb, 0.42 + 0.3 * smoothstep(0.75, 0.98, skin.a));
    let base = mix(skin.rgb, layered, jel) * mix(i.col, vec3f(1.0), jel * 0.5);
    let organ = 1.0 - smoothstep(0.75, 0.95, skin.a);
    let deep = base * mix(vec3f(1.0), tint, 0.25 + 0.3 * thick + organ * 0.15);
    alb = mix(base, deep * 0.92, jel);
    let q = p.xz * 34.0;
    let n0 = noise2(q);
    let dn = vec2f(noise2(q + vec2f(0.5, 0.0)) - n0, noise2(q + vec2f(0.0, 0.5)) - n0);
    n = normalize(n - vec3f(dn.x, 0.0, dn.y) * 0.035 * jel);
    wrap = mix(0.12, 0.85, jel);
    let L = normalize(u.sunDir.xyz);
    let nl = dot(n, L);
    let edge = 1.0 - thick;
    let sss = smoothstep(-0.6, 0.3, nl);
    em = base * tint * jel * (0.12 + 0.75 * edge * edge * edge) * sss * u.sunDir.w * 0.55;
    em += base * vec3f(1.0, 0.45, 0.4) * jel * (0.08 + 0.1 * organ) * (1.0 - night * 0.5);
    let F = 0.03 + 0.97 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    let R = reflect(-V, n);
    em += skyEnv(R) * F * jel * 0.9;
    let sb1 = pow(max(dot(R, normalize(vec3f(-0.45, 0.8, -0.4))), 0.0), 70.0) * 1.5;
    let sb2 = pow(max(dot(R, normalize(vec3f(0.5, 0.75, -0.45))), 0.0), 50.0) * 0.55;
    let sb3 = pow(max(dot(R, normalize(vec3f(0.0, 0.62, 0.78))), 0.0), 40.0) * 0.35;
    em += vec3f(1.0, 0.97, 0.95) * (sb1 + sb2 + sb3) * jel * (1.0 - night * 0.55);
    em += base * vec3f(1.0, 0.75, 0.7) * pow(max(dot(R, normalize(vec3f(-0.3, 0.85, -0.3))), 0.0), 6.0) * 0.18 * jel;
    let sp = hash2(floor(p.xz * 46.0));
    let tw = 0.5 + 0.5 * sin(u.camPos.w * 2.0 + sp * 40.0);
    em += vec3f(1.0, 0.92, 0.9) * step(0.9965, sp) * jel * tw * 0.35 * (0.4 + thick);
    skinSpec = jel;
  } else if (abs(mat - 2.0) < 0.5) {
    em = i.col * i.ex.y * (0.5 + night * 0.9);
  } else if (abs(mat - 3.0) < 0.5) {
    wrap = 0.35;
  } else if (abs(mat - 4.0) < 0.5) {
    let side = i.col.x;
    let s = i.col.y;
    let w = i.col.z;
    let lane = abs(side);
    let outb = step(0.0, side);
    let asphalt = mix(vec3f(0.09, 0.12, 0.34), vec3f(0.4, 0.05, 0.07), outb);
    let center = 1.0 - smoothstep(0.03, 0.07, lane);
    let dash = step(0.5, fract(s * 3.0));
    let edge = smoothstep(0.82, 0.92, lane);
    let edgeCol = mix(vec3f(0.35, 0.55, 1.0), vec3f(1.0, 0.3, 0.3), outb);
    let jam = u.params.z;
    let ec = mix(edgeCol, vec3f(1.0, 0.55, 0.08), jam * 0.85);
    alb = asphalt + vec3f(0.9) * center * dash * 0.85 + ec * edge * 0.5;
    let flow = pow(0.5 + 0.5 * sin(s * 5.0 - t * 5.0 * mix(-1.0, 1.0, outb)), 8.0);
    em = ec * edge * (0.25 + night * 1.2 + jam * (0.5 + flow * 1.5));
    let spec = pow(max(dot(n, normalize(normalize(u.sunDir.xyz) + V)), 0.0), 60.0) * 0.4;
    em += u.sunCol.rgb * spec * (1.0 - night);
    void_dummy(w);
  } else if (abs(mat - 5.0) < 0.5) {
    let q = p.xz * 6.0;
    let w1 = noise2(q + vec2f(t * 0.6, t * 0.3));
    let w2 = noise2(q * 1.7 - vec2f(t * 0.4, -t * 0.5));
    let nn = normalize(vec3f((w1 - 0.5) * 0.3, 1.0, (w2 - 0.5) * 0.3));
    let r = reflect(-V, nn);
    let F = 0.05 + 0.95 * pow(1.0 - max(dot(nn, V), 0.0), 4.0);
    let deep = i.col * 0.45;
    let c = mix(deep, skyEnv(r), clamp(F + 0.15, 0.0, 1.0)) + pow(max(dot(r, normalize(u.sunDir.xyz)), 0.0), 80.0) * u.sunCol.rgb * 2.0 * (1.0 - night);
    return vec4f(c, 1.0);
  } else if (abs(mat - 6.0) < 0.5) {
    let F = 0.06 + 0.94 * pow(1.0 - max(dot(n, V), 0.0), 3.0);
    let base2 = lit(p, n, i.col * 0.55, 0.4);
    let c = mix(base2, skyEnv(reflect(-V, n)) * 1.1, F * 0.6) + i.col * (0.08 + night * 0.7);
    let spec = pow(max(dot(n, normalize(normalize(u.sunDir.xyz) + V)), 0.0), 90.0) * 1.2 * (1.0 - night);
    return vec4f(c + u.sunCol.rgb * spec, 1.0);
  } else if (abs(mat - 7.0) < 0.5) {
    let r = length(p.xz - vec2f(0.0, 0.5));
    let inside = suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0;
    alb = select(i.col, skin.rgb, inside) * (1.0 - smoothstep(12.0, 38.0, r) * 0.12);
    let shT = shadowVis(p, n);
    em = alb * vec3f(0.95, 0.42, 0.38) * (1.0 - shT) * u.sunDir.w * 0.2 * (1.0 - night);
  } else if (abs(mat - 8.0) < 0.5) {
    let w = windows(p, n, i.col, i.ex.y);
    if (w.x >= 0.0) {
      alb = mix(vec3f(0.3, 0.38, 0.48), vec3f(0.12, 0.13, 0.18), night);
      em = w;
    }
  } else if (abs(mat - 9.0) < 0.5) {
    let k = 0.35 + u.params.y * 2.6 * (0.75 + 0.25 * sin(t * 6.0 + p.x * 3.0));
    em = vec3f(0.3, 1.0, 0.9) * k;
  } else if (abs(mat - 10.0) < 0.5) {
    em = vec3f(1.0, 0.82, 0.5) * (0.2 + night * 4.0);
  } else if (abs(mat - 11.0) < 0.5) {
    alb = i.inst.rgb;
  } else if (abs(mat - 12.0) < 0.5) {
    let fl = step(0.5, fract(t * 3.0 + i.inst.a * 7.0));
    alb = i.inst.rgb * 0.5;
    em = i.inst.rgb * (0.4 + fl * 3.0);
  }
  let c = lit(p, n, alb, wrap) + em;
  let hv = max(dot(n, normalize(normalize(u.sunDir.xyz) + V)), 0.0);
  let spec = (pow(hv, 40.0) * 0.08 * (1.0 - jelly) + (pow(hv, 160.0) * 2.6 + pow(hv, 28.0) * 0.22) * skinSpec) * (1.0 - night * 0.6);
  return vec4f(c + u.sunCol.rgb * spec * shadowVis(p, n), 1.0);
}

fn void_dummy(x: f32) {}
`

export const sceneWGSL =
  header +
  shade +
  /* wgsl */ `
@vertex fn vsEnv(i: VIn) -> VO {
  var o: VO;
  let p0 = sway(i.pos, i.ex);
  var p = p0;
  var nn = i.nrm;
  if (abs(i.ex.x - 7.0) > 0.5) {
    let k = clamp(p0.y * 1.2, 0.0, 1.0);
    p.y += jdisp(p0) * k;
    if (abs(i.ex.x - 1.0) < 0.5) {
      let e = 0.08;
      let gx = (jdisp(p0 + vec3f(e, 0.0, 0.0)) - jdisp(p0 - vec3f(e, 0.0, 0.0))) / (2.0 * e) * k;
      let gz = (jdisp(p0 + vec3f(0.0, 0.0, e)) - jdisp(p0 - vec3f(0.0, 0.0, e))) / (2.0 * e) * k;
      nn = normalize(nn + vec3f(-gx, 0.0, -gz));
    }
  }
  o.clip = u.viewProj * vec4f(p, 1.0);
  o.wpos = p;
  o.nrm = nn;
  o.col = i.col;
  o.ex = i.ex;
  o.inst = vec4f(1.0);
  o.lpos = i.pos;
  return o;
}

struct IIn {
  @location(0) pos: vec3f,
  @location(1) nrm: vec3f,
  @location(2) col: vec3f,
  @location(3) ex: vec4f,
  @location(4) m0: vec4f,
  @location(5) m1: vec4f,
  @location(6) m2: vec4f,
  @location(7) tint: vec4f,
};

@vertex fn vsInst(i: IIn) -> VO {
  var o: VO;
  var wp = i.m0.xyz * i.pos.x + i.m1.xyz * i.pos.y + i.m2.xyz * i.pos.z + vec3f(i.m0.w, i.m1.w, i.m2.w);
  let wn = normalize(i.m0.xyz * i.nrm.x / max(dot(i.m0.xyz, i.m0.xyz), 1e-6) + i.m1.xyz * i.nrm.y / max(dot(i.m1.xyz, i.m1.xyz), 1e-6) + i.m2.xyz * i.nrm.z / max(dot(i.m2.xyz, i.m2.xyz), 1e-6));
  let base = vec3f(i.m0.w, i.m1.w, i.m2.w);
  wp.y += jdisp(base) * clamp(base.y * 1.2, 0.0, 1.0);
  o.clip = u.viewProj * vec4f(wp, 1.0);
  o.wpos = wp;
  o.nrm = wn;
  o.col = i.col;
  o.ex = i.ex;
  o.inst = i.tint;
  o.lpos = i.pos;
  return o;
}

@fragment fn fsScene(i: VO, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  return shadeAll(i, ff);
}

@fragment fn fsBack(i: FS) -> @location(0) vec4f {
  let a = u.invViewProj * vec4f(i.ndc, 0.0, 1.0);
  let b = u.invViewProj * vec4f(i.ndc, 1.0, 1.0);
  let d = normalize(b.xyz / b.w - a.xyz / a.w);
  return vec4f(skyEnv(d) * 0.9, 1.0);
}
`

export const shadowWGSL =
  header +
  /* wgsl */ `
@vertex fn vsShadow(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return u.lightViewProj * vec4f(pos, 1.0);
}

@vertex fn vsShadowInst(@location(0) pos: vec3f, @location(4) m0: vec4f, @location(5) m1: vec4f, @location(6) m2: vec4f) -> @builtin(position) vec4f {
  let wp = m0.xyz * pos.x + m1.xyz * pos.y + m2.xyz * pos.z + vec3f(m0.w, m1.w, m2.w);
  return u.lightViewProj * vec4f(wp, 1.0);
}
`

export const glowWGSL =
  header +
  /* wgsl */ `
struct GO {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
  @location(1) col: vec4f,
};

@vertex fn vsGlow(@builtin(vertex_index) vi: u32, @location(0) a: vec4f, @location(1) b: vec4f) -> GO {
  var corners = array<vec2f, 4>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(1.0, 1.0));
  let q = corners[vi];
  let right = vec3f(u.view[0].x, u.view[1].x, u.view[2].x);
  let up = vec3f(u.view[0].y, u.view[1].y, u.view[2].y);
  let wp = a.xyz + (right * q.x + up * q.y) * a.w;
  var o: GO;
  o.clip = u.viewProj * vec4f(wp, 1.0);
  o.uv = q;
  o.col = b;
  return o;
}

@fragment fn fsGlow(i: GO) -> @location(0) vec4f {
  let r = length(i.uv);
  if (r > 1.0) { discard; }
  let core = exp(-r * r * 8.0);
  let halo = (1.0 - r) * (1.0 - r) * 0.3;
  return vec4f(i.col.rgb * (core + halo) * i.col.a, 0.0);
}
`

export const postWGSL =
  header +
  /* wgsl */ `
@group(0) @binding(1) var hdr: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

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
  let uv = i.pos.xy * u.screen.zw;
  let fy = u.focus.x;
  let band = u.focus.y;
  let amt = smoothstep(band, band + 0.32, abs(uv.y - fy)) * u.focus.z;
  var c = vec3f(0.0);
  var wsum = 0.0;
  let rad = amt * 11.0 * u.screen.w * u.screen.y / 900.0;
  for (var k = 0; k < 24; k++) {
    let a = f32(k) * 2.39996;
    let r = sqrt((f32(k) + 0.5) / 24.0);
    let o = vec2f(cos(a), sin(a)) * r * rad * vec2f(u.screen.y / u.screen.x, 1.0);
    c += textureSampleLevel(hdr, samp, uv + o, 0.0).rgb;
    wsum += 1.0;
  }
  c = c / wsum;
  c *= u.ambGround.w;
  let l = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  c = mix(vec3f(l), c, u.focus.w);
  c *= 1.0 - 0.2 * smoothstep(0.6, 1.55, length(i.ndc * vec2f(0.85, 1.0)));
  c = srgb(neutral(max(c, vec3f(0.0))));
  let dth = (hash3(vec3f(i.pos.xy, u.camPos.w * 60.0)) - 0.5) / 255.0;
  return vec4f(c + dth, 1.0);
}
`
