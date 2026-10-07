# THAW

Live: [zeepalm-thaw.vercel.app](https://zeepalm-thaw.vercel.app)

An AI mental health landing page built in React. The hero is a pixel-perfect recreation of a Dribbble design. The rest of the page extends that design into a full product story.

## Design credit

The hero is based on the Dribbble shot [AI Mental Health Landing Page](https://dribbble.com/shots/27720547-AI-Mental-Health-Landing-Page) by Kris Anfalova. The frozen head imagery comes from that shot and its video. The code, the extra sections, the motion and the interactions are ours. Credit the original shot when you post this.

## The hero

The hero is matched to the shot on a 1440 × 974 canvas that scales to the window width. In a full-frame comparison against the shot, the settled hero differs by 3.8 colour levels on average (median 1.0). Text positions are within about 1 px.

- **Background:** the tile mosaic is rebuilt from tile colours measured in the shot and drawn in a WebGL shader. That keeps it crisp at any screen density.
- **Head:**
  - It is cut out of the shot with a difference matte against the rebuilt background.
  - The 360° turn comes from the shot's video: each frame has its text removed and is matted the same way.
  - The turn is stored as one MP4 with the colour and the alpha mask side by side, and drawn through a shader, so it works in every browser.
- **Type:**
  - TeX Gyre Heros Bold for the headline, a Helvetica-metric font under the GUST Font License.
  - Inter Tight for body text.
  - Reddit Mono for labels.
  - Each was chosen by rendering candidates and scoring them against the shot.

### Motion

1. The page opens frozen. Frost melts outward from the head while the head makes a full turn inside its ice block.
2. "Clarity Begins Here" types in letter by letter, each letter thawing from a frosted blur.
3. The panels wipe open:
   - the mono labels decode from scrambled characters;
   - the dot matrix lights up;
   - the cold-spot fill counts up to 50%;
   - the check-in bars spring up.
4. Afterwards:
   - **Ongoing motion:** the dots keep twinkling and the latest bars keep pulsing.
   - **Cursor:** tiles warm up near the cursor and the ice ripples where you hover.
   - **Drag:** drag the head to turn it yourself.
   - **Scroll:** scrolling away melts the mosaic column by column while the headline splits apart.

## The page

| Section | What happens |
| --- | --- |
| Signal ticker | Live readings scroll by. They speed up with scroll speed and reverse with scroll direction. |
| Approach | The statement thaws word by word as you scroll. Three pillars: Notice, Understand, Melt. |
| How it works | Four steps on a pinned horizontal track. A temperature readout warms from −12° to +4° as you go. |
| Inside a session | A sample conversation types itself out, and session notes fill in alongside. |
| Science | Method cards, counters, an example "thaw curve" that draws as you scroll, and privacy and clinical notes. |
| Plans | A monthly/yearly toggle with rolling-digit prices. |
| Begin your assessment | Three questions update a live reading: temperature, frost field, cold spot and a suggested first session. |
| Questions | An accordion of common questions. |
| Footer | A crisis-support line (988 in the US), links, and a giant wordmark that reforms as it scrolls in and ripples on hover. |

On phones the hero switches to its own layout. It zooms onto the head with the headline stacked over it, and the cards stack below. The intro and drag-to-turn still work. Every section has phone and tablet rules.

## Notes

- The chart data and the session conversation are illustrative, and are labelled that way on the page.
- `?still` skips the intro and shows the final design.
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

The site is the Vercel project `thaw`, with Root Directory `thaw` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
