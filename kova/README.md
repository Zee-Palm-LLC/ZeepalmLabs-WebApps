# KOVA Hydration

Live: [zeepalm-kova.vercel.app](https://zeepalm-kova.vercel.app)

A scroll-driven 3D product site for KOVA, an original zero-sugar electrolyte drink brand made for training and recovery. The layout and motion follow a "Websites in 2026" TikTok reel by @wearebrand.io. The brand, can designs, copy and colours are all original and rebuilt in the fitness niche.

Every can is real-time 3D geometry with labels painted in code, so the site uses no images or 3D model files.

## What it does

### 1. Flavour carousel (hero)
- Eight glossy aluminium cans float on a curved arc under a glowing halo lamp. The centre can is larger, tilted and spotlit, and the others drift and spin slowly.
- Arrows, dots, arrow keys, clicking a side can or dragging sideways all swap the flavour. The name pops up on a 3D pedestal in chunky italic type, with a rainbow glow along the bottom edge.
- **Live HUD:**
  - a per-can nutrition panel with animated bars;
  - a taste-profile meter (sweet, tart, fresh, cool) that changes with each flavour;
  - the price, with an "Add box" button that drops the flavour into the shop;
  - a rating badge.

### 2. The dive (pinned, scroll-scrubbed)
- As you scroll, the other cans fall away and the hero can flies to the right. The whole stage floods with that flavour's colour as smoke rolls in.
- The can turns upright and spins slowly while four feature panels take turns: Zero sugar, Three electrolytes, B-vitamin complex and Clean ingredients.
- A glowing ring scans down the label, a side nav lets you jump between features, and a counter tracks your progress.
- Each feature has its own animated chart:
  - sugar bars against other drinks;
  - electrolyte ring gauges;
  - B-vitamin % NRV segment meters;
  - clean-ingredient chips.
- A giant outlined step number and a spec ticker run underneath.

### 3. Zero sugar
A smoke burst fills the screen in the flavour's colour, and a giant "ZERO SUGAR." headline lands through it as the can spins away upward.

Four stat chips spring in under the headline.

### 4. Sweat lab
An interactive calculator:
- **Inputs:** body weight, session length and temperature sliders, plus easy, steady, hard or race intensity.
- **Outputs:** animated sweat loss, sodium lost, body-weight drop and cans to drink, with a drinking-plan timeline and a warning above 2% weight loss.
- **Shortcut:** a button adds the right number of boxes to the shop.

### 5. The range
All eight cans sweep across the screen on a diagonal as you scroll. A flavour legend and a detail card highlight each one as it passes.

### 6. Marquee, comparison, athletes and stats
- **Marquee:** a two-row velocity marquee that speeds up and skews with your scroll speed.
- **"What is really in your bottle?":** an animated bar chart comparing KOVA with a sports drink, cola, orange juice and water. Tabs switch between sugar, calories, sodium and potassium.
- **"The crew":** a pinned sideways scroll of athlete cards, each with a stat, a quote and a flavour, plus a scroll progress bar.
- **Counters:** count-up figures for cans drunk, partner gyms, rating and sugar.

### 7. FAQ
A huge extruded "GOT ANY QUESTIONS?" headline over a diagonal light beam, with an eight-question accordion. A sticky side column has category filters (All, Ingredients, Training, Orders) with counts and an "Ask a nutritionist" card.

### 8. Join the crew
- The can drops back in under a light cone.
- A glowing email signup validates the address and confirms, with member perks and avatar social proof.
- A four-column footer ends with a giant gradient KOVA wordmark. The can flies away as the footer arrives.

### Everywhere
- **Nav:** a scroll-progress line, a sound toggle with a live equaliser, the KOVA logo, Menu, and a glowing Shop button.
- **Sound:** a synthesised ambient score whose filter opens as you scroll, plus whooshes on flavour changes and ticks on clicks.
- **Menu:** a full-screen menu with staggered links that scroll to each section.
- **Shop:** a "Build your box" drawer with 12 or 24-can packs, per-flavour steppers, a live total and a badge on the Shop button.
- **Loader:** a can fills up while a percentage counts to 100.
- **Cursor:** a custom blend-mode cursor that grows over cans and says "Drag" in the carousel.
- **Mobile:** a dedicated layout with a tighter carousel, bottom-anchored feature copy and viewport-scaled headlines.

## How it works

- **3D:** React Three Fiber, drei and postprocessing.
  - One fixed canvas renders every can. Each can's position, rotation and scale are worked out each frame from the scroll progress of the current section, then eased toward that target, so every transition is continuous.
  - Studio light formers give the metal its reflections. Bloom and a vignette finish the image.
- **Cans (`src/three/can.js`):** lathe-turned top and bottom with a rolled rim, an open cylinder body and a pull tab. Each label is a 2048×1024 canvas painted with the logo, flavour text, nutrition panel and barcode, on a physical clear-coat material.
- **Smoke:** a full-screen domain-warped fbm shader plane tinted per flavour, driven by the dive and zero-sugar progress.
- **Scroll:** Lenis smooth scrolling on the GSAP ticker, with ScrollTrigger ranges for the dive, zero, range, FAQ and join sections writing into a shared store that the 3D scene reads.
- **Background:** CSS gradient layers (the hero sweep, the flavour flood and the diagonal beam) cross-fade from scroll progress through CSS variables.

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
