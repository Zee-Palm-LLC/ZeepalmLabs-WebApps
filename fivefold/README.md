# Fivefold

A landing page for a health and fitness coaching brand, built in React. It recreates the layout, type, colours, motion and scroll flow of the site shown in a short screen-recorded reel, rethemed from creative workshops to training. Every part of it works.

## Credit

Based on the site in the TikTok reel [How I build with Lovable](https://www.tiktok.com/@webloved/video/7695747643468713238) by weblove (@webloved). The original is a creative-workshop studio. The layout and visual direction come from it. The code, the fitness content, the smoke shader, the interactions and the stage visuals were rebuilt from scratch here. Credit the original reel when you post this.

## The idea

The page tells one story: a training journey in five stages, **Assessment → Training → Breakthrough → Progress → Habit**. Every section shows the same five stages in a different shape:

| Section | What it does |
| --- | --- |
| Hero | “Training Flow” rises in letter by letter while five tilted glass cards, one per stage, float up. The cards follow the mouse, light up on hover and open their stage on click. When you scroll, they straighten into a row. |
| Process | Five SVG loops on one line, sized by meaning (Breakthrough is the tallest). They draw themselves as you scroll in. The loop for the stage you're on glows and carries a spark, and you can hover or click any loop to jump to its stage. |
| 01 Assessment | A baseline board: energy, resting heart rate, sleep, move goal, a live heart-rate trace, macros, movement and baseline numbers. Drag the tiles around; **Tidy board** puts them back. |
| 02 Training | A 24-hour recovery clock over a red glow with rising embers, from “recovering” to “ready to train”. Click to pause, resume or restart. |
| 03 Breakthrough | “PR.” bursts out of a ring of light rays. Hover to pulse it, click to replay. |
| 04 Progress | Strength, Hybrid and Cardio programs scored on gains, time and enjoyment. The bars grow, a frame scans the options and settles on the best fit. Click any program to choose it instead. |
| 05 Habit | A streak loop draws itself as you scroll, counting from Week 1 to Week 12 until the habit is locked in. Click to replay. |
| Programs | Kickstart, Transform and Elite Coaching. The button on each card picks the program and takes you to the form with it attached. |
| Contact | A working enquiry form with validation, training-days chips, a sending state and a confirmation. Enquiries are saved in the browser (`localStorage`, key `fivefold:enquiries`). |
| Footer | The wordmark rises letter by letter as you reach the end. |

Throughout the page:

- A WebGL smoke background changes mood with each section.
- The five dots next to the logo fill up as you move through the stages.
- An amber ring cursor shows what a click will do.
- Smooth scrolling is handled by Lenis.

## How it was matched

- **Frames:** the reel films a laptop at an angle. Ninety frames were pulled from it, the screen was rectified with a homography, and the result was corrected for perspective drift so that symmetric margins line up.
- **Aspect ratio:** comparing glyph proportions against the real font shows the browser viewport is about 1440 × 740. The layout is designed on that frame and scales with the window (`1rem = min(100vw / 90, 100vh / 46.25)`).
- **Type:** Outfit (variable), with sizes solved from measured ink widths: 210 px for the hero title, 58 px for headings, 104 px for stage numbers. Labels use JetBrains Mono.
- **Screenshots:** the page was captured at 1440 × 740 in headless Chrome and compared side by side with the rectified frames for every section.

## Phones and tablets

Below 900 px the page switches to a layout built for touch:

- **Nav:** a frosted bar fades in once you scroll. It has a compact **Book** button and a burger that opens a full-screen menu.
- **Hero:** the five stage cards fan out like a hand of cards. Below them are a full-width **Book a session** button and a link to the process.
- **Process:** the loops turn vertical. They weave down a centre line with the stage names beside them, and they draw, glow and spark as you scroll, just like on desktop.
- **Stages:** each stage stacks its text over a square card sized for the visual.
- **Programs:** a swipeable carousel with pager dots.
- **Form:** full-width chips and button, with 16 px inputs so phones don't zoom in.
- **Tablets (600–899 px):** larger cards and a wider carousel.
- **Safe areas:** spacing respects the notch and the home indicator.

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
