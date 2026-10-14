# Plated

Live: [zeepalm-plated.vercel.app](https://zeepalm-plated.vercel.app)

A plate-building game. Pull food off a moving conveyor belt onto a ceramic plate. A live Nutrition Facts label, a plate score and a very opinionated chef react to every bite. Then survive the lunch rush. No. 012 in the Zeepalm Labs studio series.

## What it does

- **The table:**
  - a linen-covered table with a hand-thrown plate, a side saucer, a cork coaster and a napkin;
  - soft window light, with leaf shadows that sway slowly over everything.
- **The belt:**
  - 77 foods ride a conveyor belt across the bottom of the screen, in seven groups: vegetables, fruit, protein, grains, dairy, treats and drinks;
  - filter the belt by group;
  - hover to pause it.
- **Building a plate:**
  - drag food onto the table, or tap it to add it;
  - each food flies in on an arc, lands with a squash and a plop, and settles into its zone on the healthy-plate layout;
  - while you drag, the target zone lights up;
  - hot foods steam;
  - dairy goes on the side saucer and drinks go on the coaster;
  - click any food to take it off;
  - **Clear plate** sweeps everything away.
- **Plate score:**
  - a live score out of 100 with a letter grade;
  - it combines balance (40 points), nutrition (35), variety (15) and the drink (10);
  - a bar compares your plate's mix with the ideal.
- **Nutrition Facts:** an FDA-style label that counts up live. It shows calories, fat, carbs, fibre, sugar, protein and % daily value, and colours a row when it hits or breaks your target.
- **Goals:** Balanced, High protein, Low carb, Plant-based and Post-workout. Each one changes the ideal plate, the calorie band and the targets.
- **Chef Remy:** reacts to every food you add. A couple of seconds later he gives you the most useful tip (more veg, swap the soda, too many treats), and his face changes with your score.
- **Breakdown view:** the food on the plate glides into a pie chart of what you actually built. An outer ring shows the ideal for your goal, with percentages for both.
- **Lunch Rush:**
  - five customers arrive one at a time, picked at random from ten, with 45 seconds each;
  - each ticket has three requests, for example "45 g+ protein", "Under 25 g carbs" or "No animal foods"; they tick off live as you build;
  - ring the bell to serve: the plate gets a star stamp and slides away, and the next ticket drops in;
  - at the end you get a rank, from Dishwasher to Head Chef.
- **Share:** **Share my plate** draws a 1080×1350 card of your plate with its score, grade and the chef's verdict, ready to download or share. A Lunch Rush result gets its own card.
- **Sound:** plops, sizzles, glass clinks, the service bell and a star fanfare, all synthesised live with Web Audio.
- **Keys:** X switches Plate and Breakdown, C clears the plate, Enter serves during Lunch Rush and Esc closes dialogs.
- **Mobile:** a single-column layout with a compact chef and ticket, a score strip that opens a sheet holding the goals and the full label, and the belt pinned to the bottom.

Nutrition values are typical single servings and are for play, not medical advice.

## How it works

- `src/data/foods.js` lists every food with its group, calories, macros, fibre, sugar, plate area and tags (plant, hot, processed).
- `src/lib/score.js` adds up the plate:
  - **balance:** each group's share of plate area against the goal's ideal;
  - **nutrition:** the calorie band, protein, fibre, sugar and the carb rule for the goal;
  - **variety:** distinct foods and colours;
  - **drink:** points for what you picked to drink.
  - It also returns the tips the chef picks from.
- `src/lib/layout.js` places each food in its zone by best-candidate sampling, so new food fills the emptiest spot, and computes the Breakdown pie and its positions.
- `src/ui/Table.jsx` renders the plate. A new food plays a FLIP arc from wherever it came from: the belt dish for a tap, the release point for a drag.
- `src/lib/share.js` redraws the plate on a canvas for the share card.
- `src/data/orders.js` holds the Lunch Rush customers, their rules and the star rating.

3D food and face art is [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft (MIT).

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

The site is the Vercel project `plated`, with Root Directory `plated` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
