export const place = {
  name: "Ember",
  line: "Wood-fire grill house, Clerkenwell",
  street: "14 Foundry Lane",
  city: "London EC1V 4AB",
  phone: "020 7946 0321",
  phoneHref: "tel:+442079460321",
  email: "table@ember.example",
};

export const chapters = [
  {
    key: "fire",
    nav: "Fire",
    title: "Lit at four, every afternoon.",
    body: "Split oak and lump charcoal, burned down for two hours until the bed glows at 450°C. No gas line, no switch.",
    range: [0.035, 0.14],
  },
  {
    key: "on",
    nav: "On the grate",
    title: "Ribeye, 450 grams, 45 days aged.",
    body: "Tempered for an hour before it touches the grate, so the heat reaches all the way through.",
    range: [0.165, 0.27],
  },
  {
    key: "sear",
    nav: "Sear",
    title: "Fat meets flame.",
    body: "The marbling renders and flares. That smoke is where the flavour comes from, so we let it.",
    range: [0.3, 0.52],
  },
  {
    key: "flip",
    nav: "Flip",
    title: "One flip. Only one.",
    body: "Four minutes a side, turned once, so the crust has time to form. Our grill cooks watch the steak, not a timer.",
    range: [0.55, 0.75],
  },
  {
    key: "served",
    nav: "Served",
    title: "Rested, sliced, salted.",
    body: "Six minutes on the board, then flaky salt at the pass. Medium-rare unless you tell us otherwise.",
    range: [0.8, 0.93],
  },
];

export const manifesto =
  "There is no gas line in our kitchen. Every steak, every vegetable and even the bread goes over split oak, because fire does something an oven never will: it makes the cook pay attention.";

export const facts = [
  { value: 14, suffix: "", label: "Hours the fire burns each day" },
  { value: 450, suffix: "°C", label: "At the grate, measured every hour" },
  { value: 45, suffix: "", label: "Days our beef hangs in the chamber" },
  { value: 1, suffix: "", label: "Flip per steak. Never more" },
];

export const woods = [
  {
    key: "oak",
    name: "Oak",
    temp: 420,
    burn: "4 hours",
    body: "Steady and clean. It burns for hours at an even heat, so it does most of the work on the grill.",
    notes: ["Clean", "Toasty", "A little vanilla"],
    pairs: "Ribeye, striploin, flatbread",
    flame: { colors: ["255,244,214", "255,176,64", "255,90,31", "150,40,14"], height: 1, width: 1, sparks: 0.45, speed: 1 },
  },
  {
    key: "cherry",
    name: "Cherry",
    temp: 380,
    burn: "3 hours",
    body: "A sweeter smoke that leaves a deep red colour on whatever it touches. Gentle enough for poultry.",
    notes: ["Sweet", "Fruity", "Rosy"],
    pairs: "Half chicken, pork chop, beetroot",
    flame: { colors: ["255,226,200", "255,140,90", "236,60,48", "120,20,26"], height: 0.82, width: 1.1, sparks: 0.3, speed: 0.85 },
  },
  {
    key: "mesquite",
    name: "Mesquite",
    temp: 520,
    burn: "90 minutes",
    body: "Fast and fierce. We save it for a final blast of heat on the thickest cuts, right before the pass.",
    notes: ["Bold", "Earthy", "Peppery"],
    pairs: "Tomahawk, picanha",
    flame: { colors: ["255,255,246", "255,228,138", "255,162,46", "194,67,27"], height: 1.3, width: 0.9, sparks: 0.95, speed: 1.3 },
  },
];

export const ageMilestones = [
  { day: 1, title: "Fresh", body: "Clean, mild and a little metallic. Good beef, not great beef yet." },
  { day: 14, title: "Tender", body: "Natural enzymes have softened the muscle. The flavour is still gentle." },
  { day: 28, title: "Nutty", body: "Moisture is leaving and the flavour concentrates. Brown butter and roast notes arrive." },
  { day: 45, title: "Our house age", body: "Deep, savoury, a hint of blue cheese. About a quarter of the weight has gone." },
];

