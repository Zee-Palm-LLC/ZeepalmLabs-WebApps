import { useSyncExternalStore } from 'react'

const initialPath = typeof window === 'undefined' ? '/' : window.location.pathname

let state = {
  route: initialPath,
  nav: 'dashboard',
  week: 0,
  bar: null,
  range: 'week',
  activity: 'Running',
  month: 7,
  year: 2028,
  selected: 13,
  schedule: { cardio: true, strength: false, yoga: false },
  extra: [],
  recentOpen: 'yoga',
  menu: null,
  search: '',
  searchOpen: false,
  intro: true,
  liked: {},
  joined: {},
  ring: null,
}

const listeners = new Set()

export function getUi() {
  return state
}

export function setUi(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function subscribeUi(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useUi(selector) {
  return useSyncExternalStore(subscribeUi, () => selector(state))
}

export function navigate(path, opts = {}) {
  if (path === state.route) return
  if (!opts.silent && typeof window !== 'undefined') window.history.pushState({}, '', path + (window.location.search || ''))
  setUi({ route: path, menu: null, searchOpen: false })
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => setUi({ route: window.location.pathname, menu: null }))
}
