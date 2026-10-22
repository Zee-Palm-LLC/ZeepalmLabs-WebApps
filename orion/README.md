# Orion

A four-page health and fitness dashboard for a training platform, built in React. The layout and motion follow a Dribbble design video. It is responsive and fills the whole window: on a typical laptop screen every page fits without scrolling, tablets get a two-column layout, and phones get a single column with a bottom tab bar.

## Design credit

The visual style follows the Dribbble shot [Orion — Dashboard UI Kit with 3D Maps](https://dribbble.com/shots/27824893-Orion-Dashboard-UI-Kit-with-3D-Maps) by Alien pixels. Orion is a paid Figma kit, so credit the original shot when you post this, and buy the kit if you use the design in a product. The fitness content, code, globe and motion are ours.

## Pages

Each page has its own address and plays its own intro. Numbers on every page roll like an odometer whenever the data refreshes.

| Page | Address | What's on it |
| --- | --- | --- |
| Global activity | `/` | A live 3D hex globe of members with "live now" city chips; active members; avg session and median streak; workouts by region; workouts logged and new PRs; this week's calories and active minutes; training hours by month. Cards for calories burned, heart rate, weekly goal, sleep stages and VO₂ max. |
| Coaching flow | `/network` | A Marathon prep program branching into training blocks (cardio, strength, mobility, rest, nutrition) and their sessions, with curved connectors and pulses travelling along them. Hover a node to light its path, or click to pin it. Side cards cover calories, active minutes, sessions and training load. |
| Training plan | `/roadmap` | A June Gantt chart for the Endurance, Strength and Recovery & nutrition squads. It has blocks, sessions, attachment and checklist counts, coach avatars, and an orange "today" line that steps forward. KPIs above it show sessions planned and completed, athletes, and the next race. |
| Fitness report | `/sales` | Four full-height cards: a morphing radar fitness profile (strength, endurance, speed, power, mobility, balance, recovery, agility), a heart rate trend with zone minutes, nightly sleep stages, and body composition. |

The gear icon opens Settings, where you can switch live data off and replay the intro. The Today / Week / Month (and Week / Month / Year) switches change which data snapshot is shown.

## Responsive layout

- **Wide screens (over 1180 px):** pages use CSS grid that stretches to the window. On Global activity, the globe row takes whatever height is left, so the page fits the screen exactly.
- **Tablets (760–1180 px):** two columns. The side panels move into a row and the summary cards wrap.
- **Phones (760 px and under):** a single column, with the sidebar turned into a bottom tab bar. The coaching diagram and the Gantt chart scroll sideways, and squad names stay pinned while you scroll.
- **Coaching diagram:** `src/components/FitBox.jsx` scales the hand-placed node diagram to fit both the width and the height left in the window.

## How it is built

- **Stack:** React 18, Vite, Three.js, GSAP, Poppins, Inter and Roboto Mono, and d3-geo with world-atlas for the land outline.
- **Globe** (`src/globe/`):
  - The Natural Earth 110m land outline is drawn once into an offscreen canvas and used as a land mask.
  - A hex grid on the sphere keeps only the cells that fall on land, and each one is an instance of a shallow six-sided prism.
  - The ball is a small shader: blue lit from the upper left, violet in shadow, with a pale rim. The camera pulls back in tall containers so the ball always fits.
- **Odometer** (`src/components/Odometer.jsx`): each digit is a strip of 0–9 repeated four times. A changed digit always rolls forward at least one full turn, then quietly rewinds.
- **URL options:** `?still` renders each page finished, with no intro and no live refresh. The app also respects the reduce-motion setting.

## Run it

```bash
npm install
npm run dev
```

## Deploy

Deploy on Vercel with Root Directory set to `orion` and the Vite preset. `vercel.json` sends every page address to `index.html`, so deep links work.
