import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Calendar03Icon,
  Calendar04Icon,
  Cardiogram02Icon,
  Clock01Icon,
  ComputerVideoIcon,
  DashboardSquare01Icon,
  InstagramIcon,
  Linkedin01Icon,
  Logout05Icon,
  Message02Icon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  NewTwitterIcon,
  Notification01Icon,
  PlusSignIcon,
  Search01Icon,
  Tick02Icon,
  UserCircleIcon,
  WorkoutRunIcon,
  YoutubeIcon,
  SentIcon,
  Share08Icon,
  MinusSignIcon,
  Call02Icon,
  Video01Icon,
  SmileIcon,
  Attachment01Icon,
  SidebarRightIcon,
  Mail01Icon,
  Home01Icon,
  File02Icon,
  RepeatIcon,
  Location01Icon,
  Bookmark02Icon,
  PlayIcon,
  ChickenThighsIcon,
  Bread04Icon,
  FilterHorizontalIcon,
  DropletIcon,
  FilterIcon,
  StarIcon,
  SpoonAndForkIcon,
  Pen01Icon,
  Pot02Icon,
  LeftToRightListNumberIcon,
  HeartCheckIcon,
  WorkoutSquatsIcon,
  EquipmentBenchPressIcon,
  PushUpBarIcon,
  Bicycle01Icon,
  EquipmentWeightliftingIcon,
  WorkoutKickingIcon,
  WorkoutStretchingIcon,
  Yoga01Icon,
  UnfoldMoreIcon,
  Dumbbell01Icon,
  DashboardSpeed02Icon,
} from '@hugeicons/core-free-icons'
import { GLYPHS } from './glyphs.js'
import { useOrigin } from './prim.jsx'

const line = (d, extra = {}) => ['path', { d, stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '1.5', ...extra }]
const ring = (cx, cy, r, extra = {}) => ['circle', { cx, cy, r, stroke: 'currentColor', strokeWidth: '1.5', ...extra }]

