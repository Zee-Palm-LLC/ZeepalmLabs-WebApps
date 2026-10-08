export const USER = {
  name: 'Jack Matrix',
  email: 'jackmatrix89@gmail.com',
  mrn: 'MRN 084575...1234',
  age: 34,
  blood: 'O+',
  height: '181 cm',
  weight: '78 kg',
  allergies: ['Penicillin'],
  conditions: ['Mild hypertension'],
}

export const NAV = ['Dashboard', 'AI Chatbot', 'Help', 'Labs']

export const MENU = [
  { id: 'checkin', label: 'Daily Check-in', icon: 'checkin', prompt: 'Start my daily check-in' },
  { id: 'health', label: 'My Health', icon: 'health', prompt: 'Show my vitals for this week' },
  { id: 'monitor', label: 'Vitals Monitor', icon: 'monitor', prompt: 'How is my blood pressure trending?' },
  { id: 'records', label: 'My Records', icon: 'records', prompt: 'Explain my latest lab results' },
]

export const CHIPS = [
  { id: 'symptoms', label: 'Symptoms', icon: 'symptoms', prompt: 'I have a headache and feel tired' },
  { id: 'vitals', label: 'Vitals', icon: 'vitals', prompt: 'Show my vitals for this week' },
  { id: 'labs', label: 'Lab Results', icon: 'labs', prompt: 'Explain my latest lab results' },
  { id: 'meds', label: 'Medications', icon: 'meds', prompt: 'What medications do I take today?' },
  { id: 'book', label: 'Book Visit', icon: 'book', prompt: 'Book a visit with a doctor' },
  { id: 'sleep', label: 'Sleep', icon: 'sleep', prompt: 'How did I sleep this week?' },
]

export const TRACKERS = [
  { id: 'heart', label: 'Heart Rate', color: '#ff4d6d', on: true },
  { id: 'steps', label: 'Steps', color: '#ff8a1f', on: true },
  { id: 'sleep', label: 'Sleep', color: '#6366f1', on: true },
  { id: 'glucose', label: 'Glucose', color: '#e5383b', on: false },
  { id: 'nutrition', label: 'Nutrition', color: '#22c55e', on: false },
  { id: 'weight', label: 'Smart Scale', color: '#14b8a6', on: true },
  { id: 'mind', label: 'Mindfulness', color: '#a855f7', on: false },
  { id: 'pharmacy', label: 'Pharmacy', color: '#3b82f6', on: true },
  { id: 'breath', label: 'Breathing', color: '#0ea5e9', on: false },
  { id: 'cycle', label: 'Cycle', color: '#ec4899', on: false },
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const VITALS = {
  heart: { label: 'Resting heart rate', unit: 'bpm', now: 64, series: [68, 66, 67, 65, 63, 64, 64], range: [60, 100], tone: '#ff4d6d' },
  bp: { label: 'Blood pressure', unit: 'mmHg', now: '128/82', sys: [134, 131, 132, 129, 127, 128, 128], dia: [86, 85, 84, 83, 82, 82, 82], tone: '#6366f1' },
  spo2: { label: 'Blood oxygen', unit: '%', now: 98, series: [97, 98, 98, 97, 98, 99, 98], range: [95, 100], tone: '#0ea5e9' },
  steps: { label: 'Steps', unit: 'today', now: '8,412', series: [6200, 9100, 7400, 10200, 8800, 5300, 8412], goal: 9000, tone: '#ff8a1f' },
}

export const LABS = [
  { name: 'HbA1c', value: 5.4, unit: '%', low: 4, high: 5.6, min: 3.5, max: 7.5, note: 'Average blood sugar over 3 months. Normal.' },
  { name: 'LDL cholesterol', value: 142, unit: 'mg/dL', low: 0, high: 100, min: 40, max: 200, note: 'Slightly high. Diet and activity help bring it down.' },
  { name: 'HDL cholesterol', value: 52, unit: 'mg/dL', low: 40, high: 90, min: 20, max: 100, note: 'Healthy “good” cholesterol.' },
  { name: 'Vitamin D', value: 21, unit: 'ng/mL', low: 30, high: 100, min: 5, max: 110, note: 'Low. Sunlight and a supplement are common fixes.' },
  { name: 'TSH', value: 2.1, unit: 'mIU/L', low: 0.4, high: 4.0, min: 0, max: 6, note: 'Thyroid looks normal.' },
]

export const MEDS = [
  { id: 'amlo', name: 'Amlodipine', dose: '5 mg', time: '08:00', why: 'Blood pressure', taken: true },
  { id: 'vitd', name: 'Vitamin D3', dose: '2000 IU', time: '13:00', why: 'Low vitamin D', taken: false },
  { id: 'omega', name: 'Omega-3', dose: '1 g', time: '20:00', why: 'Heart health', taken: false },
]

export const DOCTORS = [
  { id: 'chen', name: 'Dr. Mia Chen', role: 'Family medicine', rating: 4.9, tone: '#28f6ae', slots: ['Today 16:30', 'Tomorrow 09:15', 'Tomorrow 14:00'] },
  { id: 'ortiz', name: 'Dr. Luis Ortiz', role: 'Cardiology', rating: 4.8, tone: '#6366f1', slots: ['Thu 10:00', 'Thu 15:45', 'Fri 11:30'] },
  { id: 'adeyemi', name: 'Dr. Ada Adeyemi', role: 'Endocrinology', rating: 4.9, tone: '#ff8a1f', slots: ['Fri 09:00', 'Mon 13:30', 'Mon 16:00'] },
]

export const SLEEP = {
  avg: '7h 12m',
  score: 82,
  nights: [6.6, 7.1, 7.4, 6.2, 7.8, 8.1, 7.2],
  stages: [
    { k: 'Deep', v: 18, c: '#4f46e5' },
    { k: 'REM', v: 22, c: '#8b5cf6' },
    { k: 'Light', v: 52, c: '#a5b4fc' },
    { k: 'Awake', v: 8, c: '#e5e7eb' },
  ],
}

export const CLINICS = [
  { name: 'GreenLeaf Urgent Care', kind: 'Urgent care', dist: '0.8 mi', wait: '15 min', open: true },
  { name: 'Riverside Pharmacy', kind: 'Pharmacy', dist: '1.1 mi', wait: 'Open until 22:00', open: true },
  { name: 'St. Mary Medical Center', kind: 'Hospital · ER', dist: '2.4 mi', wait: '24/7', open: true },
  { name: 'Northside Lab Draw', kind: 'Blood tests', dist: '3.0 mi', wait: 'Opens 07:00', open: false },
]

export const HISTORY = [
  {
    id: 'h1',
    title: 'Is my blood pressure normal for my age?',
    messages: [
      { role: 'user', text: 'Is my blood pressure normal for my age?' },
      { role: 'bot', key: 'vitals' },
    ],
  },
  {
    id: 'h2',
    title: 'What’s a healthy sleep schedule for shift work?',
    messages: [
      { role: 'user', text: 'What’s a healthy sleep schedule for shift work?' },
      { role: 'bot', key: 'sleep' },
    ],
  },
]
