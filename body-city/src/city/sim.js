import { ROADS, routeTo, DEST_NODE, pointOn } from './body.js'

export const FOODS = [
  { id: 'salad', name: 'Salad', emoji: '🥗', carb: 10, prot: 4, fat: 6, fibre: 4, speed: 0.35 },
  { id: 'eggs', name: 'Eggs', emoji: '🍳', carb: 1, prot: 13, fat: 10, fibre: 0, speed: 0.5 },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', carb: 0, prot: 25, fat: 12, fibre: 0, speed: 0.45 },
  { id: 'oats', name: 'Oats', emoji: '🥣', carb: 28, prot: 6, fat: 3, fibre: 4, speed: 0.45 },
  { id: 'banana', name: 'Banana', emoji: '🍌', carb: 27, prot: 1, fat: 0, fibre: 3, speed: 0.8 },
  { id: 'rice', name: 'White rice', emoji: '🍚', carb: 45, prot: 4, fat: 0, fibre: 1, speed: 1.0 },
  { id: 'donut', name: 'Doughnut', emoji: '🍩', carb: 30, prot: 3, fat: 14, fibre: 1, speed: 1.4 },
  { id: 'soda', name: 'Soda', emoji: '🥤', carb: 39, prot: 0, fat: 0, fibre: 0, speed: 2.4 },
]
export const FOOD = Object.fromEntries(FOODS.map((f) => [f.id, f]))

export const CARGO = {
  oxygen: { name: 'Oxygen', color: [0.92, 0.12, 0.14], kind: 'pod' },
  glucose: { name: 'Glucose', color: [1.0, 0.76, 0.12], kind: 'truck' },
  protein: { name: 'Protein', color: [0.98, 0.45, 0.62], kind: 'truck' },
  fat: { name: 'Fat', color: [1.0, 0.92, 0.45], kind: 'truck' },
  water: { name: 'Water', color: [0.3, 0.78, 1.0], kind: 'truck' },
  insulin: { name: 'Insulin', color: [0.25, 0.45, 1.0], kind: 'van' },
  repair: { name: 'Repair crew', color: [1.0, 0.55, 0.12], kind: 'van' },
  clean: { name: 'Brain clean-up', color: [0.95, 0.96, 1.0], kind: 'van' },
}

const ROUTES = {}
for (const [d, nodes] of Object.entries(DEST_NODE)) ROUTES[d] = nodes.map((n) => routeTo(n))

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const PINCH = new Set(ROADS.filter((r) => r.a === 't2').map((r) => r.id))

export default class BodySim {
  constructor() {
    this.listeners = new Set()
    this.reset()
  }

  reset() {
    this.s = {
      minute: 7 * 60 + 30,
      day: 1,
      glucose: 0.42,
      glycogen: 0.55,
      fat: 0.38,
      protein: 0.3,
      muscle: 0.35,
      hydration: 0.72,
      sleepDebt: 0.35,
      insulin: 0.05,
      hr: 66,
      focus: 0.7,
      mode: 'rest',
      modeLeft: 0,
      exercise: 0,
      night: 0,
      lipids: 0.1,
      digesting: 0,
      jam: 0,
      waterBoost: 0,
      built: 0,
    }
    this.stomach = []
    this.vehicles = []
    this.crates = []
    this.flags = {}
    this.news = [{ t: Date.now(), text: 'Good morning! The city is waking up. Feed it some breakfast.', icon: '🌅' }]
    this.spawnAcc = 0
    this.id = 0
    for (let i = 0; i < 70; i++) this.spawn(true)
  }

  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  emit(type, v) {
    this.listeners.forEach((fn) => fn(type, v))
  }

  say(text, icon) {
    this.news.unshift({ t: Date.now() + Math.random(), text, icon })
    this.news = this.news.slice(0, 6)
    this.emit('news', this.news)
  }

