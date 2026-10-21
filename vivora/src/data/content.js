// VIVORA — health & fitness training brand. Placeholder content: replace with real programs, classes and copy.
export const TAGLINE = 'Train smarter. Live stronger.';

export const NAV = ['Programs', 'Coaching', 'Club', 'About'];

export const INDEX = ['TOP', 'PROGRAMS', 'ABOUT', 'VISION', 'COACHING', 'CLUB'];

// "Upcoming" list in the hero (was News)
export const NEWS = [
  { date: 'MON 06:30', title: 'HIIT Burn — 45 min · Studio A · 8 spots left' },
  { date: 'WED 18:00', title: 'Strength Lab: deadlift technique clinic with Coach Maya' },
  { date: 'SAT 07:00', title: '10K Run Club — riverside route, all paces welcome' },
];

// Programs carousel + the shattered "TRAIN" shards. img lives in /public/images
export const WORKS = [
  { date: '8 WEEKS · ALL LEVELS', title: 'HIIT Burn', sub: 'HIIT Burn — high-intensity intervals that torch 600+ kcal', note: '4.9 ★ · 32k athletes', tags: ['cardio', 'fat-loss', '45 min'], img: '/images/hiit.jpg', hues: [78, 18] },
  { date: '12 WEEKS · INTERMEDIATE', title: 'Strength Lab', sub: 'Strength Lab — progressive overload for real power', note: '+18% avg. 1RM', tags: ['strength', 'barbell', '60 min'], img: '/images/strength.jpg', hues: [22, 78] },
  { date: '6 WEEKS · ALL LEVELS', title: 'Fight Fit', sub: 'Fight Fit — boxing conditioning, footwork and core', note: 'Coach-led live', tags: ['boxing', 'conditioning', '40 min'], img: '/images/boxing.jpg', hues: [12, 70] },
  { date: '4 WEEKS · BEGINNER', title: 'Spin Rush', sub: 'Spin Rush — rhythm rides with live leaderboards', note: '1.2M rides logged', tags: ['cycling', 'endurance', '30 min'], img: '/images/spin.jpg', hues: [30, 85] },
  { date: '10 WEEKS · INTERMEDIATE', title: 'Run Club', sub: 'Run Club — 5K to half-marathon training plans', note: '−2:40 avg. 10K time', tags: ['running', 'zones', 'outdoor'], img: '/images/runner.jpg', hues: [82, 30] },
  { date: 'ONGOING · ALL LEVELS', title: 'Flow & Recover', sub: 'Flow & Recover — yoga, mobility and active recovery', note: 'Sleep score +11%', tags: ['mobility', 'yoga', 'recovery'], img: '/images/recovery.jpg', hues: [88, 40] },
];

export const SERVICES = [
  { badge: 'AI PERSONAL COACH', title: 'Smart Coaching', img: '/images/wearable.jpg', body: 'An AI coach that reads your heart-rate zones, sleep and recovery, then adjusts every session in real time — with human coaches one tap away.', foot: 'Syncs with Apple Watch, Garmin, WHOOP and Oura. Adaptive plans for strength, endurance and weight goals.', hue: 78 },
  { badge: 'FUEL THE WORK', title: 'Nutrition Plans', img: '/images/nutrition.jpg', body: 'Macro-smart meal plans built around your training load — high-protein recipes, grocery lists and a photo food log that does the maths for you.', foot: 'Plans for fat loss, lean bulk and performance, designed with registered dietitians.', hue: 30 },
  { badge: 'ONE-ON-ONE', title: 'Personal Training', img: '/images/club-gym.jpg', body: 'Certified coaches who build your programme, fix your form and keep you accountable — in the club or live on video, wherever you train.', foot: 'Form checks, weekly check-ins and progress reviews with the same coach every time.', hue: 18 },
];

export const MISSION = {
  big: ['Built for every body', 'that wants to move'],
  small: 'Training, nutrition and recovery\nin one place — made to keep you going.',
};

export const VISION = {
  lines: ['Train smarter', 'live stronger'],
  small: 'Progress you can feel,\ndata you can trust.',
};

export const LABS = {
  bg: '/images/club-gym.jpg',
  body: [
    'vivoclub is the members club — premium gyms, studio classes,',
    'recovery suites and a community that shows up for each other.',
    'Book classes, join challenges and climb the leaderboard,',
    'all from the same app that tracks every rep.',
  ],
  side: 'Open 5am–midnight. Strength floor,\nspin & HIIT studios, sauna and\ncold plunge. First week free.',
};
