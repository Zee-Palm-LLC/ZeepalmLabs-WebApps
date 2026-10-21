// GLSL shared by the scenes.
export const noiseGLSL = /* glsl */ `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }
`;

// Curved tile wall behind the hero. uMode blends tiles → diagonal stripes; uGridOnly → just the 6% grid.
export const wallVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vPos;
  void main(){ vUv = uv; vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
`;
export const wallFrag = /* glsl */ `
  uniform float uTime, uMode, uIntensity, uGridOnly, uOpacity;
  varying vec2 vUv;
  ${noiseGLSL}
  void main(){
    vec2 grid = vec2(64., 18.);
    vec2 g = vUv * grid; vec2 id = floor(g); vec2 f = fract(g);
    float edge = max(step(f.x, .035) + step(.965, f.x), step(f.y, .05) + step(.95, f.y));
    float t = uTime;
    // slowly drifting health palette: deep teal → aqua/mint → soft coral
    float field = fbm(id * .06 + vec2(t * .05, -t * .03));
    vec3 cA = vec3(.45, .62, .06), cB = vec3(.83, 1., .23), cC = vec3(1., .36, .14);
    float cyc = .5 + .5 * sin(t * .22 + vUv.x * 4.);
    vec3 hue = mix(mix(cA, cB, cyc), cC, smoothstep(.55, .9, field) * (.5 + .5 * sin(t * .17)));
    float lit = smoothstep(.45, .95, field) * .9 + step(.985, hash(id + floor(t * 1.7))) * .6;
    vec3 tile = hue * (.05 + lit * .55);
    // diagonal monochrome stripes (works reel look)
    float st = step(.5, fract((id.x * .9 + id.y * 1.3) / 9. - t * .05));
    vec3 stripe = vec3(mix(.03, .85, st)) * (.6 + .4 * hash(id));
    vec3 col = mix(tile, stripe, uMode);
    col += vec3(.75, .78, .7) * edge * .16;
    col = mix(col, vec3(edge * .06), uGridOnly);
    float vfade = smoothstep(0., .28, vUv.y) * smoothstep(1., .72, vUv.y);
    vec3 base = vec3(.043, .047, .05); // charcoal
    gl_FragColor = vec4(base + col * uIntensity * vfade, uOpacity);
  }
`;

// Project card: bent plane, RGB split by scroll velocity, edge vignette
export const cardVert = /* glsl */ `
  uniform float uBend; varying vec2 vUv;
  void main(){ vUv = uv; vec3 p = position; p.z -= uBend * (p.x * p.x); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }
`;
export const cardFrag = /* glsl */ `
  uniform sampler2D uTex; uniform float uShift, uOpacity, uDim, uTime;
  varying vec2 vUv;
  void main(){
    vec2 o = vec2(uShift * .02, 0.);
    float r = texture2D(uTex, vUv + o).r, g = texture2D(uTex, vUv).g, b = texture2D(uTex, vUv - o).b;
    vec3 col = vec3(r, g, b);
    float scan = .94 + .06 * sin(vUv.y * 900. + uTime * 4.);
    col *= scan * (1. - uDim) * 1.12;
    float v = smoothstep(0., .02, vUv.x) * smoothstep(1., .98, vUv.x) * smoothstep(0., .03, vUv.y) * smoothstep(1., .97, vUv.y);
    gl_FragColor = vec4(col, uOpacity * v);
  }
`;

// Flowing thin-film colours for the vision slab
export const iriFrag = /* glsl */ `
  uniform float uTime, uOpacity; varying vec2 vUv;
  ${noiseGLSL}
  void main(){
    // liquid-metal thin film: long vertical flow lines, teal/copper/violet with dark troughs
    vec2 p = vUv * vec2(1.2, 2.6);
    vec2 q = vec2(fbm(p + vec2(0., uTime * .06)), fbm(p * 1.3 + vec2(5.2, -uTime * .05)));
    float n = fbm(p * vec2(1.5, .6) + q * 1.8 + vec2(uTime * .03, 0.));
    float b = fract(n * 2.4 + vUv.x * .6 + uTime * .02);
    vec3 teal = vec3(.83, 1., .23), copper = vec3(1., .36, .14), violet = vec3(1., .62, .2), pearl = vec3(.96, .97, .93), ink = vec3(.04, .045, .05);
    vec3 col = mix(teal, copper, smoothstep(.15, .4, b));
    col = mix(col, violet, smoothstep(.45, .65, b));
    col = mix(col, pearl, smoothstep(.72, .85, b) * .8);
    col = mix(col, teal, smoothstep(.9, 1., b));
    col = mix(col, ink, smoothstep(.55, .85, fbm(p * 2.2 - q)) * .6);
    float sheen = pow(max(0., sin((n + vUv.x * .3) * 18.)), 14.);
    col += sheen * vec3(.9, .95, 1.) * .45;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

// "SERVICE" panel: barrel/fisheye warp + chromatic split + wobble
export const warpFrag = /* glsl */ `
  uniform sampler2D uTex; uniform float uTime, uWarp, uSplit, uOpacity; varying vec2 vUv;
  vec2 barrel(vec2 uv, float k){ vec2 c = uv - .5; float r2 = dot(c, c); return .5 + c * (1. + k * r2) ; }
  void main(){
    vec2 uv = vUv; uv.y += sin(uv.x * 6. + uTime * 1.3) * .012 * uWarp;
    float k = -.65 * uWarp;
    vec2 ur = barrel(uv + vec2(uSplit * .012, 0.), k), ug = barrel(uv, k * 1.04), ub = barrel(uv - vec2(uSplit * .012, 0.), k * 1.08);
    float r = texture2D(uTex, ur).r, g = texture2D(uTex, ug).g, b = texture2D(uTex, ub).b;
    vec3 col = vec3(r, g, b);
    float edge = smoothstep(.0, .06, min(min(ug.x, 1. - ug.x), min(ug.y, 1. - ug.y)));
    gl_FragColor = vec4(col * edge, uOpacity);
  }
`;

// Service visual card with a motion "push" and glitch slices during transitions
export const svcFrag = /* glsl */ `
  uniform sampler2D uTex, uTex2; uniform float uTime, uMix, uGlitch, uOpacity; varying vec2 vUv;
  ${noiseGLSL}
  void main(){
    vec2 uv = vUv; vec2 c = uv - .5;
    float zoom = 1. - .035 * (.5 + .5 * sin(uTime * .35));
    uv = .5 + c * zoom;
    float slice = step(.7, hash(vec2(floor(uv.y * 24.), floor(uTime * 12.)))) * uGlitch;
    uv.x += slice * (hash(vec2(floor(uv.y * 24.), 3.)) - .5) * .25;
    vec3 a = texture2D(uTex, uv).rgb, b = texture2D(uTex2, uv).rgb;
    vec3 col = mix(a, b, uMix);
    col.r = mix(col.r, texture2D(uTex, uv + vec2(.015 * uGlitch, 0.)).r, uGlitch);
    gl_FragColor = vec4(col, uOpacity);
  }
`;