  eat(id) {
    const f = FOOD[id]
    if (!f) return
    this.stomach.push({ ...f, left: 1 })
    const n = Math.max(1, Math.round((f.carb + f.prot + f.fat) / 12))
    for (let k = 0; k < n; k++) this.crates.push({ food: id, color: f.carb > f.prot ? CARGO.glucose.color : CARGO.protein.color, born: performance.now() })
    this.s.digesting = 1
    if (id === 'soda' || id === 'donut') this.say(`${f.emoji} ${f.name} hits the market. Fast sugar incoming!`, '⚠️')
    else if (f.prot >= 12) this.say(`${f.emoji} ${f.name} delivered: protein crates for the muscle crews.`, '💪')
    else if (f.fibre >= 3) this.say(`${f.emoji} ${f.name} arrives. Fibre keeps the energy release slow and steady.`, '🌿')
    else this.say(`${f.emoji} ${f.name} is being unpacked at the stomach market.`, '🍽️')
    this.emit('ate', id)
  }

  drink() {
    this.s.hydration = clamp(this.s.hydration + 0.22)
    this.s.waterBoost = 1
    this.say('💧 A glass of water! The kidney water works are topping up the towers.', '💧')
  }

  setMode(m) {
    const s = this.s
    if (s.mode === m) m = 'rest'
    s.mode = m
    s.modeLeft = m === 'walk' ? 30 : m === 'workout' ? 45 : m === 'sleep' ? 8 * 60 : 0
    if (m === 'sleep' && s.minute > 6 * 60 && s.minute < 22 * 60 + 30) s.minute = 22 * 60 + 30
    if (m === 'walk') this.say('🚶 Out for a walk. The leg districts ask for more oxygen and glucose.', '🚶')
    if (m === 'workout') this.say('🏋️ Workout time! Heart station to full power, mitochondria glowing.', '🔥')
    if (m === 'sleep') this.say('😴 Lights out. Repair crews head to the muscle sites, clean-up trucks to the brain.', '🌙')
    if (m === 'rest') this.say('☕ Back to rest. The city settles into a steady rhythm.', '🏙️')
    this.emit('mode', s.mode)
  }

  pickDest() {
    const s = this.s
    const w = {
      brain: 0.16 + s.night * 0.2,
      lungs: 0.14 + s.exercise * 0.1,
      heart: 0,
      stomach: 0.03 + s.digesting * 0.12,
      liver: 0.05 + s.digesting * 0.1 + s.insulin * 0.15,
      pancreas: 0.02 + s.insulin * 0.12,
      kidneys: 0.05 + s.waterBoost * 0.15,
      gut: 0.03 + s.digesting * 0.1,
      fat: 0.03 + Math.max(0, s.glucose - 0.55) * 0.5 + s.lipids * 0.1 + (s.mode === 'workout' ? 0.06 : 0),
      armL: 0.05 + (s.mode === 'workout' ? 0.12 : 0),
      armR: 0.05 + (s.mode === 'workout' ? 0.12 : 0),
      legL: 0.06 + (s.mode === 'walk' ? 0.18 : 0) + (s.mode === 'workout' ? 0.2 : 0),
      legR: 0.06 + (s.mode === 'walk' ? 0.18 : 0) + (s.mode === 'workout' ? 0.2 : 0),
    }
    let tot = 0
    for (const v of Object.values(w)) tot += v
    let r = Math.random() * tot
    for (const [k, v] of Object.entries(w)) {
      r -= v
      if (r <= 0) return k
    }
    return 'brain'
  }

