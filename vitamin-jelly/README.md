# Vitamin Jelly

Live: [zeepalm-vitamin-jelly.vercel.app](https://zeepalm-vitamin-jelly.vercel.app)

A one-page product site for sugar-free vitamin jelly slices, built around a 3D citrus slice you can grab, stretch and let go.

## Credit

Based on the "Citrus Jelly" material study shared by Vib3Coded ([@vib3coded](https://x.com/vib3coded/status/2109424502237016076)). The layout, the soft-body slice and the control panel follow that study; the health content, the nutrition panel, the shop and all of the code are ours. Credit the original post when you share this.

## What it does

- **The slice** is a rounded half-moon of jelly with three zones: translucent fruit flesh inside, a pale pith band and a thin glossy rind along the arc. Inside it there are milky membranes between the segments, a few seeds, small air bubbles with a bright rim and pin-point highlight, and tiny sugar-crystal glints.
- **Grab it** anywhere with the mouse or a finger and pull. It stretches and folds, and when you let go it wobbles back into shape and settles in the middle.
- **Variety** switches between Orange, Blood Orange and Lemon. Each one changes the flesh, pith and rind colours, the tinted shadow, and the nutrition facts.

  | Variety | Benefit | Per slice |
  | --- | --- | --- |
  | Orange | Immune support | Vitamin C 90 mg, zinc 8 mg |
  | Blood Orange | Antioxidant recovery | Anthocyanins 40 mg, vitamin C 60 mg |
  | Lemon | Electrolyte hydration | Potassium 120 mg, sodium 80 mg |

- **Firmness** (log-mapped compliance) and **Internal damping** change the material live.
- **Give it a nudge** makes it hop with a twist, **Reset** drops it back in, **Pause** freezes it. Keys: Space pauses, N nudges, R resets.
- **Show mesh** draws the simulation's tetrahedra over the slice, and **¼ speed** plays the physics in slow motion.
- **Shop the jar** adds a jar to the bag, with a counter and a confirmation.

The nutrition values are illustrative.

## How the jelly works

**Physics** (`src/jelly/gpu/softbody.js`): an XPBD tetrahedral soft body.

- **Mesh:** the half-moon profile is triangulated with a Bowyer–Watson Delaunay, extruded into prisms and split into about 1,400 tets.
- **Constraints**, solved with many small substeps (12 per frame, one iteration each):
  - co-rotational shape matching per tet, with a warm-started quaternion (Müller 2016), which also recovers inverted tets;
  - volume preservation;
  - edge compliance;
  - hard strain limits between 0.35× and 1.8×.
- **Damping:** along the edges, plus light air drag and a settling pass that removes leftover jitter.
- **Floor contact:** Coulomb-style friction. A held patch is lifted rather than crushed into the floor.
- **Grab:** a soft attachment of the patch around the picked point, with a bounded reach.
- **Safety:** the slice resets if the simulation ever becomes invalid.

**Rendering** (`src/jelly/gpu/shaders.js`), in WebGPU:

- **Studio:** a procedural cyclorama paper sweep with an overhead softbox, a back-left strip light and a front-right fill card.
- **Shadows:** soft PCSS floor shadows, tinted by the jelly's colour.
- **The jelly:**
  - a back-face pass gives the thickness along each view ray, which drives Beer–Lambert absorption;
  - the scene behind is refracted through the slice;
  - inside, a 24-step march through the undeformed slice draws the zones, membranes, seeds, bubbles and glints, so they bend with the jelly;
  - studio reflections use Fresnel, plus a key highlight.
- **Post:** exposure, Khronos PBR Neutral tone mapping, sRGB and dither.

Browsers without WebGPU get the earlier Three.js version of the slice, so the page still works everywhere.

## Phones

Below 760 px the controls move into a bottom sheet behind a **Controls** button, the title shrinks, and the slice still responds to touch.

## Run it

```bash
npm install
npm run dev
```

`?still` skips the opening drop, which is useful for screenshots.

## Build

```bash
npm run build
```

## Deploy

The site is the Vercel project `vitamin-jelly`, with Root Directory `vitamin-jelly` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
