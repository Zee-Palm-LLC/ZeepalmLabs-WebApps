import { BY_ID } from './foods.js'

export const FOOD_LINES = {
  broccoli: ['Broccoli! Now we’re cooking.', 'Tiny trees. Love to see it.'],
  leafy: ['Spinach. Popeye would be proud.'],
  salad: ['A whole salad? Respect.'],
  avocado: ['Avocado. Good fats, great choice.'],
  chili: ['Ooh, a little heat. Bold.'],
  garlic: ['Garlic. Now the plate has a personality.'],
  fish: ['Fish. Omega‑3s, my favourite kind of fat.'],
  chicken: ['Lean chicken. Classic move.'],
  steak: ['Steak, nice. Keep it to one.'],
  beans: ['Beans. Cheap, fibre-packed, underrated.'],
  falafel: ['Falafel! Plant protein with crunch.'],
  egg: ['An egg. Small but mighty.'],
  bacon: ['Bacon… I’ll allow one.', 'Processed meat. Easy does it.'],
  meat: ['Ribs? It’s a plate, not a barbecue.'],
  sushi: ['Sushi. Fancy.'],
  oats: ['Oats. Slow energy, very wise.'],
  sweetpotato: ['Sweet potato. Fibre and flavour.'],
  bread: ['Whole grain. Good call.'],
  croissant: ['A croissant is mostly butter wearing a costume.'],
  pancakes: ['Pancakes for dinner? Bold.'],
  blueberries: ['Blueberries. Little antioxidant bombs.'],
  watermelon: ['Watermelon. Basically edible water.'],
  lemon: ['A lemon. For… garnish?'],
  donut: ['A doughnut. We need to talk.', 'Doughnut detected.'],
  cake: ['Cake on the main plate? Brave.'],
  burger: ['A whole burger. On a plate. With other food.'],
  fries: ['Fries. The potato’s worst decision.'],
  pizza: ['Pizza on a health plate. Interesting.'],
  candy: ['Candy is not a food group.'],
  lollipop: ['A lollipop? How old are you?'],
  popcorn: ['Popcorn is technically whole grain. Technically.'],
  water: ['Water. Perfect.', 'Hydration. Chef approves.'],
  tea: ['Green tea. Very zen.'],
  coffee: ['Black coffee. No-nonsense.'],
  milk: ['Milk. Calcium on the side.'],
  juice: ['Juice is fruit without the fibre.'],
  soda: ['Soda? That’s ten sugar cubes.', 'Swap that soda for water and watch your score jump.'],
  bubbletea: ['Bubble tea is dessert in a cup.'],
  cheese: ['A little cheese never hurt.'],
  butter: ['Butter, on its own? Interesting.'],
}

export const GROUP_LINES = {
  veg: ['More colour, more good.', 'Veg, yes.', 'Plants on the plate!'],
  fruit: ['Fruit, nice and fresh.', 'A sweet touch, the good kind.'],
  protein: ['Protein in.', 'That’ll keep you full.'],
  grain: ['Some fuel.', 'Carbs, the useful kind.'],
  dairy: ['Side of dairy.'],
  treat: ['Treat yourself… a little.', 'Hmm.'],
  drink: ['Something to drink.'],
}

export const TIP_LINES = {
  animal: 'This is a plant-based plate. Lose the animal products.',
  treats: 'That’s a lot of treats. Pick one.',
  soda: 'Swap the sugary drink for water.',
  veg: 'It needs more vegetables. Half the plate, ideally.',
  protein: 'Short on protein. Add chicken, fish, beans or eggs.',
  carbs: 'Too many carbs for low carb. Ease off the starch.',
  fuel: 'You trained hard. Add rice, oats or potato to refuel.',
  sugar: 'Sugar is climbing. Watch the sweet stuff.',
  big: 'This is a feast. Maybe trim a portion.',
  small: 'That’s a snack, not a meal. Add more.',
  grain: 'Add a whole grain for lasting energy.',
  fruit: 'A piece of fruit would round this out.',
  variety: 'Add a few different foods for variety.',
  drink: 'Don’t forget a drink. Water is perfect.',
}

export const EMPTY_LINES = [
  'Your plate is empty. Grab something off the belt.',
  'Clean plate! Now build me something good.',
]

export const SCORE_LINES = [
  [92, ['Now THAT is a plate.', 'Chef’s kiss. Frame it.', 'Perfection. I’m emotional.']],
  [82, ['Beautiful plate. Chef approved.', 'Restaurant quality. Well done.']],
  [70, ['Solid. A tweak or two from great.']],
  [58, ['Getting there.']],
  [45, ['Hmm. It needs work.']],
  [0, ['I can’t serve this.', 'Send it back.']],
]

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function moodFor(score, plate) {
  const tr = [...plate.items, ...plate.side].filter((i) => BY_ID[i.food].g === 'treat').length
  if (plate.items.length === 0 && plate.side.length === 0) return 'm_think'
  if (tr >= 4) return 'm_boom'
  if (tr >= 3) return 'm_sick'
  if (plate.drink === 'soda' && score < 70) return 'm_steam'
  if (score >= 95) return 'm_cool'
  if (score >= 88) return 'm_star'
  if (score >= 80) return 'm_love'
  if (score >= 70) return 'm_savor'
  if (score >= 58) return 'm_smile'
  if (score >= 45) return 'm_neutral'
  if (score >= 30) return 'm_brow'
  return 'm_grimace'
}
