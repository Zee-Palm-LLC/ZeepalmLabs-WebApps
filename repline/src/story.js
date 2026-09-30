export const chapters = [
  {
    key: "count",
    nav: "Count",
    title: "Every rep counts.",
    body: "A clip on the sleeve logs each rep the moment the bar moves. No buttons, no phone in your hand.",
    range: [0.06, 0.19],
    place: "left",
  },
  {
    key: "speed",
    nav: "Speed",
    title: "Bar speed, measured to the millisecond.",
    body: "Mean and peak velocity for every rep, so a heavy single tells you more than made or missed.",
    range: [0.23, 0.36],
    place: "right",
  },
  {
    key: "fatigue",
    nav: "Fatigue",
    title: "See fatigue before it hits.",
    body: "When your reps slow past your usual drop-off, Repline tells you to rack it before the set fails.",
    range: [0.4, 0.53],
    place: "left",
  },
  {
    key: "form",
    nav: "Form",
    title: "Your form, decoded.",
    body: "Bar path and lockout timing, traced rep by rep, with the one rep that drifted marked for you.",
    range: [0.57, 0.7],
    place: "right",
  },
  {
    key: "record",
    nav: "Record",
    title: "Lock it out. Log the PR.",
    body: "New records are saved with their speed and date the second you rack the bar.",
    range: [0.74, 0.88],
    place: "left",
  },
];

export const manifesto =
  "Most training logs are written from memory, and memory rounds up. Repline clips to the bar and writes down what it did: every rep, how fast, how straight, and the day it finally moved.";

export const specs = [
  { value: 1000, suffix: " Hz", label: "Samples the bar a thousand times a second" },
  { value: 2, suffix: " mm", label: "Bar path accuracy, rep after rep" },
  { value: 14, suffix: " days", label: "Of training on one charge" },
  { value: 38, suffix: " g", label: "On the sleeve. You won't feel it" },
];

export const steps = [
  {
    key: "clip",
    title: "Clip it on",
    body: "The sensor snaps onto either sleeve in about two seconds. It wakes up when the bar moves.",
  },
  {
    key: "lift",
    title: "Lift like normal",
    body: "No buttons between sets. Repline tells a squat from a clean by the shape of the bar path.",
  },
  {
    key: "read",
    title: "Read the set",
    body: "Rack the bar and your phone shows every rep: its speed, its depth, and where the set began to slow.",
  },
  {
    key: "beat",
    title: "Beat it next week",
    body: "Your best sets stay on the wall. Next session, Repline suggests the weight that should move at the same speed.",
  },
];

export const features = [
  {
    key: "reps",
    title: "Rep detection",
    body: "Sets and reps counted automatically from bar movement, across squat, bench, deadlift, press and the Olympic lifts.",
  },
  {
    key: "velocity",
    title: "Velocity per rep",
    body: "Bar speed for each rep, with your usual drop-off per lift, so you pick working weights by how they move today.",
  },
  {
    key: "records",
    title: "PR history",
    body: "Every top set saved with its speed and date. Filter by lift, rep range or block and see how far you’ve come.",
  },
];

export const priceLines = [
  "Repline sensor",
  "Sleeve clip and charging cable",
  "First year of the app",
];
