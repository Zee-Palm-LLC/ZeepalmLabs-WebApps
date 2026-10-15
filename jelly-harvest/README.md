# Jelly Harvest

Live: [zeepalm-jelly-harvest.vercel.app](https://zeepalm-jelly-harvest.vercel.app)

A golden-hour farm full of squishy gummy animals that teaches real nutrition. Squish a cow for milk, a hen for an egg or a sheep for yogurt. Pick strawberries, apples, corn and pumpkins. Fill a harvest basket that tracks food groups and daily nutrition goals. No. 013 in the Zeepalm Labs material studies series, after [Heart Beat](../heartbeat) and [Vitamin Jelly](../vitamin-jelly).

It started from the "Jelly Harvest" WebGPU prompt and was reworked into a wholesome health product.

## What it does

### The farm
The whole scene is full screen. Everything is generated in code at load time: no models, images or textures.

- A red barn with a wreath and a cupola.
- A farmhouse with a porch, and a chicken coop with a ramp.
- Fenced pens, and a pond with reeds and lily pads.
- Autumn trees and an apple tree, corn rows, haystacks, and a scarecrow in a straw hat.
- A pumpkin patch, strawberry patches, wild mushrooms, and a pixel-letter **JELLY HARVEST** sign.
- Lanterns, floating pollen and about 15,000 wind-blown grass blades under a low golden sun.

### The herd
Twelve jelly animals, each with its own soft body:

- 2 cows
- 1 pig
- 3 sheep
- 2 hens
- 3 chicks, who follow their mum
- Marmalade the ginger cat, on a hay bale

They breathe, blink, chew, peck, graze, bounce, flap and swish their tails while wandering their pens.

### Gummy material
Each animal is translucent with:
- thickness-based colour absorption and refraction of the scene behind;
- approximate subsurface scattering and light transmission;
- Fresnel reflections, glossy highlights and tiny bubbles.

### Squish and stretch
Drag any animal. It stretches first, then slides along after your cursor. Let go and it wobbles back, then walks home. Tap an animal for a boop and its name tag.

### Harvest basket and nutrition tracker
Every food comes from the farm:

| Source | Food | Group |
|---|---|---|
| Cows | Milk | Dairy |
| Sheep | Yogurt | Dairy |
| Hens | Eggs | Protein |
| Truffle the pig | Mushrooms | Veg |
| Pumpkins | Pumpkin | Veg |
| Strawberry patches | Strawberries | Fruit |
| Apple tree | Apples | Fruit |
| Corn rows | Sweet corn | Grains |

The basket tracks:
- all five food groups;
- six daily-goal rings: protein, fibre, calcium, and vitamins A, C and D;
- total calories and natural sugars;
- a balance score;
- a tip that points you to whatever is missing.

Each animal card says what it gives and why that food is good for you.

### Light and controls
- **Light:** Golden Hour, Fresh Morning and Calm Dusk. Switching keeps the animals and physics as they are.
- **Floating panel:** sits over the right of the scene and hides with one click. It has Give It a Nudge, Reset Farm, Reset View, Pause, Lantern Glow, Farm Sounds, Firmness, Wobble, ¼ speed and Show Physics Mesh.
- **Animal list:** pick an animal to fly the camera to it.
- **Camera:** drag empty space to orbit, scroll or pinch to zoom, and right-drag or Shift-drag to pan.
- **Sound:** off by default. Birdsong and a breeze, plus synthesised moos, baas, clucks, cheeps, oinks and meows. Everything is Web Audio.
- **Keys:** Space pauses, N nudges, R resets the view, M shows the mesh, and 1, 2 and 3 pick the light.
- **Mobile:** the whole farm is framed in portrait and the panel becomes a bottom drawer.

Nutrition values are typical single servings, for fun and learning, not medical advice.

## How it works

### Shapes (`src/farm/anatomy.js`, `src/farm/build.js`)
Each animal is a signed distance field built from ellipsoids, capsules and spheres, smoothly blended into named parts: body, head, legs, ears, tail, wings, eyes. From that field, `build.js` makes:

- **Physics lattice:** a body-centred lattice of tetrahedra, slightly inflated so thin ears and tails still get cells. A lattice plane sits exactly at the feet, so animals stand on the ground rather than above it.
- **Render surface:** a smooth Surface Nets mesh with rest normals and per-vertex gummy materials. Each vertex is bound to a tetrahedron with barycentric weights.
- **Joint weights:** every particle gets blended weights for two parts, so joints bend smoothly.

### Physics (`src/farm/softbody.js`, `src/farm/creature.js`)
- **Solver:** XPBD with co-rotational per-tet shape matching, volume preservation, edge compliance, strain limits and edge damping. Particles collide with a cached terrain heightfield and have stick-slip friction.
- **Posing:** each frame, an animated rest pose is built from part rotations (walk cycles, pecks, tail swish, breathing, blinks) and the root transform. The body is pulled toward it with a soft anchor.
- **Walking:** the root moves animals around their pens. Hens' chicks follow her; sheep flock.
- **Grabbing:** a grab is a soft attachment with a bounded (tanh) reach.
- **Performance:** calm, idle animals rest on their animated pose without running physics. Grabbed, nudged, hopping and nearby walking animals run the full simulation.

### Rendering (`src/farm/GpuFarm.js`, `src/farm/shaders.js`)
Native WebGPU with WGSL. Each frame runs these passes:

1. A sun shadow map.
2. An MSAA pass for the sky and the lit world, with sun or moonlight, a hemisphere ambient, up to 24 point lights, fog, shadowed instanced grass and pond reflections.
3. A back-face thickness pass.
4. The gummy jelly pass, which refracts the resolved scene.
5. Additive glows and floating pollen.
6. A tone-mapping and bloom post pass.

Animal surfaces are skinned on the GPU. The vertex shader rebuilds each vertex from its tetrahedron's four particles, and the normal from the cofactor of the deformation gradient, so the CPU only uploads particle positions.

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Browsers without WebGPU see a short message asking for a recent Chrome, Edge or Safari over https.

## Deploy

The site is the Vercel project `jelly-harvest`, with Root Directory `jelly-harvest` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
