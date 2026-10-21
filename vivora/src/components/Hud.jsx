import { useEffect, useRef } from 'react';
import { useStore, store } from '../lib/store.js';
import { NEWS } from '../data/content.js';

// lil-gui–style material panel (bottom left of the hero). Values drive the WebGL wordmark/prism live.
export function MaterialGui() {
  const m = useStore((s) => s.material);
  const set = (patch) => store.set({ material: { ...m, ...patch } });
  return (
    <div className="hud gui">
      <div className="title">Dumbbell Material</div>
      <label className="row"><span>roughness</span><input type="range" min="0" max="1" step="0.01" value={m.roughness} onChange={(e) => set({ roughness: +e.target.value })} /><span className="val">{m.roughness.toFixed(2)}</span></label>
      <label className="row"><span>noiseScale</span><input type="range" min="0" max="20" step="0.1" value={m.noiseScale} onChange={(e) => set({ noiseScale: +e.target.value })} /><span className="val">{m.noiseScale.toFixed(1)}</span></label>
      <label className="row"><span>color</span>
        <span className="color"><input className="swatch" type="color" value={m.color} onChange={(e) => set({ color: e.target.value })} /><span>{`{r: ${parseInt(m.color.slice(1, 3), 16)}, g: ${parseInt(m.color.slice(3, 5), 16)}, b:`}</span></span>
        <span className="val">{parseInt(m.color.slice(5, 7), 16)}</span>
      </label>
    </div>
  );
}

// Orientation gizmo: shows the prism's quaternion as rotating axes; drag to rotate, button to reset.
export function QuaternionPanel() {
  const canvas = useRef(null);
  const drag = useRef(null);
  useEffect(() => {
    const c = canvas.current; const ctx = c.getContext('2d'); let raf;
    const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = 88 * dpr; c.height = 88 * dpr; ctx.scale(dpr, dpr);
    const rot = (q, v) => { const [x, y, z, w] = q; const [vx, vy, vz] = v;
      const ix = w * vx + y * vz - z * vy, iy = w * vy + z * vx - x * vz, iz = w * vz + x * vy - y * vx, iw = -x * vx - y * vy - z * vz;
      return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x]; };
    const draw = () => {
      const q = store.get().quat; ctx.clearRect(0, 0, 88, 88);
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(44, 44, 40, 0, Math.PI * 2); ctx.stroke();
      const axes = [[[1, 0, 0], '#ff3b4e', 'X'], [[0, 1, 0], '#3bd16f', 'Y'], [[0, 0, 1], '#3a7bff', 'Z']]
        .map(([v, col, l]) => ({ p: rot(q, v), col, l })).sort((a, b) => a.p[2] - b.p[2]);
      for (const { p, col } of axes) {
        const x = 44 + p[0] * 28, y = 44 - p[1] * 28; const xn = 44 - p[0] * 28, yn = 44 + p[1] * 28;
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(xn, yn); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = 'rgba(200,200,200,.9)'; ctx.beginPath(); ctx.arc(xn, yn, 4.5, 0, 7); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 7); ctx.fill();
      }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(44, 44, 2.5, 0, 7); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  const onDown = (e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if (!drag.current) return; const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y; drag.current = { x: e.clientX, y: e.clientY }; window.dispatchEvent(new CustomEvent('prism-drag', { detail: { dx, dy } })); };
  const onUp = () => { drag.current = null; };
  const q = useStore((s) => s.quat);
  return (
    <div className="hud quat">
      <div className="qtitle">MainLogo Quaternion</div>
      <div className="qvals"><span className="dot" />{q.map((v, i) => <span key={i}>{v.toFixed(2)}</span>)}</div>
      <canvas ref={canvas} className="gizmo" style={{ width: 88, height: 88 }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />
      <button className="reset" onClick={() => store.set({ resetQuat: store.get().resetQuat + 1 })}>Reset Quaternion</button>
    </div>
  );
}

// Live vitals card (demo data): beating BPM, SpO₂, HRV and a scrolling ECG trace.
const ECG = (t) => { // one heartbeat ≈ 1 unit: P wave, QRS spike, T wave
  const x = t % 1;
  return 0.08 * Math.exp(-((x - 0.18) ** 2) / 0.0012) - 0.12 * Math.exp(-((x - 0.36) ** 2) / 0.00012)
    + 1.0 * Math.exp(-((x - 0.4) ** 2) / 0.00018) - 0.28 * Math.exp(-((x - 0.44) ** 2) / 0.00015) + 0.2 * Math.exp(-((x - 0.68) ** 2) / 0.004);
};
export { ECG };

export function VitalsPanel() {
  const canvas = useRef(null); const bpmEl = useRef(null); const heart = useRef(null); const kcalEl = useRef(null); const zoneEl = useRef(null);
  useEffect(() => {
    const c = canvas.current; const g = c.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 170, H = 46; c.width = W * dpr; c.height = H * dpr; g.scale(dpr, dpr);
    let raf; const t0 = performance.now(); let lastBeat = 0;
    const draw = (now) => {
      const t = (now - t0) / 1000; const bpm = 152 + Math.sin(t * 0.23) * 6; const beat = t * (bpm / 60);
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(212,255,58,.12)'; g.lineWidth = 1;
      for (let x = 0; x <= W; x += 17) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      const grad = g.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, 'rgba(212,255,58,0)'); grad.addColorStop(0.8, 'rgba(212,255,58,.95)'); grad.addColorStop(1, '#ffffff');
      g.strokeStyle = grad; g.lineWidth = 1.6; g.beginPath();
      for (let x = 0; x <= W; x++) { const y = H * 0.62 - ECG(beat - (W - x) / 70) * H * 0.5; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(W - 1.5, H * 0.62 - ECG(beat) * H * 0.5, 2.2, 0, 7); g.fill();
      if (Math.floor(beat) !== lastBeat) { lastBeat = Math.floor(beat); heart.current?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' }); }
      if (bpmEl.current) bpmEl.current.textContent = String(Math.round(bpm));
      if (kcalEl.current) kcalEl.current.textContent = String(Math.round(412 + t * 0.21));
      if (zoneEl.current) { const z = bpm > 156 ? 4 : 3; zoneEl.current.dataset.z = z; zoneEl.current.querySelector('em').textContent = z === 4 ? 'Z4 · THRESHOLD' : 'Z3 · TEMPO'; }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="hud vitals">
      <div className="vt-head"><span className="live" />LIVE WORKOUT <span className="demo">demo</span></div>
      <div className="vt-bpm">
        <svg ref={heart} viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.6C19.5 16.4 12 21 12 21Z" fill="#ff5b24" /></svg>
        <b ref={bpmEl}>72</b><span>bpm</span>
      </div>
      <div className="vt-zone" ref={zoneEl} data-z="4"><i /><i /><i /><i /><i /><em>Z4 · THRESHOLD</em></div>
      <canvas ref={canvas} style={{ width: 170, height: 46 }} />
      <div className="vt-row"><span>KCAL</span><b ref={kcalEl}>412</b><span>PACE</span><b>4:52</b></div>
      <div className="vt-foot">drag the dumbbell to spin it</div>
    </div>
  );
}

export function NewsList() {
  return (
    <div className="hud news">
      <h4>NEWS</h4>
      <ul>
        {NEWS.map((n) => (
          <li key={n.date}><a href="#news"><div className="d">{n.date}</div><div className="t">{n.title}</div></a></li>
        ))}
      </ul>
    </div>
  );
}
