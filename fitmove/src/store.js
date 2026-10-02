import { useSyncExternalStore } from 'react'

let state = {
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
