import {
  Activity,
  Apple,
  PanelTop,
  Brain,
  CalendarPlus,
  Check,
  ChevronDown,
  CircleArrowUp,
  ClipboardCheck,
  Clock,
  Compass,
  Cpu,
  Droplet,
  FileSearch,
  Files,
  FlaskConical,
  Flower2,
  Footprints,
  Heart,
  HeartPulse,
  MapPin,
  Menu,
  MonitorDot,
  Moon,
  Phone,
  Pill,
  Plus,
  Scale,
  ShieldCheck,
  Siren,
  Sparkles,
  SquarePen,
  Star,
  Thermometer,
  Upload,
  WandSparkles,
  Wind,
  X,
  Copy,
  ThumbsUp,
  RotateCcw,
  Stethoscope,
  Search,
  LifeBuoy,
  Mail,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  LayoutGrid,
  MessageSquareText,
} from 'lucide-react'

const MAP = {
  activity: Activity,
  apple: Apple,
  window: PanelTop,
  brain: Brain,
  book: CalendarPlus,
  check: Check,
  chevron: ChevronDown,
  send: CircleArrowUp,
  checkin: ClipboardCheck,
  clock: Clock,
  compass: Compass,
  cpu: Cpu,
  glucose: Droplet,
  file: FileSearch,
  records: Files,
  labs: FlaskConical,
  cycle: Flower2,
  steps: Footprints,
  heart: Heart,
  health: HeartPulse,
  pin: MapPin,
  menu: Menu,
  monitor: MonitorDot,
  sleep: Moon,
  phone: Phone,
  meds: Pill,
  pharmacy: Pill,
  plus: Plus,
  weight: Scale,
  shield: ShieldCheck,
  siren: Siren,
  sparkles: Sparkles,
  pen: SquarePen,
  star: Star,
  symptoms: Thermometer,
  upload: Upload,
  wand: WandSparkles,
  breath: Wind,
  x: X,
  vitals: Activity,
  nutrition: Apple,
  mind: Brain,
  copy: Copy,
  like: ThumbsUp,
  retry: RotateCcw,
  doctor: Stethoscope,
  search: Search,
  help: LifeBuoy,
  mail: Mail,
  chat: MessageCircle,
  down: TrendingDown,
  up: TrendingUp,
  minus: Minus,
  grid: LayoutGrid,
  chatbot: MessageSquareText,
}

export function Icon({ name, size = 20, stroke = 1.6, className = '', style }) {
  const C = MAP[name] || Sparkles
  return <C size={size} strokeWidth={stroke} className={className} style={style} aria-hidden="true" />
}

export function LogoMark({ size = 58, className = '' }) {
  return (
    <svg className={`logo-mark ${className}`} width={size} height={size} viewBox="0 0 58 58" aria-hidden="true">
      <circle cx="29" cy="29" r="29" fill="#28f6ae" />
      <circle cx="29" cy="29" r="15.5" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M13.8 29h30.4M29 13.8c-5.4 4.6-5.4 25.8 0 30.4M29 13.8c5.4 4.6 5.4 25.8 0 30.4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <path d="M29 19.6c1.1 5.6 3.8 8.3 9.4 9.4-5.6 1.1-8.3 3.8-9.4 9.4-1.1-5.6-3.8-8.3-9.4-9.4 5.6-1.1 8.3-3.8 9.4-9.4z" fill="#fff" />
    </svg>
  )
}

export function OrbMark({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="17" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M4 21h34M21 4c-6 5.2-6 28.8 0 34M21 4c6 5.2 6 28.8 0 34" fill="none" stroke="#fff" strokeWidth="1.7" />
      <path d="M21 12.4c1.2 6 4.1 8.9 10.1 10.1-6 1.2-8.9 4.1-10.1 10.1-1.2-6-4.1-8.9-10.1-10.1 6-1.2 8.9-4.1 10.1-10.1z" fill="#fff" transform="translate(0 -1.5)" />
    </svg>
  )
}