  pickCargo(dest) {
    const s = this.s
    if (s.night > 0.5) {
      if (dest.startsWith('arm') || dest.startsWith('leg')) return Math.random() < 0.55 ? 'repair' : 'protein'
      if (dest === 'brain') return Math.random() < 0.6 ? 'clean' : 'oxygen'
    }
    if (dest === 'lungs') return 'oxygen'
    if (s.insulin > 0.25 && Math.random() < s.insulin * 0.5) return 'insulin'
    const w = {
      oxygen: 0.5 + s.exercise * 0.3,
      glucose: s.glucose * 0.9 + (s.glucose > 0.6 ? 0.8 : 0),
      protein: s.protein * 0.6 + (dest.startsWith('leg') || dest.startsWith('arm') ? s.protein * 0.8 : 0),
      fat: s.lipids * 0.6 + (dest === 'fat' ? 0.4 : 0),
      water: s.waterBoost * 0.5 + (dest === 'kidneys' ? 0.3 : 0.04),
    }
    let tot = 0
    for (const v of Object.values(w)) tot += v
    let r = Math.random() * tot
    for (const [k, v] of Object.entries(w)) {
      r -= v
      if (r <= 0) return k
    }
    return 'oxygen'
  }

  spawn(scatter = false) {
    const dest = this.pickDest()
    const routes = ROUTES[dest]
    const route = routes[Math.floor(Math.random() * routes.length)]
    if (!route.length) return
    const cargo = this.pickCargo(dest)
    const v = { id: this.id++, dest, cargo, route, idx: 0, s: 0, phase: scatter ? 'out' : 'queue', dwell: 0, v: 0, jitter: 0.85 + Math.random() * 0.3 }
    if (scatter) {
      v.idx = Math.floor(Math.random() * route.length)
      v.s = Math.random() * route[v.idx].road.len
      if (Math.random() < 0.5) {
        v.phase = 'back'
        v.route = route.slice().reverse().map((c) => ({ road: c.road, fwd: !c.fwd }))
        v.idx = Math.floor(Math.random() * v.route.length)
      }
    }
    this.vehicles.push(v)
  }

  deliver(v) {
    const s = this.s
    const site = v.dest.startsWith('arm') || v.dest.startsWith('leg')
    if (v.cargo === 'protein' && site && (s.exercise > 0.2 || s.night > 0.5 || s.recentTrain > 0)) {
      s.muscle = clamp(s.muscle + 0.0045)
      s.built += 1
    }
    if (v.cargo === 'repair' && site) s.muscle = clamp(s.muscle + 0.002)
    if (v.cargo === 'glucose' && v.dest === 'fat') s.fat = clamp(s.fat + 0.0025)
    if (v.cargo === 'fat' && v.dest === 'fat') s.fat = clamp(s.fat + (s.mode === 'workout' ? -0.003 : 0.002))
    this.emit('deliver', v)
  }