const custom = {
  stats: [line('M3.5 20.5H21'), line('M4.5 20.5V13.5H9V20.5'), line('M9 20.5V9H13.5V20.5'), line('M13.5 20.5V4H18V20.5')],
  dumbbell: [
    line('M2 12H3.5M20.5 12H22M8.5 12H15.5'),
    line('M3.5 9.6C3.5 8.7 4.1 8.2 4.8 8.2C5.6 8.2 6.1 8.7 6.1 9.6V14.4C6.1 15.3 5.6 15.8 4.8 15.8C4.1 15.8 3.5 15.3 3.5 14.4Z'),
    line('M6.1 7.2C6.1 6.1 6.6 5.5 7.3 5.5C8 5.5 8.5 6.1 8.5 7.2V16.8C8.5 17.9 8 18.5 7.3 18.5C6.6 18.5 6.1 17.9 6.1 16.8Z'),
    line('M20.5 9.6C20.5 8.7 19.9 8.2 19.2 8.2C18.4 8.2 17.9 8.7 17.9 9.6V14.4C17.9 15.3 18.4 15.8 19.2 15.8C19.9 15.8 20.5 15.3 20.5 14.4Z'),
    line('M17.9 7.2C17.9 6.1 17.4 5.5 16.7 5.5C16 5.5 15.5 6.1 15.5 7.2V16.8C15.5 17.9 16 18.5 16.7 18.5C17.4 18.5 17.9 17.9 17.9 16.8Z'),
  ],
  badge: [
    line('M6.5 2.75H17.5C18.9 2.75 19.75 3.6 19.75 5V19C19.75 20.4 18.9 21.25 17.5 21.25H6.5C5.1 21.25 4.25 20.4 4.25 19V5C4.25 3.6 5.1 2.75 6.5 2.75Z'),
    line('M9.5 6H14.5'),
    ring(12, 11.25, 2.5),
    line('M7.75 17.5C8.4 15.6 10 14.6 12 14.6C14 14.6 15.6 15.6 16.25 17.5'),
  ],
  bowl: [
    line('M3 12.5H21'),
    line('M3.4 12.5C3.9 16.3 6.8 19.1 10.4 19.4H13.6C17.2 19.1 20.1 16.3 20.6 12.5'),
    line('M9.5 19.4V21H14.5V19.4'),
    line('M5 12.5C5 8.4 8.1 5.1 12 5.1C15.9 5.1 19 8.4 19 12.5'),
    line('M8.5 12.5C8.5 9.8 10.3 7.4 13 6.4'),
    line('M12 12.5C12 10.4 13.4 8.5 15.6 7.6'),
    line('M15.4 12.5C15.4 11.2 16.2 10 17.5 9.3'),
  ],
  flame: [
    line('M12 21.5C8 21.5 5 18.7 5 14.9C5 11.6 7 9.3 9.2 6.9C9.6 8.4 10.4 9.5 11.5 10.1C11.9 6.9 13.2 4.3 15.4 2.5C15.7 5.4 17.4 7.1 18.4 8.6C19.4 10.2 19.8 11.9 19.8 13.7C19.8 18.1 16.4 21.5 12 21.5Z'),
    line('M9.5 17.3C10.1 18.3 11.1 18.8 12.3 18.8'),
  ],
  steps: [
    line('M8.5 3.2C6.6 3.2 5.5 5 5.5 7.6C5.5 9.5 6.1 11.3 6.7 12.6H10.3C10.9 11.3 11.5 9.5 11.5 7.6C11.5 5 10.4 3.2 8.5 3.2Z'),
    line('M6.8 15.2H10.2V16.9C10.2 18 9.4 18.8 8.5 18.8C7.6 18.8 6.8 18 6.8 16.9Z'),
    line('M15.5 5.2C13.6 5.2 12.5 7 12.5 9.6C12.5 11.5 13.1 13.3 13.7 14.6H17.3C17.9 13.3 18.5 11.5 18.5 9.6C18.5 7 17.4 5.2 15.5 5.2Z'),
    line('M13.8 17.2H17.2V18.9C17.2 20 16.4 20.8 15.5 20.8C14.6 20.8 13.8 20 13.8 18.9Z'),
  ],
  medal: [
    ring(12, 9, 6.25),
    ring(12, 9, 3.25),
    line('M8.75 14.4V21.25L12 19.25L15.25 21.25V14.4'),
  ],
  coin: [
    line('M13 3C17.4 3 21 7 21 12C21 17 17.4 21 13 21'),
    line('M11 3C6.9 3 3.5 7 3.5 12C3.5 17 6.9 21 11 21H13C9.1 21 6 17 6 12C6 7 9.1 3 13 3H11Z'),
    line('M15.5 12C15.5 9.5 14.8 7.3 13.7 5.8M15.5 12C15.5 14.5 14.8 16.7 13.7 18.2'),
  ],
  level: [line('M3.5 20.5H20.5'), line('M5 20.5V14.5H9V20.5'), line('M9 20.5V10H13V20.5'), line('M13 20.5V5.5H17V20.5')],
  star: [ring(12, 4.6, 2.1), line('M3.5 9.4H20.5L15.2 13.4L17.2 20.6L12 16.9L6.8 20.6L8.8 13.4Z')],
  yoga: [ring(12, 4.6, 2.1), line('M3.5 10.2H20.5'), line('M12 10.2V14'), line('M12 14L6.6 20.5'), line('M12 14L16 16.6V20.8')],
  facebook: [ring(12, 12, 9.75), line('M12.5 21.75V12.6C12.5 10.3 13.3 9 15.6 9H16.5'), line('M10 13.2H15.5')],
  starfill: [['path', { d: 'M12 2.8L14.75 8.4L20.9 9.3L16.45 13.65L17.5 19.8L12 16.9L6.5 19.8L7.55 13.65L3.1 9.3L9.25 8.4Z', fill: '#FFD43B', stroke: '#FFD43B', strokeWidth: '1.2', strokeLinejoin: 'round' }]],
  flag: [['path', { d: 'M5 21V4.5M5 4.5C7.5 3.2 9.3 3.6 11.2 4.6C13.2 5.7 15.3 6 19 4.6V13C15.3 14.4 13.2 14.1 11.2 13C9.3 12 7.5 11.6 5 12.9', fill: 'currentColor', stroke: 'currentColor', strokeWidth: '1.5', strokeLinejoin: 'round', strokeLinecap: 'round' }]],
}

