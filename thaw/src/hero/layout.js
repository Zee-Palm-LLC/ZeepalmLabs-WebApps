export const W = 1440
export const H = 974
export const TILE = W / 22
export const COL = W / 11

export function fitView(vw, vh) {
  const s = Math.min(vw / W, vh / H)
  return { s, ox: Math.max(0, (vw - W * s) / 2) }
}

export const HEAD = { x: 444.88, y: 90.43, w: 588.63, h: 883.79 }

export const L = {
  logo: { x: 33.26, y: 22.07, size: 24.6 },
  mark: { cx: 130.2, cy: 32.2 },
  links: { y: 27.22, size: 13.8, xs: [581.4, 678.6, 806.6] },
  begin: { r: 1407.2, y: 27.22, size: 13.8, ls: 0.0115 },
  clarity: { x: 41.2, y: 177.9, kern: [-0.0152, -0.0203, -0.0254, -0.0203, -0.0152, 0.0152, 0] },
  begins: { x: 903.6, y: 189.8, kern: [-0.0152, -0.005, -0.0357, -0.0304, -0.0172, 0], sx: [0, 0, 0, 0, 0, 0.93] },
  here: { x: 1035.6, y: 398.7 },
  head: { size: 168, ls: -0.045 },
  hi: { x: 133.5, y: 415.6 },
  week: { r: 392.0, y: 415.6 },
  stats: { x: 130.91, y: 456.2, w: 261.82, h: 138.1 },
  rows: { x: 148.05, r: 376.6, y: 473.6, gap: 23.89 },
  dots: { x: 150.1, y: 550.6, cols: 23, rows: 4, dx: 10.37, dy: 9.0 },
  cold: { x: 130.91, y: 650.6, w: 261.82, h: 153.5, band: 40.1, line: 724.3 },
  slash: { x: 148, y: 666.4 },
  coldLabel: { r: 376.6, y: 665.6 },
  pct: { x: 149.7, y: 704.8 },
  stress: { x: 148.16, y: 763.2, size: 21.6 },
  para: { x: 128.4, y: 851.4, size: 14.2, lh: 17.07, w: 262 },
  check: { x: 1047.27, y: 650.6, w: 261.82, h: 153.5 },
  checkTitle: { x: 1062.1, y: 666.5, size: 15.5 },
  next: { x: 1332.1, y: 651.9 },
  tonight: { x: 1331.2, y: 671.5, lh: 11.9 },
  btn: { x: 1047.27, y: 845.8, w: 261.82, h: 64.8, inset: 5.2 },
  btnText: { x: 1062.2, y: 869.9, size: 20.1 },
}
