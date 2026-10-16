export const FLAVORS = [
  { id: 'cucumber', name: 'Cucumber Lime', short: 'CUCUMBER\nLIME', body: '#0f3b2c', ink: '#c6ff6b', accent: '#2fd38a', glow: '#7dff9f', bg: ['#0c2a20', '#1c7a4f'], note: 'Cool cucumber and a squeeze of lime. Crisp, clean and made for long sessions.' },
  { id: 'watermelon', name: 'Watermelon Mint', short: 'WATERMELON\nMINT', body: '#6b0f2a', ink: '#ffd1dc', accent: '#ff3d6e', glow: '#ff5c8a', bg: ['#3a0717', '#e3195a'], note: 'Juicy watermelon with a cooling mint finish. Our best seller after leg day.' },
  { id: 'berry', name: 'Blueberry Acai', short: 'BLUEBERRY\nACAI', body: '#241657', ink: '#cfc4ff', accent: '#7d6bff', glow: '#9c8cff', bg: ['#140b33', '#5a3fe0'], note: 'Deep blueberry and acai, packed with antioxidants and a gentle tartness.' },
  { id: 'mango', name: 'Mango Passion', short: 'MANGO\nPASSION', body: '#6e2a06', ink: '#ffe0a3', accent: '#ff8a1f', glow: '#ffae4d', bg: ['#3a1504', '#ff7a14'], note: 'Sun-ripe mango with tangy passion fruit. A tropical reset between sets.' },
  { id: 'citrus', name: 'Lemon Ginger', short: 'LEMON\nGINGER', body: '#5a4a05', ink: '#fff6b0', accent: '#ffd21f', glow: '#ffe45c', bg: ['#2e2603', '#e8b90c'], note: 'Bright lemon with a warm ginger kick that wakes you up before training.' },
  { id: 'cherry', name: 'Black Cherry', short: 'BLACK\nCHERRY', body: '#3a0612', ink: '#ffb3c4', accent: '#c4123f', glow: '#ff4d73', bg: ['#22030a', '#9e0f33'], note: 'Dark, rich cherry. Naturally full of polyphenols for faster recovery.' },
  { id: 'coconut', name: 'Coconut Pine', short: 'COCONUT\nPINEAPPLE', body: '#0d4a5c', ink: '#d6fbff', accent: '#3fd6ff', glow: '#7ae6ff', bg: ['#062631', '#1aa3c8'], note: 'Coconut water and pineapple. Natural potassium in every sip.' },
  { id: 'grape', name: 'Grape Rush', short: 'GRAPE\nRUSH', body: '#2c0d40', ink: '#efc9ff', accent: '#b44dff', glow: '#cf7dff', bg: ['#170624', '#8a1fd1'], note: 'Bold purple grape that tastes like a reward, without the sugar crash.' },
]

export const HERO = 1

export const FEATURES = [
  { id: 'sugar', icon: '0g', title: 'Zero\nsugar', text: 'No sugar and no artificial sweeteners. A dash of stevia leaf gives you the taste without the spike, so your energy stays steady from warm-up to cool-down.', label: 'ZERO SUGAR' },
  { id: 'lytes', icon: 'Na', title: 'Three\nelectrolytes', text: 'Sodium, potassium and magnesium in the ratio your body loses through sweat. Replace what you lose and stay sharp in the last rep.', label: 'ELECTROLYTES' },
  { id: 'vit', icon: 'B', title: 'B-vitamin\ncomplex', text: 'B3, B6 and B12 support normal energy metabolism and help reduce tiredness and fatigue during hard training blocks.', label: 'B VITAMINS' },
  { id: 'clean', icon: '✦', title: 'Clean\ningredients', text: 'Real fruit extracts, no colours, no preservatives and nothing you cannot pronounce. Vegan, gluten free and tested for sport.', label: 'NATURAL FLAVOURS' },
]

export const FAQ = [
  { q: 'What makes KOVA different from a sports drink?', a: 'Most sports drinks rely on sugar for taste. KOVA gives you the same electrolytes in a sugar-free, lightly sweetened drink with real fruit flavour.' },
  { q: 'When should I drink it?', a: 'Before, during or after training, or any time you need to rehydrate. On hot days or long sessions, one can per hour of hard effort is a good guide.' },
  { q: 'How many calories are in a can?', a: 'Each 330 ml can has fewer than 10 calories and zero grams of sugar.' },
  { q: 'Does it contain caffeine?', a: 'Our classic range is caffeine free, so you can drink it late in the day without affecting your sleep.' },
  { q: 'Is KOVA suitable for vegans?', a: 'Yes. Every flavour is vegan, gluten free and free from the major allergens.' },
  { q: 'Is it safe to drink every day?', a: 'Yes, as part of a balanced diet. If you have a medical condition that affects your sodium intake, check with your doctor first.' },
  { q: 'Can I recycle the can?', a: 'Our cans are made from aluminium and are infinitely recyclable. Rinse, squash and recycle.' },
  { q: 'Where can I buy KOVA?', a: 'Online in our shop, and at selected gyms and health stores. Join the crew below to hear about new stockists first.' },
]