  step(dt) {
    const s = this.s
    const speedUp = s.mode === 'sleep' ? 14 : 2
    const dm = dt * speedUp
    s.minute += dm
    if (s.minute >= 24 * 60) {
      s.minute -= 24 * 60
      s.day += 1
    }
    if (s.modeLeft > 0) {
      s.modeLeft -= dm
      if (s.modeLeft <= 0) {
        if (s.mode === 'sleep') this.say('☀️ Rise and shine! Muscles repaired, brain cleaned, sleep debt paid.', '☀️')
        if (s.mode === 'workout' || s.mode === 'walk') s.recentTrain = 120
        s.mode = 'rest'
        this.emit('mode', 'rest')
      }
    }
    s.recentTrain = Math.max(0, (s.recentTrain || 0) - dm)
    const ex = s.mode === 'workout' ? 1 : s.mode === 'walk' ? 0.45 : 0
    s.exercise += (ex - s.exercise) * Math.min(1, dt * 1.2)
    s.night += ((s.mode === 'sleep' ? 1 : 0) - s.night) * Math.min(1, dt * 0.9)
    let cr = 0
    let pr = 0
    let fr = 0
    for (const it of this.stomach) {
      const rate = (it.speed / (1 + it.fibre * 0.12)) * 0.03 * dm
      const take = Math.min(it.left, rate)
      it.left -= take
      cr += it.carb * take
      pr += it.prot * take
      fr += it.fat * take
    }
    this.stomach = this.stomach.filter((it) => it.left > 0.001)
    const pending = this.stomach.reduce((a, it) => a + it.left, 0)
    const keep = Math.ceil(pending * 3)
    if (this.crates.length > keep) this.crates.splice(0, this.crates.length - keep)
    s.digesting += ((this.stomach.length ? 1 : 0) - s.digesting) * Math.min(1, dt)
    s.glucose = clamp(s.glucose + cr * 0.0105)
    s.protein = clamp(s.protein + pr * 0.012 - 0.0006 * dm)
    s.lipids = clamp(s.lipids + fr * 0.01 - 0.004 * dm * s.lipids)
    s.fat = clamp(s.fat + fr * 0.0012)
    const burn = (0.0012 + ex * 0.0075) * dm
    s.glucose = clamp(s.glucose - burn * 0.6)
    s.glycogen = clamp(s.glycogen - burn * 0.25)
    if (ex > 0.3) s.fat = clamp(s.fat - burn * 0.12)
    const target = s.glucose > 0.5 ? (s.glucose - 0.45) * 2.4 : 0
    s.insulin += (target - s.insulin) * Math.min(1, dt * 0.8)
    const pull = s.insulin * 0.012 * dm
    s.glucose = clamp(s.glucose - pull)
    if (s.glycogen < 0.97) s.glycogen = clamp(s.glycogen + pull * 0.7)
    else s.fat = clamp(s.fat + pull * 0.35)
    if (s.glucose < 0.32 && s.glycogen > 0.05) {
      const r = (0.32 - s.glucose) * 0.06 * dm
      s.glucose = clamp(s.glucose + r)
      s.glycogen = clamp(s.glycogen - r * 0.8)
    }
    if (s.glucose < 0.28 && s.glycogen < 0.1) s.fat = clamp(s.fat - 0.0006 * dm)
    s.hydration = clamp(s.hydration - (0.0005 + ex * 0.0022) * dm)
    s.waterBoost = Math.max(0, s.waterBoost - dt * 0.08)
    s.sleepDebt = clamp(s.sleepDebt + (s.mode === 'sleep' ? -0.0022 : 0.00045) * dm)
    if (s.mode === 'sleep') s.muscle = clamp(s.muscle + 0.00006 * dm * (s.protein > 0.15 ? 1 : 0.3))
    const hrT = s.mode === 'workout' ? 148 : s.mode === 'walk' ? 98 : s.mode === 'sleep' ? 54 : 66 + Math.max(0, s.glucose - 0.6) * 25 + (1 - s.hydration) * 10
    s.hr += (hrT - s.hr) * Math.min(1, dt * 0.6)
    const stab = 1 - Math.min(1, Math.abs(s.glucose - 0.45) * 2.2)
    s.focus = clamp(0.25 + stab * 0.35 + s.hydration * 0.25 + (1 - s.sleepDebt) * 0.25)
    s.jam = clamp((s.glucose - 0.6) * 3)
    this.checkNews()
    this.traffic(dt)
  }

  checkNews() {
    const s = this.s
    const f = this.flags
    const edge = (key, cond, text, icon) => {
      if (cond && !f[key]) {
        f[key] = true
        this.say(text, icon)
      } else if (!cond && f[key]) f[key] = false
    }
    edge('rush', s.glucose > 0.66, '🚦 Sugar rush! Glucose trucks are jamming the aorta.', '🚦')
    edge('insulin', s.insulin > 0.45, '🚓 The Insulin Department dispatches every van it has.', '🚓')
    edge('fatfill', s.glycogen > 0.96 && s.glucose > 0.55, '🛢️ Glycogen stores are full. Extra sugar is going to the fat silos.', '🛢️')
    edge('low', s.glucose < 0.24 && s.mode !== 'sleep', '🪫 Low fuel! The brain is getting foggy. Time for a balanced snack.', '🪫')
    edge('dry', s.hydration < 0.35, '🏜️ The water towers are running low. Drink some water!', '🏜️')
    edge('build', s.built > 0 && s.built % 6 === 0, '🏗️ New muscle floors are going up at the construction sites.', '🏗️')
    if (s.built % 6 !== 0) f.build = false
  }

