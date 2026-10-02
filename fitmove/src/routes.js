export const ROUTES = [
  { path: '/', page: 'dashboard', nav: 'dashboard', title: 'Dashboard' },
  { path: '/statistics', page: 'statistics', nav: 'statistics', title: 'Statistics' },
  { path: '/exercises', page: 'exercises', nav: 'exercises', title: 'Exercises' },
  { path: '/schedule', page: 'schedule', nav: 'schedule', title: 'Schedule' },
  { path: '/classes', page: 'classes', nav: 'classes', title: 'Class Details' },
  { path: '/trainers', page: 'trainers', nav: 'trainers', title: 'Trainers' },
  { path: '/trainers/', page: 'trainer', nav: 'trainers', title: 'Trainer Details', prefix: true },
  { path: '/messages', page: 'messages', nav: 'messages', title: 'Messages' },
  { path: '/workout-tracker', page: 'tracker', nav: 'tracker', title: 'Workout Tracker' },
  { path: '/meal-plan', page: 'meals', nav: 'meals', title: 'Meal Plan' },
  { path: '/meal-plan/', page: 'meal', nav: 'meals', title: 'Detail Menu', prefix: true },
]

export const NAV_PATHS = {
  dashboard: '/',
  statistics: '/statistics',
  exercises: '/exercises',
  schedule: '/schedule',
  classes: '/classes',
  trainers: '/trainers',
  messages: '/messages',
  tracker: '/workout-tracker',
  meals: '/meal-plan',
}

export function matchRoute(path) {
  const clean = path.length > 1 ? path.replace(/\/+$/, '') : path
  const exact = ROUTES.find((r) => !r.prefix && r.path === clean)
  if (exact) return { ...exact, param: null }
  const pre = ROUTES.find((r) => r.prefix && clean.startsWith(r.path) && clean.length > r.path.length)
  if (pre) return { ...pre, param: clean.slice(pre.path.length) }
  return { ...ROUTES[0], param: null }
}
