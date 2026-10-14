# Vitamin Jelly

Live: [zeepalm-vitamin-jelly.vercel.app](https://zeepalm-vitamin-jelly.vercel.app)

A one-page product site for sugar-free vitamin jelly slices, built around a 3D citrus slice you can grab, stretch and let go.

## Credit

Based on the "Citrus Jelly" material study shared by Vib3Coded ([@vib3coded](https://x.com/vib3coded/status/2109424502237016076)). The layout, the soft-body slice and the control panel follow that study; the health content, the nutrition panel, the shop and all of the code are ours. Credit the original post when you share this.

## What it does

- **The slice** is a real 3D mesh: a half-disc with rounded edges, a peel ring, white pith and ten pulp segments, painted from a texture generated in code. It drops onto the table when the page opens.
- **Grab it** anywhere and drag. The slice stretches, folds and wobbles, then springs back when you let go. It is a soft body: a lattice of points joined by springs, solved several times per frame, with the mesh bent along with it.
- **Variety** switches between Orange, Blood Orange and Lemon. Each one changes the colours and the nutrition facts, and gives the slice a little bounce.

  | Variety | Benefit | Per slice |
  | --- | --- | --- |
  | Orange | Immune support | Vitamin C 90 mg, zinc 8 mg |
  | Blood Orange | Antioxidant recovery | Anthocyanins 40 mg, vitamin C 60 mg |
  | Lemon | Electrolyte hydration | Potassium 120 mg, sodium 80 mg |

- **Firmness** and **Internal damping** change how stiff and how wobbly the jelly is, live.
- **Give it a nudge** bounces the slice, **Reset** puts it back, **Pause** freezes it.
- **Show mesh** draws the wireframe, and **¼ speed** plays the physics in slow motion.
- **Shop the jar** adds a jar to the bag, with a counter and a confirmation.
- **Fullscreen** button in the corner.

The nutrition values are illustrative.

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