  traffic(dt) {
    const s = this.s
    const target = Math.round(70 + (s.hr - 50) * 1.4 + s.jam * 150)
    this.spawnAcc += dt * (target > this.vehicles.length ? 8 + s.jam * 18 : 0)
    while (this.spawnAcc > 1) {
      this.spawnAcc -= 1
      this.spawn()
    }
    const vmaxBase = 0.95 * Math.sqrt(s.hr / 66) * (1 - s.jam * 0.55) * (s.mode === 'sleep' ? 1.4 : 1)
    const lanes = new Map()
    const entry = new Map()
    const laneKey = (seg) => seg.road.id * 2 + (seg.fwd ? 1 : 0)
    for (const v of this.vehicles) {
      if (v.phase === 'dwell' || v.phase === 'queue') continue
      const key = laneKey(v.route[v.idx])
      if (!lanes.has(key)) lanes.set(key, [])
      lanes.get(key).push(v)
      entry.set(key, Math.min(entry.has(key) ? entry.get(key) : Infinity, v.s))
    }
    const enter = (v) => {
      const key = laneKey(v.route[0])
      if ((entry.has(key) ? entry.get(key) : Infinity) < 0.34) return false
      entry.set(key, 0)
      v.idx = 0
      v.s = 0
      v.v = 0.2
      return true
    }
    for (const list of lanes.values()) {
      list.sort((a, b) => b.s - a.s)
      for (let i = 0; i < list.length; i++) {
        const v = list[i]
        const kind = CARGO[v.cargo].kind
        const seg = v.route[v.idx]
        const choke = seg.fwd && PINCH.has(seg.road.id) ? 1 - s.jam * 0.88 : 1
        const vmax = choke * vmaxBase * v.jitter * (kind === 'van' ? 1.15 : kind === 'pod' ? 1.05 : 0.95)
        let want = vmax
        if (i > 0) {
          const gap = list[i - 1].s - v.s
          want = vmax * clamp((gap - 0.27) / (0.08 + 0.32 * (1 - s.jam)))
        }
        v.v += (want - v.v) * Math.min(1, dt * 4)
      }
    }
    const keep = []
    for (const v of this.vehicles) {
      if (v.phase === 'queue') {
        if (enter(v)) v.phase = 'out'
        keep.push(v)
        continue
      }
      if (v.phase === 'dwell') {
        v.dwell -= dt
        if (v.dwell <= 0) {
          const back = v.route.slice().reverse().map((c) => ({ road: c.road, fwd: !c.fwd }))
          const prev = v.route
          v.route = back
          if (enter(v)) v.phase = 'back'
          else v.route = prev
        }
        keep.push(v)
        continue
      }
      v.s += v.v * dt
      let alive = true
      while (alive && v.s >= v.route[v.idx].road.len) {
        v.s -= v.route[v.idx].road.len
        v.idx++
        if (v.idx >= v.route.length) {
          if (v.phase === 'out') {
            v.phase = 'dwell'
            v.dwell = 0.5 + Math.random() * 0.6
            v.idx = v.route.length - 1
            v.s = v.route[v.idx].road.len
            this.deliver(v)
          } else {
            alive = false
          }
          break
        }
      }
      if (!alive) {
        if (this.vehicles.length <= target + 10) {
          const dest = this.pickDest()
          const routes = ROUTES[dest]
          v.dest = dest
          v.route = routes[Math.floor(Math.random() * routes.length)]
          v.cargo = this.pickCargo(dest)
          v.idx = 0
          v.s = 0
          v.phase = 'queue'
          keep.push(v)
        }
        continue
      }
      keep.push(v)
    }
    this.vehicles = keep
  }

  onRoad() {
    let n = 0
    for (const v of this.vehicles) if (v.phase !== 'queue') n++
    return n
  }

  place(v) {
    const seg = v.route[v.idx]
    const lane = seg.road.w * 0.48
    return pointOn(seg.road, v.s, seg.fwd, lane)
  }
}

export { ROADS }
