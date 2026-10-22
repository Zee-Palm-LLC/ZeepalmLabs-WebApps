import { feature } from 'topojson-client'
import { geoEquirectangular, geoPath } from 'd3-geo'
import world from 'world-atlas/land-110m.json'

// Rasterises the Natural Earth land outline once, so hex cells can ask
// "is this latitude/longitude on land?" with a single pixel lookup.
export function makeLandMask(width = 1440, height = 720) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const projection = geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2])
  ctx.fillStyle = '#000'
  ctx.beginPath()
  geoPath(projection, ctx)(feature(world, world.objects.land))
  ctx.fill()
  const { data } = ctx.getImageData(0, 0, width, height)

  return (lat, lon) => {
    const x = Math.floor(((lon + 180) / 360) * width) % width
    const y = Math.min(height - 1, Math.max(0, Math.floor(((90 - lat) / 180) * height)))
    return data[(y * width + x) * 4 + 3] > 127
  }
}
