import { useSyncExternalStore } from 'react';

// Minimal global store: theme under the header, active index, HUD visibility, material params.
const state = {
  theme: 'dark',
  index: 0,
  hud: true,
  sound: false,
  material: { roughness: 0.1, noiseScale: 9, color: '#ffffff' },
  quat: [0, 0, 0, 1],
  resetQuat: 0,
};
const listeners = new Set();

export const store = {
  get: () => state,
  set(patch) {
    let changed = false;
    for (const k in patch) if (state[k] !== patch[k]) { state[k] = patch[k]; changed = true; }
    if (changed) listeners.forEach((l) => l());
  },
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
};

export function useStore(selector) {
  return useSyncExternalStore(store.subscribe, () => selector(state));
}
