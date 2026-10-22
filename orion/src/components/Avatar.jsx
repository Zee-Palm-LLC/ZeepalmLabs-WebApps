// Small illustrated people for avatar stacks. The source design uses photos;
// these keep the same size, ring and warm colour mix without stock images.
const looks = [
  { bg: '#F6C177', skin: '#8D5A3B', hair: '#2A1B14' },
  { bg: '#7DD3C0', skin: '#E7B48F', hair: '#3B2416' },
  { bg: '#B79CF6', skin: '#C68B62', hair: '#121212' },
  { bg: '#F49AA8', skin: '#F1C7A5', hair: '#6B3B1F' },
  { bg: '#8EC5FF', skin: '#5E3A26', hair: '#0E0B0A' },
  { bg: '#FFD36E', skin: '#D9A178', hair: '#7A2E1C' },
]

export function Avatar({ seed = 0, size = 32, ring = '#fff', style }) {
  const l = looks[seed % looks.length]
  return (
    <span className="avatar-face" style={{ width: size, height: size, boxShadow: `0 0 0 2px ${ring}`, ...style }}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" fill={l.bg} />
        <path d="M6 42c2-8 7.5-11 14-11s12 3 14 11z" fill={l.skin} opacity="0.9" />
        <circle cx="20" cy="18" r="7.5" fill={l.skin} />
        <path
          d={seed % 2 ? 'M12 18c0-7 4-10 8-10s8 3 8 10c-1.5-3.5-4.5-5-8-5s-6.5 1.5-8 5z' : 'M11.5 20c-1-8 3-12.5 8.5-12.5S29.5 12 28.5 20c-1-4-2.5-6-8.5-6.5S12.5 16 11.5 20z'}
          fill={l.hair}
        />
      </svg>
    </span>
  )
}