export const PROFILE = {
  cucumber: [0.35, 0.55, 0.95, 0.85],
  watermelon: [0.75, 0.3, 0.7, 0.8],
  berry: [0.6, 0.65, 0.4, 0.3],
  mango: [0.85, 0.45, 0.5, 0.2],
  citrus: [0.4, 0.9, 0.75, 0.45],
  cherry: [0.65, 0.6, 0.3, 0.25],
  coconut: [0.55, 0.25, 0.8, 0.6],
  grape: [0.8, 0.4, 0.35, 0.3],
}
export const PROFILE_KEYS = ['Sweet', 'Tart', 'Fresh', 'Cool']

export const SPECS = [
  { k: 'Sodium', v: 300, u: 'mg', max: 400 },
  { k: 'Potassium', v: 150, u: 'mg', max: 400 },
  { k: 'Magnesium', v: 50, u: 'mg', max: 400 },
  { k: 'Energy', v: 8, u: 'kcal', max: 140 },
  { k: 'Sugar', v: 0, u: 'g', max: 35 },
]

export const SUGAR_BARS = [
  { k: 'KOVA', v: 0 },
  { k: 'Sports drink', v: 20 },
  { k: 'Orange juice', v: 29 },
  { k: 'Cola', v: 35 },
]

export const LYTES = [
  { k: 'Sodium', v: 300, p: 0.75 },
  { k: 'Potassium', v: 150, p: 0.5 },
  { k: 'Magnesium', v: 50, p: 0.35 },
]

export const VITS = [
  { k: 'B3 Niacin', p: 0.5 },
  { k: 'B6', p: 0.5 },
  { k: 'B12', p: 1 },
]

export const CLEAN = ['Real fruit extracts', 'No colours', 'No preservatives', 'Vegan', 'Gluten free', 'Batch tested for sport']

export const COMPARE = {
  cols: [
    { id: 'sugar', label: 'Sugar', u: 'g', max: 36 },
    { id: 'kcal', label: 'Calories', u: 'kcal', max: 150 },
    { id: 'na', label: 'Sodium', u: 'mg', max: 320 },
    { id: 'k', label: 'Potassium', u: 'mg', max: 660 },
  ],
  rows: [
    { id: 'kova', name: 'KOVA', v: { sugar: 0, kcal: 8, na: 300, k: 150 }, hi: true },
    { id: 'sport', name: 'Typical sports drink', v: { sugar: 20, kcal: 85, na: 165, k: 50 } },
    { id: 'cola', name: 'Cola', v: { sugar: 35, kcal: 139, na: 15, k: 0 } },
    { id: 'oj', name: 'Orange juice', v: { sugar: 29, kcal: 148, na: 3, k: 640 } },
    { id: 'water', name: 'Tap water', v: { sugar: 0, kcal: 0, na: 10, k: 0 } },
  ],
}

export const ATHLETES = [
  { name: 'Maya Okafor', sport: 'Marathon', stat: '2:58', statLabel: 'Berlin PB', flavor: 'cucumber', quote: 'Sub-three in a heatwave. One can every 5K and I never hit the wall.' },
  { name: 'Theo Lindqvist', sport: 'Functional fitness', stat: 'Top 40', statLabel: 'Regional finals', flavor: 'watermelon', quote: 'Two-a-days used to wreck me. Now I finish session two stronger than session one.' },
  { name: 'Aria Chen', sport: 'Triathlon', stat: '6×', statLabel: '70.3 finishes', flavor: 'coconut', quote: 'Five hours of racing in the sun. I count salt as carefully as calories.' },
  { name: 'Dante Silva', sport: 'Boxing', stat: '12–0', statLabel: 'Amateur record', flavor: 'cherry', quote: 'Making weight is brutal. Rehydrating right is how I win the next day.' },
  { name: 'Noor Haddad', sport: 'Climbing', stat: '8a', statLabel: 'Hardest sport route', flavor: 'berry', quote: 'Sharp head, steady grip. It tastes like a treat without the sugar crash.' },
]

export const STATS = [
  { v: 1.2, d: 1, suf: 'M', label: 'Cans drunk this year' },
  { v: 380, d: 0, suf: '', label: 'Partner gyms' },
  { v: 4.9, d: 1, suf: '★', label: 'From 12,840 reviews' },
  { v: 0, d: 0, suf: 'g', label: 'Sugar, always' },
]

export const MARQUEE = ['Zero sugar', 'Three electrolytes', 'B vitamins', 'Real fruit', 'Vegan', '8 kcal', 'Batch tested']

export const FAQ_CATS = ['All', 'Ingredients', 'Training', 'Orders']
export const FAQ_CAT = ['Ingredients', 'Training', 'Ingredients', 'Ingredients', 'Ingredients', 'Training', 'Orders', 'Orders']

export const INTENSITY = [
  { id: 'easy', name: 'Easy', rate: 0.5 },
  { id: 'steady', name: 'Steady', rate: 0.8 },
  { id: 'hard', name: 'Hard', rate: 1.1 },
  { id: 'race', name: 'Race', rate: 1.4 },
]
