# FitMove

Live: [zeepalm-fitmove.vercel.app](https://zeepalm-fitmove.vercel.app)

A fitness dashboard built in React, matched pixel for pixel to a Dribbble design. When it loads, the page builds itself in order, like a short story of Wingman's day. It is also fully interactive.

## Design credit

The design is the Dribbble shot [FitMove – Fitness Dashboard Figma Template](https://dribbble.com/shots/25500818-FitMove-Fitness-Dashboard-Figma-Template) by Ahmad S. Afandi for Peterdraw Studio. The photos, map and icon shapes come from that shot. The code, motion and interactions are ours. Credit the original shot when you post this.

## The intro story

It plays once, takes about four and a half seconds, and finishes on the exact static design.

1. The FitMove mark assembles petal by petal. Then the sidebar slides in, and the active pill sweeps onto Dashboard.
2. "Hello, Wingman!" rises letter by letter. The hand waves, the search bar unrolls and the bell rings.
3. Today's vitals:
   - The calories gauge sweeps and its needle swings into place.
   - The heart-rate trace draws itself.
   - The steps curve grows over its grid.
   - Every number counts up.
4. The week's activity:
   - The grid draws itself and the bars spring up.
   - Friday's bar turns yellow and its tooltip pops in.
5. The goal rings sweep outer to inner while 75% counts up.
6. The profile panel arrives:
   - The calendar ripples in diagonally and the marked days pop.
   - The morning session's check mark draws itself.
7. Today's run:
   - The map opens from the start flag and the Park Loop route draws itself.
   - The trail stats count up.
8. The meal photos settle into frame, the classes slide in, and the upgrade card's mark spins into place.

Some motion keeps going afterwards:

- A pulse travels along the heart-rate line.
- The heart icon beats.
- A runner dot laps the route.
- The steps marker breathes.
- The hand waves and the bell rings now and then.
- A shine crosses the upgrade button.

## What you can do

- **Activity chart:**
  - Hover a bar to move the tooltip to that day.
  - Use the date chip to switch between three weeks. The bars morph to the new data.
- **Progress:** switch between This Week, This Month and This Year to re-sweep the rings. Hover a legend row to highlight its ring.
- **Steps:** hover a day to move the marker along the curve and show that day's steps.
- **Today's Activity:** switch between Running, Cycling and Walking. Each one draws its own route and shows its own stats.
- **Calendar:** browse months and select a day.
- **My Schedule:**
  - Tick sessions off; the check mark draws itself.
  - Add a session from the + menu.
  - Each row has its own menu.
- **Recent Activity:** expand or collapse any entry to see duration, calories and notes.
- **Search:** press Ctrl+K or click the field. Results filter as you type, across classes, meals, trails and sessions.
- **Notifications:** the bell rings and opens a list.
- **Sidebar:** the active pill slides to the item you pick.
- **Classes:** join a class from its level pill.
- **Meals:** double-click a meal card to like it.

## How it is built

- **Stack:** React 18, Vite, GSAP and the Figtree font.
- **Canvas:**
  - The layout is a fixed 1440 × 1290 canvas, scaled to the window width.
  - Every element is placed by measuring the 4100 px source shot. Text is positioned by its baseline.
- **Corners:** cards use Figma-style smooth corners, generated as SVG paths in `src/ui/squircle.js`.
- **Icons:** icon shapes are vector outlines traced from the source shot (`src/ui/glyphs.js`).
- **Story:** the intro and the ongoing motion live in `src/story.js`.
- **URL options:**
  - `?still` renders the final design with no intro.
  - `?film` is the stage used to record the showcase video.

## Run it

```bash
npm install
npm run dev
```

## Deploy

The project is deployed on Vercel with Root Directory set to `fitmove` and the Vite preset. To redeploy, deploy the latest commit of `main`.
