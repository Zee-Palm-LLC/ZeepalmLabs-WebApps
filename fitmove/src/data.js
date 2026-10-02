export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'statistics', label: 'Statistics', icon: 'stats' },
  { id: 'exercises', label: 'Exercises', icon: 'dumbbell' },
  { id: 'schedule', label: 'Schedule', icon: 'schedule' },
  { id: 'classes', label: 'Classes', icon: 'classes' },
  { id: 'trainers', label: 'Trainers', icon: 'badge' },
  { id: 'messages', label: 'Messages', icon: 'messages', badge: 7 },
  { id: 'tracker', label: 'Workout Tracker', icon: 'run' },
  { id: 'meals', label: 'Meal Plan', icon: 'bowl' },
]

export const WEEKS = [
  {
    id: 'aug-5',
    label: '5 - 13 August 2028',
    days: [
      { h: 59.0, d: '5 Aug', name: 'Wednesday', p: 58, kcal: 105 },
      { h: 74.6, d: '6 Aug', name: 'Thursday', p: 72, kcal: 132 },
      { h: 92.7, d: '7 Aug', name: 'Friday', p: 82, kcal: 150 },
      { h: 75.8, d: '8 Aug', name: 'Saturday', p: 76, kcal: 139 },
      { h: 75.8, d: '9 Aug', name: 'Sunday', p: 75, kcal: 138 },
      { h: 63.1, d: '10 Aug', name: 'Monday', p: 63, kcal: 116 },
      { h: 66.8, d: '11 Aug', name: 'Tuesday', p: 66, kcal: 121 },
      { h: 81.2, d: '12 Aug', name: 'Wednesday', p: 81, kcal: 148 },
      { h: 96.1, d: '13 Aug', name: 'Thursday', p: 96, kcal: 176 },
    ],
    focus: 2,
  },
  {
    id: 'jul-27',
    label: '27 Jul - 4 August 2028',
    days: [
      { h: 44, d: '27 Jul', name: 'Monday', p: 44, kcal: 81 },
      { h: 61, d: '28 Jul', name: 'Tuesday', p: 61, kcal: 112 },
      { h: 77, d: '29 Jul', name: 'Wednesday', p: 77, kcal: 141 },
      { h: 52, d: '30 Jul', name: 'Thursday', p: 52, kcal: 95 },
      { h: 69, d: '31 Jul', name: 'Friday', p: 69, kcal: 127 },
      { h: 85, d: '1 Aug', name: 'Saturday', p: 85, kcal: 156 },
      { h: 58, d: '2 Aug', name: 'Sunday', p: 58, kcal: 106 },
      { h: 91, d: '3 Aug', name: 'Monday', p: 91, kcal: 167 },
      { h: 73, d: '4 Aug', name: 'Tuesday', p: 73, kcal: 134 },
    ],
    focus: 7,
  },
  {
    id: 'jul-18',
    label: '18 - 26 July 2028',
    days: [
      { h: 38, d: '18 Jul', name: 'Saturday', p: 38, kcal: 70 },
      { h: 55, d: '19 Jul', name: 'Sunday', p: 55, kcal: 101 },
      { h: 49, d: '20 Jul', name: 'Monday', p: 49, kcal: 90 },
      { h: 71, d: '21 Jul', name: 'Tuesday', p: 71, kcal: 130 },
      { h: 83, d: '22 Jul', name: 'Wednesday', p: 83, kcal: 152 },
      { h: 47, d: '23 Jul', name: 'Thursday', p: 47, kcal: 86 },
      { h: 64, d: '24 Jul', name: 'Friday', p: 64, kcal: 117 },
      { h: 78, d: '25 Jul', name: 'Saturday', p: 78, kcal: 143 },
      { h: 60, d: '26 Jul', name: 'Sunday', p: 60, kcal: 110 },
    ],
    focus: 4,
  },
]

export const PROGRESS = {
  week: { total: 75, rings: [85, 75, 65], subs: ['5/6 sets of HIIT session', '4/5 sets of full-body strength circuit', '3/4 sets of yoga sessions'] },
  month: { total: 68, rings: [72, 64, 70], subs: ['18/25 sets of HIIT session', '16/25 sets of full-body strength circuit', '14/20 sets of yoga sessions'] },
  year: { total: 81, rings: [88, 79, 74], subs: ['211/240 sets of HIIT session', '190/240 sets of full-body strength circuit', '148/200 sets of yoga sessions'] },
}

export const ACTIVITIES = {
  Running: {
    icon: 'run',
    time: '6:30 AM - 7:20 AM',
    title: 'Park Loop Trail',
    rows: [
      ['Distance', '5 miles (8 km)'],
      ['Total Time', '50 minutes'],
      ['Total Steps', '10,500 steps'],
      ['Total Calories', '450 Cal'],
      ['Average Pace', '10 minutes/mile'],
    ],
  },
  Cycling: {
    icon: 'run',
    time: '5:45 PM - 6:40 PM',
    title: 'Reservoir Ride',
    rows: [
      ['Distance', '11 miles (18 km)'],
      ['Total Time', '55 minutes'],
      ['Total Steps', '2,140 steps'],
      ['Total Calories', '520 Cal'],
      ['Average Pace', '5 minutes/mile'],
    ],
  },
  Walking: {
    icon: 'run',
    time: '12:10 PM - 12:55 PM',
    title: 'Museum Mile Walk',
    rows: [
      ['Distance', '2.4 miles (3.9 km)'],
      ['Total Time', '45 minutes'],
      ['Total Steps', '5,820 steps'],
      ['Total Calories', '210 Cal'],
      ['Average Pace', '19 minutes/mile'],
    ],
  },
}

