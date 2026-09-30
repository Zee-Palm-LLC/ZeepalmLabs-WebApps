# Repline

Scroll-driven story page for Repline, a smart gym tech brand. One rep at a time.

Live: [zeepalm-repline.vercel.app](https://zeepalm-repline.vercel.app)

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes the production site to `dist`.

## Deploy

The site is the Vercel project `repline`, built from this repo with `repline` as the root directory, the Vite preset, `npm run build` and output `dist`. After pushing to `main`, create a new production deployment from the `main` branch in Vercel.

## The story, top to bottom

1. **Loader** (`components/Loader.jsx`) counts up while the video buffers, then lifts away.
2. **The lift** (`sections/ScrubStory.jsx`) is an 800vh section with a sticky full-screen video. Scroll position sets `video.currentTime` through an eased GSAP ticker. On top of the video sit the title, five frosted story cards with live widgets, a chapter rail you can click, and a telemetry strip (phase, frame, bar speed curve, height, power). The clip ends in a white flare that fades into the next section.
3. **Manifesto** (`sections/Manifesto.jsx`) lights the statement word by word, opens a photo from a clipped inset, and counts up the four specs.
4. **How it works** (`sections/HowItWorks.jsx`) scrolls four panels sideways while a lime line draws across all of them.
5. **Try a set** (`sections/LiveSet.jsx`) is a working demo. Pick a weight, lift reps, and the bar slows until speed drops 20% and the set is called.
6. **Features** (`sections/Features.jsx`) are three cards that tilt under the pointer, each with its own looping chart.
7. **Marquee** (`sections/Marquee.jsx`) speeds up, reverses and skews with scroll velocity.
8. **Pricing** (`sections/Pricing.jsx`) rolls the price in like an odometer.
9. **Waitlist** (`sections/Waitlist.jsx`) validates the email and fires a chalk burst on success.
10. **Footer** (`sections/Footer.jsx`) is revealed from under the page. The wordmark letters stretch towards the pointer.

Shared pieces: `App.jsx` sets up Lenis on the GSAP ticker and provides app state through `app-context.js`. `lib/lift.js` holds the simulated lift numbers, `lib/sound.js` the Web Audio drone and blips behind the sound pill, and `story.js` all the copy.

## Reduced motion

With `prefers-reduced-motion` on, the page skips the loader, smooth scrolling, cursor and every scroll-linked animation. The scrubbed video becomes a poster image with the five cards listed below it, and the sideways section stacks vertically.

## Video

`public/scrub.mp4` is encoded with every frame as a keyframe so seeking is instant in both directions. To swap the footage, re-encode the new clip the same way:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -crf 21 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart public/scrub.mp4
```

The card timings in `story.js` and the pull timing in `lib/lift.js` are tuned to this clip, so adjust them for new footage. `poster.jpg` and the `still-*.jpg` images are frames from the same clip.

## Not real yet

- The waitlist form does not send the email anywhere.
- All numbers are placeholders: the specs, the price, the telemetry and the set demo are simulated, not measured.
