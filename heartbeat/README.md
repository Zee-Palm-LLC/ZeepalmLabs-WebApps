# Heart Beat

Live: [zeepalm-heartbeat.vercel.app](https://zeepalm-heartbeat.vercel.app)

A living 3D heart you can hold. Pick a pace, squeeze it, and feel the pulse. It's No. 011 in the same studio series as [Vitamin Jelly](../vitamin-jelly).

## What it does

- **The heart** floats above a paper studio sweep and beats on a real cardiac cycle:
  - the atria contract first;
  - then the ventricles squeeze and twist (systole);
  - then they relax.
  - You can see the dark blood-filled chambers through the glossy translucent muscle, shrinking on every beat. Coronary vessels and the fat-lined grooves run over the surface.
- **Grab it** anywhere with the mouse or a finger and pull. The muscle stretches and wobbles back.
- **Feel the pulse:**
  - while you hold it, a ring pulses under your finger on every beat;
  - on phones, it also vibrates;
  - turn on **Sound** to hear the lub-dub, synthesised live in the browser.
- **Pace:** Rest (62 bpm), Cardio (132 bpm) and Sprint (176 bpm), or any rate from 40 to 190 with the slider.
- **Live readout:**
  - a big BPM number that pumps on each beat;
  - a scrolling ECG trace synced to the heart;
  - stroke volume, cardiac output, percentage of max heart rate and a six-step zone bar.
- **Anatomy labels** for the right and left atria and ventricles and the apex. They track the heart as it moves and hide when that side turns away.
- **Give it a squeeze** compresses the heart and lets it bounce back. **Reset** and **Pause** do what they say.
- **Show mesh** draws the simulation's tetrahedra, and **¼ speed** slows the whole cycle.
- **Keys:** Space pauses, S squeezes, R resets, and 1, 2 and 3 pick Rest, Cardio and Sprint.

The numbers are an illustrative model, not medical advice.

## How it works

**Shape** (`src/heart/heart.js`):

- The heart is the classic implicit heart surface.
- It's filled with a body-centred lattice of about 1,700 tetrahedra for the simulation.
- The visible surface is a 10k-vertex icosphere projected onto the shape. Each vertex is bound to the tet that contains it, using barycentric weights.

**Physics** (`src/heart/softbody.js`): an XPBD soft body with many small substeps.

- **Constraints:** co-rotational shape matching per tet, volume preservation, edge compliance and strain limits.
- **Beat:** every frame the rest shape is recomputed from the cardiac cycle, so the muscle actively contracts toward it. The atria shrink toward their centre, the ventricles shrink and twist toward theirs, and a soft anchor keeps it home.
- **Grab:** a soft attachment with bounded reach.

**Rendering** (`src/heart/shaders.js`), in WebGPU:

- **Studio:** a cyclorama paper sweep with softbox, strip and fill lights.
- **Shadow:** a soft floor shadow tinted with the heart's red.
- **The heart:**
  - a back-face pass measures the thickness along each view ray;
  - the studio behind is refracted through the heart;
  - a 28-step march through the undeformed heart renders the muscle, blood-filled chambers that pulse in sync, glowing chamber linings and muscle fibres, with Beer–Lambert absorption;
  - the coronary vessels and fat grooves are drawn on the surface;
  - studio reflections use Fresnel, plus a key highlight.
- **Post:** PBR Neutral tone mapping.

**Timing** (`src/lib/cardio.js`): the cycle drives the contraction, the lub and dub sounds, the ECG waveform (P, QRS, T) and the stats, so everything stays in sync at any heart rate.

Browsers without WebGPU see a short message asking them to open the page in a recent Chrome, Edge or Safari.

## Run it

```bash
npm install
npm run dev
```

`?still` skips the opening drop.

## Build

```bash
npm run build
```

## Deploy

The site is the Vercel project `heartbeat`, with Root Directory `heartbeat` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