const hi = {
  dashboard: DashboardSquare01Icon,
  schedule: Calendar03Icon,
  date: Calendar04Icon,
  classes: ComputerVideoIcon,
  messages: Message02Icon,
  run: WorkoutRunIcon,
  search: Search01Icon,
  bell: Notification01Icon,
  dots: MoreHorizontalIcon,
  vdots: MoreVerticalIcon,
  down: ArrowDown01Icon,
  left: ArrowLeft01Icon,
  right: ArrowRight01Icon,
  up: ArrowUp01Icon,
  plus: PlusSignIcon,
  tick: Tick02Icon,
  clock: Clock01Icon,
  user: UserCircleIcon,
  logout: Logout05Icon,
  x: NewTwitterIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: Linkedin01Icon,
  heart: Cardiogram02Icon,
  close: Cancel01Icon,
  speed: DashboardSpeed02Icon,
  squat: WorkoutSquatsIcon,
  bench: EquipmentBenchPressIcon,
  pullup: PushUpBarIcon,
  bike: Bicycle01Icon,
  lift: EquipmentWeightliftingIcon,
  kick: WorkoutKickingIcon,
  stretch: WorkoutStretchingIcon,
  yogapose: Yoga01Icon,
  unfold: UnfoldMoreIcon,
  dumbbellh: Dumbbell01Icon,
  fork: SpoonAndForkIcon,
  pen: Pen01Icon,
  pot: Pot02Icon,
  listnum: LeftToRightListNumberIcon,
  heartcheck: HeartCheckIcon,
  send: SentIcon,
  share: Share08Icon,
  minus: MinusSignIcon,
  call: Call02Icon,
  videocam: Video01Icon,
  smile: SmileIcon,
  attach: Attachment01Icon,
  panel: SidebarRightIcon,
  mail: Mail01Icon,
  home: Home01Icon,
  file: File02Icon,
  repeat: RepeatIcon,
  pin: Location01Icon,
  bookmark: Bookmark02Icon,
  play: PlayIcon,
  protein: ChickenThighsIcon,
  bread: Bread04Icon,
  sliders: FilterHorizontalIcon,
  drop: DropletIcon,
  filter: FilterIcon,
  starline: StarIcon,
}

const ICONS = { ...hi, ...custom }

export function Icon({ name, size = 20, sw, className = '', style, draw = false, ...rest }) {
  const data = ICONS[name]
  if (!data) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      aria-hidden="true"
      {...rest}
    >
      {data.map(([tag, attrs], i) => {
        const a = { ...attrs }
        const strokeWidth = a.strokeWidth
        delete a.key
        delete a.strokeWidth
        const El = tag
        return (
          <El
            key={i}
            {...a}
            strokeWidth={sw && strokeWidth === '1.5' ? sw : strokeWidth}
            pathLength={draw ? 1 : undefined}
            className={draw ? 'draw' : undefined}
          />
        )
      })}
    </svg>
  )
}

export function LogoMark({ size = 30, mono, className = '', style }) {
  const c = mono ? [mono, mono, mono, mono] : ['#FFE97A', '#DAF17E', '#CEE9FF', '#CEE9FF']
  return (
    <svg className={`logo-mark ${className}`} width={size} height={size} viewBox="0 0 30 30" style={style} aria-hidden="true">
      <path className="petal p1" fill={c[0]} d="M14.9 1.6C10.5 5 5 9.6 1.2 15.1C5.5 15.3 9 15.2 10.6 14.1C12.5 12.6 13.5 7.4 14.9 1.6Z" />
      <path className="petal p2" fill={c[1]} d="M15.1 1.6C17.3 3.2 19.6 5.2 21.3 7.6C19.6 7.8 17.8 7.9 16.9 7.2C15.9 6.3 15.4 4.3 15.1 1.6Z" />
      <path className="petal p3" fill={c[2]} d="M1.2 16C5.5 16.1 11 16.5 13.3 18.8C14.9 20.6 15.2 24.5 15 29.2C10.3 25.2 5.6 20.7 1.2 16Z" />
      <path className="petal p4" fill={c[3]} d="M15.3 29.2C15.6 23.6 16.6 19.4 18.9 17.3C20.8 15.7 24.4 15.5 29 15.5C24.8 20.6 20.3 25.3 15.3 29.2Z" />
    </svg>
  )
}

export function Glyph({ n, x, y, cx, cy, k = 1, dx = 0, dy = 0, ox, oy, ra, className = '', style, ...rest }) {
  const o = useOrigin()
  const g = GLYPHS[n]
  if (!g) return null
  const gx = cx != null ? cx - (g.w * k) / 2 : x ?? g.x
  const gy = cy != null ? cy - (g.h * k) / 2 : y ?? g.y
  const left = gx + dx - (ox ?? o.x) + (ra ? o.dw : 0)
  const top = gy + dy - (oy ?? o.y)
  return (
    <svg
      className={`glyph ${className}`}
      width={g.w * k}
      height={g.h * k}
      viewBox={`0 0 ${g.w} ${g.h}`}
      style={{ left, top, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {g.paths.map((p, i) => (
        <path key={i} className={`gp gp-${i}`} d={p.d} fill={p.fill || 'currentColor'} fillRule="evenodd" />
      ))}
    </svg>
  )
}

export function glyphBox(n) {
  return GLYPHS[n]
}
