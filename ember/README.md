# Ember

Scroll-driven landing page for Ember, a wood-fire grill house. Everything we cook touches the fire.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes the production site to `dist`.

## The page, top to bottom

1. **Loader** (`components/Loader.jsx`): the grill heats from 20°C to 450°C while the video buffers.
2. **The cook** (`sections/FireStory.jsx`): a 900vh section with the steak video scrubbed by scroll. The EMBER title scatters like sparks, five chapters reveal word by word, a kitchen ticket checks off each step with a cook timer and side A/B, a probe shows core and grate temperature, and a clickable rail jumps between steps. The video's own flare fades into the next section.
3. **Manifesto** (`sections/Manifesto.jsx`): a burn front travels through the text as you scroll, each word flaring orange as it passes. A photo opens out and four facts count up.
4. **Three woods** (`sections/Woods.jsx`, `components/Flame.jsx`): a live canvas flame. Oak, cherry and mesquite each change its colour, height, speed and sparks, and the temperature rolls to match.
5. **The chamber** (`sections/DryAge.jsx`): pinned. Scrolling ages a hanging ribeye from day 1 to day 45: the meat darkens, the crust thickens, the weight drops and the flavour notes unlock.
6. **Build your steak** (`sections/CutBuilder.jsx`, `components/SteakSection.jsx`): pick a cut, weight and doneness to see a live cross-section, core temperature, grill and rest times and the price. The button carries the order into the booking form.
7. **Menu** (`sections/Menu.jsx`): a printed menu sheet with a vegetarian filter and photo previews that follow the cursor over the steaks.
8. **Book a table** (`sections/Reserve.jsx`, `lib/booking.js`): seating with mini floor plans, guests, the next 14 days (closed Mondays), time availability, validation, and a ticket that prints with a booking code.
9. **Find the fire** (`sections/Visit.jsx`): live open or closed status in London time, opening hours with today highlighted, and an illustrated map.
10. **Footer** (`sections/Footer.jsx`): embers rise, and the EMBER letters heat up under the cursor.

Also: a spark trail cursor (`components/SparkCursor.jsx`), and a "Fire" toggle that plays a generated fire-crackle ambience with a bell when the steak reaches the pass (`lib/sound.js`).

## Reduced motion

With `prefers-reduced-motion`, the loader, smooth scrolling, cursor and scroll-linked animation are off. The cook becomes a poster with the five steps listed, the flame becomes a still, and the chamber shows day 45.

## Video

`public/scrub.mp4` is encoded with every frame as a keyframe so scrubbing is instant in both directions:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -crf 24 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart public/scrub.mp4
```

Chapter timings live in `src/data.js` and the cook telemetry in `src/lib/cook.js`; both are tuned to this clip. `poster.jpg` and the `still-*.jpg` images are frames from it.

## Not real yet

Ember is a concept. The address, phone number (from the UK range reserved for drama), menu, prices and availability are placeholders, and the booking form doesn't send anything.