export const cuts = [
  {
    key: "ribeye",
    name: "Ribeye",
    body: "The cook's favourite. Heavy marbling, with a cap of fat that melts into the eye as it cooks.",
    weights: [350, 450, 600],
    per100: 7.2,
    aged: 45,
  },
  {
    key: "striploin",
    name: "Striploin",
    body: "Leaner and firmer, with a strip of fat along one edge that crisps over the fire.",
    weights: [300, 400, 500],
    per100: 6.4,
    aged: 40,
  },
  {
    key: "tomahawk",
    name: "Tomahawk",
    body: "A ribeye left on the long bone, for two. Finished over mesquite at the pass.",
    weights: [1000, 1200],
    per100: 6.8,
    aged: 45,
  },
  {
    key: "picanha",
    name: "Picanha",
    body: "The rump cap, skewered and cooked in its own fat. Brazil's favourite, and ours on Sundays.",
    weights: [300, 400],
    per100: 5.2,
    aged: 21,
  },
];

export const donenessLevels = [
  { name: "Blue", core: 48, centre: "#7c1b2c", edge: "#9a2336", band: 0.04, rest: 5 },
  { name: "Rare", core: 52, centre: "#b3243a", edge: "#c43f4c", band: 0.07, rest: 5 },
  { name: "Medium-rare", core: 56, centre: "#d0475a", edge: "#d66b6e", band: 0.1, rest: 6 },
  { name: "Medium", core: 61, centre: "#d97b7d", edge: "#c9918a", band: 0.16, rest: 6 },
  { name: "Medium-well", core: 66, centre: "#c89e8f", edge: "#a98474", band: 0.24, rest: 7 },
  { name: "Well done", core: 72, centre: "#9a7866", edge: "#8a6a58", band: 0.34, rest: 7 },
];

export const menu = [
  {
    key: "start",
    name: "To start",
    items: [
      { name: "Flatbread from the fire", note: "Whipped beef-fat butter, rosemary salt", price: "6" },
      { name: "Burnt leeks", note: "Hazelnut, brown butter, crème fraîche", price: "9", tag: "v" },
      { name: "Beef tartare", note: "Smoked egg yolk, capers, grilled sourdough", price: "14" },
      { name: "Ember-roasted oysters", note: "Three, with chorizo butter", price: "13" },
    ],
  },
  {
    key: "fire",
    name: "From the fire",
    items: [
      { name: "Ribeye, 45 days", note: "Per 100g, cooked to order", price: "7.20", tag: "House", preview: "still-plated.jpg" },
      { name: "Striploin, 40 days", note: "Per 100g, fat edge crisped", price: "6.40", preview: "still-flip.jpg" },
      { name: "Tomahawk for two", note: "Per 100g, finished over mesquite", price: "6.80", preview: "still-sear.jpg" },
      { name: "Half chicken", note: "Piri piri, charred lemon", price: "21" },
      { name: "Whole sea bass", note: "Salsa verde, blistered tomatoes", price: "28" },
      { name: "Celeriac steak", note: "Black garlic, walnut", price: "18", tag: "v" },
    ],
  },
  {
    key: "side",
    name: "On the side",
    items: [
      { name: "Beef-fat chips", note: "Triple cooked", price: "6" },
      { name: "Hispi cabbage", note: "Charred, anchovy crumb", price: "7" },
      { name: "Creamed spinach", note: "Nutmeg, parmesan", price: "6", tag: "v" },
      { name: "Roasted bone marrow", note: "Parsley and shallot salad", price: "9" },
      { name: "Sauces", note: "Peppercorn, béarnaise, chimichurri or bone-marrow gravy", price: "3" },
    ],
  },
  {
    key: "finish",
    name: "To finish",
    items: [
      { name: "Burnt Basque cheesecake", note: "Charred top, soft middle", price: "9", tag: "House" },
      { name: "Fire-roasted pineapple", note: "Rum caramel, lime", price: "8", tag: "v" },
      { name: "Dark chocolate pot", note: "Smoked sea salt, crème fraîche", price: "9", tag: "v" },
    ],
  },
];

export const seating = [
  { key: "counter", name: "Fire counter", body: "Eight stools facing the grill. You'll watch your steak cook.", max: 4 },
  { key: "dining", name: "Dining room", body: "Booths and tables for two to eight, under the brick arches.", max: 8 },
  { key: "terrace", name: "Garden terrace", body: "Covered and heated, with its own brazier. April to October.", max: 6 },
];

export const hours = [
  { day: "Monday", slots: [] },
  { day: "Tuesday", slots: [["17:30", "23:00"]] },
  { day: "Wednesday", slots: [["17:30", "23:00"]] },
  { day: "Thursday", slots: [["17:30", "23:00"]] },
  { day: "Friday", slots: [["12:00", "15:00"], ["17:30", "24:00"]] },
  { day: "Saturday", slots: [["12:00", "15:00"], ["17:30", "24:00"]] },
  { day: "Sunday", slots: [["12:00", "21:00"]] },
];
