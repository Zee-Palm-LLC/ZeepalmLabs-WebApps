# Creatine Gummies

Live: [zeepalm-creatine-gummies.vercel.app](https://zeepalm-creatine-gummies.vercel.app)

A shop landing page for a creatine gummy brand, built in React. It is a pixel-perfect recreation of a Dribbble design video, with live 3D cans and motion added throughout.

## Design credit

Based on the Dribbble shot [Nutrition Website Design](https://dribbble.com/shots/27027157-Nutrition-Website-Design) by SuperDesign for Eloqwnt. The lifestyle photos and the manifesto image come from that shot's video. The code, the 3D cans, the motion and the interactions are ours. Credit the original shot when you post this.

## How it was matched

The shot is a 38.8 s screen recording that shows the site at half scale. Each section was rebuilt on a 1440 px wide composition and compared against still frames of the video, upscaled ×2. Positions were measured per element, mostly to within a few pixels.

- **Type:**
  - Alumni Sans Black for the display type.
  - Gelasio for the serif labels.
  - Figtree for body text.
  - Each was chosen by rendering candidates and scoring them against crops of the video.
- **Cans:**
  - Every can on the page is a real 3D model drawn with Three.js on a single transparent canvas over the page.
  - Each can follows a placeholder element, so it scrolls, scales and lines up with the layout like a normal element.
  - The labels are drawn in code for each flavor.
- **Photos:** cut from the sharpest frames of the video, upscaled with EDSR, with baked-in text removed.

## The page

| Section | What happens |
| --- | --- |
| Intro | A splash of the logo with three 3D cans rising, as in the video's first frame. Then the headline blurs in word by word while it shrinks into place, the can rises in, the button grows and the floor slides up. |
| Hero | Hard-cuts between the five flavors every 1.5 s, recoloring the whole page, as in the video. |
| Showcase | Pinned and driven by scroll. Each flavor's arched name turns like a wheel around the can, while the cans and lifestyle photos travel up and out and the next ones come in from below. |
| Flavors | Two cards per row. The hovered card grows and fades into its flavor color, the curved name slides in along its arc, and fruit doodles pop in. The tags on the dark card wipe open and their text slides up. **Shop Now** adds to the cart. |
| Manifesto | The four tags wipe open from their centers. Scrolling moves them away while the play button grows into the full manifesto image. **Play** runs a short caption reel over it. |
| Benefits | The headline sharpens word by word, the bento cards blur in, the photos drift with scroll, and the stats count up. |
| FAQ | The title and rows blur in. Each plus turns into a minus as its answer opens. **Show More** adds three more questions. |
| Finale | Three big cans rise with the scroll and lean toward the cursor, and the footer slides up over them. |
| Footer | Links scroll to each section. The newsletter field confirms a valid email, and a back-to-top button sits in the fruit cluster. |

A triangle cursor follows the pointer like the one in the video. It turns white over dark cards and photos.

Adding to the cart bumps the cart badge and shows a toast.

On phones, the hero, showcase and manifesto switch to their own 430 px compositions that fill the screen. The flavor grid, bento, FAQ and footer stack into one column.

## Fixes over the design video

- The design reuses the Strawberry Power blurb on several other flavors. Each flavor here has its own blurb.
- One card in the video is labelled with the wrong flavor. Every card here carries its own name.
- The footer's "Terms of Servise" is spelled correctly.
- The final call to action reuses the benefits subtitle in the video. It has its own line here.

## Notes

- `?still` skips the intro and shows the settled design. Add `&hero=berry` (or `apple`, `straw`, `lemon`, `choco`) to pick the hero flavor.
- The cart, newsletter and social links are front-end only.
- Motion is reduced when the system asks for it.

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

The site is the Vercel project `creatine-gummies`, with Root Directory `creatine-gummies` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
