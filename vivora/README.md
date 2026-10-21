# VIVORA

Live: [zeepalm-vivora.vercel.app](https://zeepalm-vivora.vercel.app)

An immersive, scroll-driven landing page for VIVORA, an original health and fitness training brand covering programmes, coaching and a members club. The layout and motion follow the Alche Studio site as featured in an "iridescent shattered type" TikTok by weblove (@webloved). The brand, mark, copy, colours and photography are all original and rebuilt for the fitness niche.

## What it does

### 1. Loader
- Construction lines draw the V mark: guide grids, circles and triple-stroke diagonals, with a typed tagline and a progress stroke.
- A sound prompt bar asks whether to turn sound on, then the drawing dissolves into the hero.

### 2. Hero
- A spinning glass dumbbell (transmission, chromatic aberration and iridescence) refracts a curved wall of tiles lit in heart-rate-zone colours, with a huge brushed VIVORA wordmark behind it.
- **Live workout HUD** (demo data): beating BPM, a Z1–Z5 heart-rate zone bar, a scrolling ECG trace, kcal and pace.
- A heartbeat line sweeps across the hero, and an "Upcoming" list shows classes.
- A **Dumbbell Material** panel changes the glass roughness, wordmark texture and colour live. Drag anywhere to spin the dumbbell.

### 3. TRAIN
Extruded chrome "TRAIN" type with 34 photo and iridescent shards that drift with the mouse at different depths, then burst apart as you scroll.

### 4. Programmes
A pinned, curved carousel of six programmes (HIIT Burn, Strength Lab, Fight Fit, Spin Rush, Run Club, Flow & Recover). Cards bend on a ring, split RGB with scroll speed, and the info panel decodes the level, title, stats and tags with a scramble effect.

### 5. Mission and MOVE
- A curved wipe reveals a light section with a drawn dumbbell wireframe and "Built for every body that wants to move".
- A huge outlined MOVE title, a flowing lime and orange slab and highlighted "Train smarter / live stronger" lines follow. The slab then zooms to fill the screen.

### 6. Coaching
- A warped, colour-split "COACHING" panel grows out of the light section.
- Three pinned services follow (Smart Coaching, Nutrition Plans, Personal Training), each with a tilted photo card in a 3D grid room and glitch transitions.

### 7. vivoclub and footer
- The members club appears over a gym photo, with letter-by-letter type and a twinkling sparkle.
- The outro draws construction lines while the white V mark settles over a giant grey VIVORA wordmark, then the footer links fade in.

### Everywhere
- **Header:** the nav theme switches between dark and light by section, with a "Start free trial" pill and a sound toggle (generated ambient score).
- **Side index:** an index tracks the current section.

## How it works

- **3D:** React Three Fiber and drei. One fixed canvas renders the hero, TRAIN and the carousel. Section canvases mount only near the viewport.
- **Motion:** Lenis smooth scrolling on the GSAP ticker. ScrollTrigger progress is damped before any scene reads it, so every transition eases.
- **Generated assets:** the wordmark texture, card key art, shaders (tile wall, slab, warp) and the dumbbell geometry (one merged mesh, so the glass renders in a single pass) are all made in code.
- **Photos:** in `public/images`, AI-generated for this project.
- **Content:** all copy, programmes and classes are placeholders in `src/data/content.js`.

## Run it

```bash
npm install
npm run dev
```

Dev helpers: `/?skipintro` skips the loader. `/?skipintro&at=works:0.5` jumps halfway through a section (`top`, `works-intro`, `works`, `about`, `service-intro`, `services`, `labs`, `outro`).

## Build and deploy

```bash
npm run build
```

Deploy the `dist` folder, for example with `vercel --prod` from this folder.
