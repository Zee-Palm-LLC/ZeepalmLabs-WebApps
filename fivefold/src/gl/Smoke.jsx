import { useEffect, useRef } from 'react'
import { reducedMotion } from '../lib/scroll'
import { live } from './mood'

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec4 uA;uniform vec4 uB;uniform vec2 uMouse;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n(p);p=r*p*2.03+11.7;a*=.48;}return v/.94;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2(uv.x*asp,uv.y)*.82;
  float t=uTime*.04;
  vec2 m=(uMouse-.5)*.18;
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t*.8));
  vec2 r=vec2(fbm(p+2.2*q+vec2(1.7,9.2)+t*1.3+m),fbm(p+2.2*q+vec2(8.3,2.8)-t*1.1));
  float f=fbm(p+2.0*r);
  vec2 g=vec2((uv.x-uA.x)*asp,uv.y-uA.y);
  float glow=exp(-dot(g,g)/(uA.z*uA.z*.55));
  float smoke=smoothstep(.2,.95,f*.68+length(q)*.3+r.x*.16);
  float i=(.22+glow*.95)*(.45+.85*smoke)*uA.w;
  i*=mix(1.,.55,uB.y*(1.-glow));
  vec3 deep=vec3(.075,.008,.004);
  vec3 dark=vec3(.29,.035,.016);
  vec3 mid=vec3(.66,.12,.035);
  vec3 hot=vec3(.93,.29,.075);
  vec3 flare=vec3(1.,.55,.2);
  vec3 col=mix(deep,dark,smoothstep(.02,.35,i));
  col=mix(col,mid,smoothstep(.3,.75,i));
  col=mix(col,mix(mid,hot,uB.x),smoothstep(.65,1.1,i));
  col=mix(col,flare,smoothstep(1.1,1.65,i)*uB.x*.8);
  float v=smoothstep(1.25,.25,length((uv-.5)*vec2(asp*.62,1.)));
  col*=mix(.55,1.,v);
  col+=(h(uv*uRes+fract(uTime))-.5)*.018;
  col*=uB.z;
  gl_FragColor=vec4(col,1.);
}`

export default function Smoke() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' })
    if (!gl) {
      canvas.classList.add('smoke--fallback')
      return
    }
    const sh = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      a: gl.getUniformLocation(prog, 'uA'),
      b: gl.getUniformLocation(prog, 'uB'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
    }

    const scale = 0.5
    const resize = () => {
      const w = Math.max(2, Math.round(window.innerWidth * scale))
      const hgt = Math.max(2, Math.round(window.innerHeight * scale))
      canvas.width = w
      canvas.height = hgt
      gl.viewport(0, 0, w, hgt)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      live.tmouse = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight]
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const still = reducedMotion()
    let t = 8
    let last = performance.now()
    let raf = 0
    let visible = true
    const onVis = () => {
      visible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVis)

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible) return
      if (!still) t += dt
      const k = 1 - Math.exp(-dt * 1.6)
      for (let i = 0; i < 6; i++) live.mood[i] += (live.target[i] - live.mood[i]) * k
      const km = 1 - Math.exp(-dt * 2.5)
      live.mouse[0] += (live.tmouse[0] - live.mouse[0]) * km
      live.mouse[1] += (live.tmouse[1] - live.mouse[1]) * km
      const m = live.mood
      gl.uniform2f(U.res, canvas.width, canvas.height)
      gl.uniform1f(U.time, t)
      gl.uniform4f(U.a, m[0], m[1], m[2], m[3])
      gl.uniform4f(U.b, m[4], m[5], live.intro, 0)
      gl.uniform2f(U.mouse, live.mouse[0], live.mouse[1])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="smoke" aria-hidden="true" />
}
