import { useSyncExternalStore } from 'react'

const state = {
  stage: -1,
  section: 'top',
  workshop: null,
  ready: false,
}
const subs = new Set()

export function setState(patch) {
  let changed = false
  for (const k in patch) {
    if (state[k] !== patch[k]) {
      state[k] = patch[k]
      changed = true
    }
  }
  if (changed) {
    snapshot = { ...state }
    subs.forEach((fn) => fn())
  }
}

let snapshot = { ...state }

export function getState() {
  return snapshot
}

function subscribe(fn) {
  subs.add(fn)
  return () => subs.delete(fn)
}

export function useStore(select) {
  return useSyncExternalStore(subscribe, () => select(snapshot), () => select(snapshot))
}