export const MEALS = [
  {
    id: 'breakfast',
    tag: 'Breakfast',
    title: 'Power Protein',
    level: 'Medium',
    cal: '1,800 Cal',
    desc: ['Scrambled Eggs with Turkey Bacon and', 'Sautéed Spinach'],
    img: '/img/meal-breakfast.jpg',
    tone: 'blue',
  },
  {
    id: 'lunch',
    tag: 'Lunch',
    title: 'Vegan Energy Boost',
    level: 'Medium',
    cal: '1,600 Cal',
    desc: ['Chickpea and Avocado Salad with Lemon', 'Tahini Dressing'],
    img: '/img/meal-lunch.jpg',
    tone: 'yellow',
  },
  {
    id: 'dinner',
    tag: 'Dinner',
    title: 'Lean & Green',
    level: 'Easy',
    cal: '1,500 Cal',
    desc: ['Baked Salmon with Steamed Broccoli and', 'Brown Rice'],
    img: '/img/meal-dinner.jpg',
    tone: 'green',
  },
]

export const CLASSES = [
  { id: 'strength', tag: 'Strength Training', title: 'Strength & Conditioning', coach: 'Jordan Reed', videos: '12 videos', len: '30-45 m/session', level: 'Intermediate', icon: 'dumbbell', glyph: 'dumbbellsm', gdx: 0, gdy: 0, tone: 'blue', levelTone: 'yellow' },
  { id: 'cardio', tag: 'Cardio', title: 'Cardio Blast', coach: 'Emily Thompson', videos: '10 videos', len: '20-30 m/session', level: 'Beginner', icon: 'run', glyph: 'runner', gdx: 0, gdy: 0, tone: 'green', levelTone: 'blue' },
  { id: 'core', tag: 'Core Training', title: 'Core Strength', coach: 'Alex Morgan', videos: '9 videos', len: '0-35 m/session', level: 'Advanced', icon: 'star', glyph: 'starsm', gdx: 0, gdy: 0, tone: 'yellow', levelTone: 'green' },
]

export const SCHEDULE = [
  { id: 'cardio', time: '6:30 AM', title: 'Morning Cardio Blast', sub: 'High-Intensity Interval Training (HIIT)', done: true },
  { id: 'strength', time: '12:00 PM', title: 'Strength Circuit', sub: 'Full-Body Strength Training', done: false },
  { id: 'yoga', time: '7:00 PM', title: 'Yoga Flow', sub: 'Flexibility and Relaxation', done: false },
]

export const RECENT = [
  { id: 'cardio', time: '6:30 AM', title: ['Completed Morning Cardio', 'Session'], icon: 'heartpulse', tone: 'blue', mins: '30-minute', cal: '320 Cal', desc: ['Interval sprints and recovery jogs to', 'build cardio endurance'] },
  { id: 'strength', time: '12:00 PM', title: ['Completed Strength Training', 'Circuit'], icon: 'star', tone: 'yellow', mins: '40-minute', cal: '280 Cal', desc: ['Full-body circuit with compound lifts', 'and core finishers'] },
  { id: 'yoga', time: '2:00 PM', title: ['Finished Yoga Flow Class'], icon: 'yoga', tone: 'green', mins: '20-minute', cal: '150 Cal', desc: ['Flexibility and mobility session focused', 'on deep stretches'] },
  { id: 'core', time: '7:30 PM', title: ['Completed Core Strength', 'Workout'], icon: 'dumbbellmd', tone: 'blue', mins: '25-minute', cal: '190 Cal', desc: ['Planks, hollow holds and slow', 'controlled leg raises'] },
]

export const SEARCH_INDEX = [
  { kind: 'Class', label: 'Strength & Conditioning', hint: 'Jordan Reed' },
  { kind: 'Class', label: 'Cardio Blast', hint: 'Emily Thompson' },
  { kind: 'Class', label: 'Core Strength', hint: 'Alex Morgan' },
  { kind: 'Meal', label: 'Power Protein', hint: 'Breakfast' },
  { kind: 'Meal', label: 'Vegan Energy Boost', hint: 'Lunch' },
  { kind: 'Meal', label: 'Lean & Green', hint: 'Dinner' },
  { kind: 'Trail', label: 'Park Loop Trail', hint: '5 miles' },
  { kind: 'Session', label: 'Morning Cardio Blast', hint: '6:30 AM' },
  { kind: 'Session', label: 'Strength Circuit', hint: '12:00 PM' },
  { kind: 'Session', label: 'Yoga Flow', hint: '7:00 PM' },
]

export const NOTIFICATIONS = [
  { title: 'Yoga Flow starts at 7:00 PM', time: 'in 2 hours' },
  { title: 'You hit 75% of your weekly goal', time: '1 hour ago' },
  { title: 'Jordan Reed shared a new class', time: 'Yesterday' },
]
