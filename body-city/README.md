# Body City

Live: [zeepalm-body-city.vercel.app](https://zeepalm-body-city.vercel.app)

Your body as a tilt-shift miniature city. Blood vessels are highways, organs are districts, and every meal, glass of water, walk, workout and night of sleep changes the traffic live. No. 014 in the Zeepalm Labs material studies series, after [Jelly Harvest](../jelly-harvest).

Everything is generated in code at load time: no models, images or textures.

## What it does

### The city
A life-size-proportioned human figure on a tabletop, seen through a tilt-shift lens so it reads like a model railway. The body is eight heads tall and stands in anatomical position. It has a shaped head and ears, a neck and trapezius, broad shoulders, a ribcage that narrows to the waist and widens again at the hips, and separate fingers and thumbs. The legs taper through the thighs, knees and calves to the feet. The body is sculpted like a bas-relief statue lying on the table. It has a domed head, a rounded chest and belly, and cylindrical limbs. The face is serene and asleep: a brow ridge, closed eyelids with lashes, eyebrows, a nose with nostrils, lips, a chin and ears. The muscle relief includes the collarbones, sternum, pecs, abs, navel, deltoids, biceps, forearms, quads, kneecaps, calves and shins.

The body is made of translucent silicone jelly:
- a glossy clear-coat with sharp sun glints, studio-softbox streaks along every curve, and a Fresnel sheen;
- light glows through the thin edges, while thick areas look deeper and more saturated;
- the organs sit inside the jelly as a blurred inner layer that shifts with the view angle as you orbit;
- tiny trapped bubbles twinkle, and the body casts a rose-tinted light onto the table.

The jelly is alive. It breathes gently, ripples around the heart on every beat, wobbles outward from wherever you tap, and ripples from the stomach whenever you eat. Roads, buildings and vehicles ride the wobble.

The skin is painted at high resolution with a real skin tone, mottling, pores and blush on the cheeks, knees, elbows, knuckles and fingertips. Under the skin you can see the anatomy, as in a medical model:
- the brain's folds;
- the trachea and bronchi;
- both lungs, with their branching airways and fissures;
- the heart, with its coronary vessels;
- the diaphragm, liver, gallbladder, the J-shaped stomach, spleen and pancreas;
- the kidneys, with adrenal glands and ureters;
- the bladder;
- the colon, with its pouches, framing the coiled small intestine;
- faint ribs, sternum, clavicles, pelvis and kneecaps.

Blue surface veins run along the arms, hands, neck and legs, and fine capillaries branch off every artery into the tissue. The hands have palm and finger creases, and the feet have toes with toenails. Organs sit where they really are: the body's left is on your right, as if the figure is facing you.

| District | What it does in the city |
|---|---|
| Brain HQ | Domed mission control with drifting thought sparks. Brightness follows Focus. |
| Heart Power Station | Just left of centre in the chest. Four chambers pulse with every beat, at your heart rate. All traffic leaves from here. |
| Lung Greenhouses | Two greenhouse districts either side of the heart (the left one smaller), with wind turbines that spin faster as your heart rate rises. Red-cell pods load oxygen here. |
| Stomach Market | Under the left ribs. Striped stalls, where each meal arrives as crates that are unpacked over time. |
| Liver Recycling Plant | Under the right ribs. Stores spare glucose as glycogen. |
| Insulin Department | Tucked behind the stomach. Sends flashing insulin vans when blood sugar climbs. |
| Kidney Water Works | A pair of water towers on the renal arteries. The blue level shows hydration. |
| Gut Canal | The small intestine coils through the middle and the colon frames it, ascending, transverse and descending. Boats follow food the whole way and speed up while you digest. |
| Fat Storage Silos | On the hip. They fill when you eat more than you use and empty during workouts. |
| Arm and Leg Muscle Works | Construction sites with cranes on the biceps and outer thighs. Floors go up as protein arrives after training and during sleep. |
| Mitochondria | Glowing power plants in the shoulders, forearms, thighs and calves that light up when you exercise. |

### Traffic
Every vessel is a two-lane road: a red lane carries deliveries out from the heart and a blue lane brings them home. The roads follow the real arterial tree:
- the aortic arch, with both carotids up the neck and the subclavians out to the shoulders;
- the brachial arteries down the inner arm, then the forearms to the palms;
- the pulmonary arteries to both lungs;
- the descending aorta, with the celiac branches to the liver and stomach and the renal arteries to both kidneys;
- the iliac split at the pelvis, then the femoral arteries down the inner thighs and the tibial arteries to the feet.
 Hundreds of vehicles drive with car-following, so they queue and brake like real traffic:

- red-cell oxygen pods;
- glucose, protein, fat and water trucks;
- insulin, repair-crew and brain clean-up vans with flashing lights.

What gets sent where depends on the sim: workouts send oxygen and glucose to the legs, sleep sends repair crews to the muscle sites and clean-up vans to the brain, and a water glass sends water trucks to the kidneys.

### The day
- **Feed the city:** salad, eggs, salmon, oats, banana, white rice, a doughnut or a soda. Each has its own carbs, protein, fat, fibre and speed of digestion. Fibre and protein release energy slowly; a soda floods the highways with glucose trucks, the edge lines turn amber and the aorta jams, with brake lights.
- **Drink water:** tops up the water towers.
- **Walk, Workout, Sleep:** heart rate, traffic speed and destinations change. Sleep jumps to bedtime, turns the city to night with lit windows and streetlights, and runs fast until morning.
- **Vitals:** blood sugar (mg/dL), heart rate, hydration, glycogen, focus, muscle, fat stores and rest, with warning pulses when something is off.
- **City news:** a live feed of what just happened, such as sugar rushes, insulin dispatches, low fuel and new muscle floors.
- **Districts:** tap a district or its label to fly the camera there and read what it does, plus a health tip.

### Controls
- **Floating panel:** sits over the right of the scene and hides with one click. On phones it becomes a bottom drawer.
- **Camera:** drag to orbit, scroll or pinch to zoom, and right-drag or Shift-drag to pan. Tap the body to make the jelly wobble.
- **Toggles:** district labels, the tilt-shift lens and pause.
- **Keys:** Space pauses, R resets the view, L toggles labels, T toggles tilt-shift and W drinks water.

This is a playful model for fun and learning, not medical advice.

## How it works

### Board and roads (`src/city/body.js`, `src/city/build.js`)
- **Body shape:** a signed distance field gives the silhouette. The torso and head are smoothly blended ellipses and capsules; the limbs are tapered capsules for the deltoids, biceps, forearms, hands, five fingers, thighs, knees, calves and feet. Arms join the torso with a hard union, so the armpits stay crisp.
- **Volume:** every part also has a dome profile, a superellipse cross-section scaled by the part's radius. They are combined with a smooth maximum to make a bas-relief height field. Gaussian bumps and ridges add the face and muscle detail.
- **Grid:** the field is baked once into a 0.05-unit grid. Runtime height lookups, for vehicles, buildings and glows, are bilinear reads from that grid.
- **Board mesh:** built from the grid. Normals come from finite differences, and crevice ambient occlusion comes from comparing each point with a blurred height. Vertices just outside the body are snapped onto the silhouette along the field's gradient, so the outline stays smooth.
- **Skin texture (`src/city/skin.js`):** a 1536 × 3552 canvas painted in world units: skin, organs, bones, veins, capillaries, face and hand details, sidewalks, grass, and building contact shadows. A second mask canvas marks which pixels are skin. A per-pixel pass blends the tabletop around the silhouette with a soft contact shadow. Mipmaps are box-filtered in JavaScript and uploaded to an sRGB texture.
- **Buildings:** placed on the lowest corner of their footprint and extended down, so they sit flush on curved skin. Steep spots and the face are kept clear.
- **Roads:** a node graph from heart to limbs, smoothed with Catmull-Rom splines into two-lane strips, five vertices across, that follow the curved skin. A breadth-first tree from the heart gives each district a route.
- **Scenery:** every building, tree, dome, greenhouse, tank, silo, crane and streetlight is built from boxes, cylinders, spheres and lathes into one static mesh.

### Simulation (`src/city/sim.js`)
- **Metabolism:** a small model of digestion, blood glucose, insulin, glycogen, fat, protein, muscle, hydration, sleep debt, heart rate and focus. It runs at 2 sim minutes per second, or 14 while asleep.
- **Vehicles:**
  - each vehicle picks a destination and cargo weighted by the current state;
  - it follows its route lane by lane, keeping its distance from the car ahead;
  - it waits at the heart until its entry lane is clear.
- **Sugar jam:** high blood sugar narrows the roads past the lower junction, so trucks back up toward the heart.

### Rendering (`src/city/GpuCity.js`, `src/city/shaders.js`)
Native WebGPU with WGSL. Each frame runs these passes:

1. A sun or moon shadow map, 4096 px on desktop, covering the static city and all instances.
2. An MSAA HDR pass. The jelly shading:
   - samples the anatomy texture twice: a sharp surface layer, and a blurred, view-parallax inner layer;
   - uses thickness from the surface height for edge transmission and deeper colour;
   - adds very wrapped diffuse lighting, Fresnel sky reflection, three softbox highlights, a sun glint and bubble sparkles.

   The vertex shader adds a jelly displacement: breathing, a heartbeat bulge, and a tap or meal ripple with a travelling front. It is scaled by height, so the edges stay on the table, and its gradient bends the normals. The table tints the body's shadow rose. Vehicles tilt to follow the slope. The pass also draws:
   - the sky;
   - the lit city: lane-coloured roads with moving edge lights, rippling water, glass, and window grids that light up at night;
   - instanced vehicles, heart chambers, turbine blades, cranes, crates, tank and silo levels, muscle floors and boats.
3. Additive glows for streetlights, the heart, mitochondria, brain sparks, van beacons and brake lights.
4. A tilt-shift post pass: a depth-of-field blur that follows the camera target, then saturation, vignette and tone mapping.

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
