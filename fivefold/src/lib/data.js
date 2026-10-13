export const STAGES = [
  {
    id: 'assessment',
    n: '01',
    name: 'Assessment',
    hint: 'baseline & goals',
    eyebrow: 'Assessment · (baseline & goals)',
    title: 'Know your starting line.',
    body: 'We test strength, mobility, heart rate and sleep, then set goals that fit your life. You leave with a clear baseline board.',
    mood: 'board',
  },
  {
    id: 'training',
    n: '02',
    name: 'Training',
    hint: 'load & recovery',
    eyebrow: 'Training · (load & recovery)',
    title: 'Train hard. Rest harder.',
    body: 'Progress happens between sessions. We plan your load, rest days and sleep so your body adapts instead of breaking down.',
    mood: 'timer',
  },
  {
    id: 'breakthrough',
    n: '03',
    name: 'Breakthrough',
    hint: 'PR moment',
    eyebrow: 'Breakthrough · (PR moment)',
    title: 'The breakthrough.',
    body: 'Strength shows up when the work is done. We plan test days, track every lift and catch the moment you set a new record.',
    mood: 'aha',
  },
  {
    id: 'progress',
    n: '04',
    name: 'Progress',
    hint: 'measure & adjust',
    eyebrow: 'Progress · (measure & adjust)',
    title: 'Measure & adjust.',
    body: 'Not every plan fits every body. We score programs on results, time and enjoyment, then adjust with confidence.',
    mood: 'scores',
  },
  {
    id: 'habit',
    n: '05',
    name: 'Habit',
    hint: 'build & sustain',
    eyebrow: 'Habit · (build & sustain)',
    title: 'Make it stick.',
    body: 'Results last when routines do. We turn your plan into habits, check in weekly and hand over a program you can keep.',
    mood: 'sketch',
  },
]

export const IDEAS = [
  { id: 'a', name: 'Strength', scores: [67, 88, 48] },
  { id: 'b', name: 'Hybrid', scores: [84, 72, 85] },
  { id: 'c', name: 'Cardio', scores: [55, 92, 46] },
]

export const SCORE_KEYS = ['Gains', 'Time', 'Joy']
export const SCORE_NAMES = ['results', 'time fit', 'enjoyment']

export const WORKSHOPS = [
  {
    id: 'kickstart',
    tag: 'Two weeks',
    name: 'Kickstart',
    stages: 3,
    items: ['Full fitness assessment', 'Personal training plan', 'Recovery and sleep guide', 'Two coached sessions'],
    cta: 'Start Kickstart',
  },
  {
    id: 'transform',
    tag: 'Twelve weeks',
    name: 'Transform',
    stages: 5,
    items: ['All five stages, start to finish', 'Weekly progress check-ins', 'Nutrition and macro plan', 'PR test day and review'],
    cta: 'Start Transform',
  },
  {
    id: 'elite',
    tag: 'Six months',
    name: 'Elite Coaching',
    stages: 5,
    items: ['Two full training cycles', 'Weekly one-to-one coaching', 'Wearable data reviews', 'A plan you keep for life'],
    cta: 'Apply for Elite',
  },
]

export const TEAM_SIZES = ['1–2', '3–4', '5–6', 'Daily']

export const NAV = [
  { label: 'Process', href: '#process' },
  { label: 'Stages', href: '#stages' },
  { label: 'Programs', href: '#workshops' },
  { label: 'Contact', href: '#contact' },
]
