import { BY_ID } from './foods.js'

const has = (plate, fn) => [...plate.items, ...plate.side].some((i) => fn(BY_ID[i.food]))
const cnt = (plate, fn) => [...plate.items, ...plate.side].filter((i) => fn(BY_ID[i.food])).length
const sweetDrink = (plate) => ['soda', 'bubbletea', 'juice'].includes(plate.drink)

export const CUSTOMERS = [
  {
    id: 'gus',
    name: 'Gym Gus',
    em: 'c_gus',
    quote: 'Leg day. Feed me like I mean it.',
    goal: 'protein',
    rules: [
      ['45 g+ protein', (t) => t.p >= 45],
      ['Under 900 kcal', (t) => t.kcal <= 900],
      ['A vegetable', (t, p) => has(p, (f) => f.g === 'veg')],
    ],
  },
  {
    id: 'maya',
    name: 'Marathon Maya',
    em: 'c_maya',
    quote: 'Twenty miles tomorrow. Carbs, please!',
    goal: 'recovery',
    rules: [
      ['80 g+ carbs', (t) => t.c >= 80],
      ['20 g+ protein', (t) => t.p >= 20],
      ['Some fruit', (t, p) => has(p, (f) => f.g === 'fruit')],
    ],
  },
  {
    id: 'kai',
    name: 'Keto Kai',
    em: 'c_kai',
    quote: 'No bread. Don’t even look at the rice.',
    goal: 'lowcarb',
    rules: [
      ['Under 25 g carbs', (t) => t.c <= 25],
      ['2+ vegetables', (t, p) => cnt(p, (f) => f.g === 'veg') >= 2],
      ['25 g+ protein', (t) => t.p >= 25],
    ],
  },
  {
    id: 'vee',
    name: 'Vegan Vee',
    em: 'c_vee',
    quote: 'Plants only. Surprise me.',
    goal: 'plant',
    rules: [
      ['No animal foods', (t) => t.animal === 0],
      ['15 g+ protein', (t) => t.p >= 15],
      ['3+ colours', (t) => t.colors >= 3],
    ],
  },
  {
    id: 'leo',
    name: 'Little Leo',
    em: 'c_leo',
    quote: 'Can I have dessert? Pleeease?',
    goal: 'balanced',
    rules: [
      ['One treat, max', (t) => t.count.treat <= 1],
      ['Some fruit', (t, p) => has(p, (f) => f.g === 'fruit')],
      ['No sugary drink', (t, p) => !sweetDrink(p)],
    ],
  },
  {
    id: 'joe',
    name: 'Grandpa Joe',
    em: 'c_joe',
    quote: 'Doctor says more fibre, less sugar.',
    goal: 'balanced',
    rules: [
      ['10 g+ fibre', (t) => t.fi >= 10],
      ['Under 20 g sugar', (t) => t.su <= 20],
      ['A whole grain', (t, p) => has(p, (f) => f.g === 'grain' && !f.proc)],
    ],
  },
  {
    id: 'olivia',
    name: 'Office Olivia',
    em: 'c_olivia',
    quote: 'Light lunch, I have a 2pm meeting.',
    goal: 'balanced',
    rules: [
      ['400–650 kcal', (t) => t.kcal >= 400 && t.kcal <= 650],
      ['2+ vegetables', (t, p) => cnt(p, (f) => f.g === 'veg') >= 2],
      ['Water, tea or coffee', (t, p) => ['water', 'tea', 'coffee'].includes(p.drink)],
    ],
  },
  {
    id: 'iris',
    name: 'Cyclist Iris',
    em: 'c_iris',
    quote: 'Just rode 60 km. Refuel me.',
    goal: 'recovery',
    rules: [
      ['600+ kcal', (t) => t.kcal >= 600],
      ['30 g+ protein', (t) => t.p >= 30],
      ['A drink', (t, p) => !!p.drink],
    ],
  },
  {
    id: 'sam',
    name: 'Mindful Sam',
    em: 'c_sam',
    quote: 'Something calm, colourful and green.',
    goal: 'plant',
    rules: [
      ['4+ colours', (t) => t.colors >= 4],
      ['No processed food', (t) => t.proc === 0],
      ['Green tea', (t, p) => p.drink === 'tea'],
    ],
  },
  {
    id: 'carter',
    name: 'Coach Carter',
    em: 'c_carter',
    quote: 'Show me a textbook plate. Score 80+.',
    goal: 'balanced',
    rules: [
      ['Plate score 80+', (t, p, s) => s >= 80],
      ['5+ different foods', (t) => t.kinds >= 5],
      ['No treats', (t) => t.count.treat === 0],
    ],
  },
]

export const ROUND = 45

export function rank(stars) {
  if (stars >= 14) return ['Head Chef', 'm_cool']
  if (stars >= 11) return ['Sous Chef', 'm_star']
  if (stars >= 8) return ['Line Cook', 'm_savor']
  if (stars >= 5) return ['Prep Cook', 'm_neutral']
  return ['Dishwasher', 'm_grimace']
}

export function dealOrders(n = 5) {
  const pool = [...CUSTOMERS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

export function judge(order, t, plate, score) {
  const checks = order.rules.map(([label, fn]) => ({ label, ok: !!fn(t, plate, score) }))
  const met = checks.filter((c) => c.ok).length
  let stars = 0
  if (t.n > 0) {
    if (met === checks.length) stars = score >= 70 ? 3 : 2
    else if (met >= 2) stars = 1
  }
  return { checks, met, stars }
}
