// Snapshots for the Global activity page. The live refresh steps through
// them, and the Today / Week / Month switch picks the starting one.
export const snapshots = [
  {
    members: 7541390,
    regions: [
      { name: 'United States', color: '#22B36A', value: 4504210, pct: 41 },
      { name: 'United Kingdom', color: '#7B6CF0', value: 2100950, pct: 19 },
      { name: 'Germany', color: '#F25F7C', value: 1980240, pct: 17 },
      { name: 'Brazil', color: '#F4B55E', value: 1504210, pct: 13 },
      { name: 'Japan', color: '#4CB6F3', value: 1102480, pct: 10 },
    ],
    avgSession: 42,
    streak: 12,
    calories: 12875,
    heartRate: 72,
    goal: 23,
    steps: 53430001,
    sleep: { hours: 7, minutes: 24, deep: 22, light: 48, rem: 24, awake: 6 },
    vo2: 42.6,
    workouts: 2340,
    prs: 1203540,
    weekCalories: 12875,
    activeMinutes: 43123,
    trainingHours: 16073,
    months: [
      { name: 'January', color: '#7B6CF0', value: 8320, fill: 0.93 },
      { name: 'February', color: '#F25F7C', value: 6320, fill: 0.72 },
      { name: 'March', color: '#F4B55E', value: 1432, fill: 0.31 },
    ],
  },
  {
    members: 7684215,
    regions: [
      { name: 'United States', color: '#22B36A', value: 4518880, pct: 37 },
      { name: 'United Kingdom', color: '#7B6CF0', value: 2590330, pct: 23 },
      { name: 'Germany', color: '#F25F7C', value: 1458240, pct: 14 },
      { name: 'Brazil', color: '#F4B55E', value: 1117860, pct: 12 },
      { name: 'Japan', color: '#4CB6F3', value: 1386020, pct: 14 },
    ],
    avgSession: 47,
    streak: 13,
    calories: 13420,
    heartRate: 69,
    goal: 64,
    steps: 54102880,
    sleep: { hours: 7, minutes: 51, deep: 25, light: 45, rem: 26, awake: 4 },
    vo2: 43.4,
    workouts: 2485,
    prs: 1241306,
    weekCalories: 13420,
    activeMinutes: 45870,
    trainingHours: 18240,
    months: [
      { name: 'January', color: '#7B6CF0', value: 8320, fill: 0.86 },
      { name: 'February', color: '#F25F7C', value: 7460, fill: 0.8 },
      { name: 'March', color: '#F4B55E', value: 2460, fill: 0.44 },
    ],
  },
]

export const workoutRows = [
  { name: 'Running', count: 760, value: 2540, up: true },
  { name: 'Cycling', count: 650, value: 2304, up: false },
  { name: 'Strength', count: 612, value: 2140, up: true },
]

// Pairs of (active, resting) heights for the Calories burned chart, 0–1.
export const calorieBars = [
  [0.22, 0.4], [0.3, 0.6], [0.36, 0.52], [0.2, 0.62], [0.28, 0.36],
  [0.42, 0.66], [0.18, 0.7], [0.4, 0.54], [0.26, 0.44], [0.16, 0.3],
  [0.22, 0.4], [0.3, 0.5], [0.14, 0.62], [0.34, 0.48],
]

export const fmt = (n) => n.toLocaleString('en-US')
