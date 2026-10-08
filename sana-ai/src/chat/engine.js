import { LABS, MEDS, VITALS, SLEEP, USER } from '../lib/data.js'

const has = (t, re) => re.test(t)

const RED_FLAGS = /(chest pain|chest tightness|can'?t breathe|cannot breathe|short(ness)? of breath|struggling to breathe|stroke|face droop|slurred speech|one side.*(weak|numb)|unconscious|passed out|severe bleeding|bleeding heavily|overdose|suicid|kill myself|end my life|self[- ]harm|seizure|anaphyla|throat (is )?swelling)/i
const MIND_CRISIS = /(suicid|kill myself|end my life|self[- ]harm)/i

const SYMPTOMS = [
  { key: 'headache', re: /headache|migraine|head hurts/i, name: 'headache' },
  { key: 'fever', re: /fever|temperature|chills|feverish/i, name: 'fever' },
  { key: 'cough', re: /cough|sore throat|cold|flu|congest|runny nose/i, name: 'cough or cold' },
  { key: 'stomach', re: /stomach|nausea|vomit|diarr|belly|abdominal|indigestion/i, name: 'stomach upset' },
  { key: 'back', re: /back pain|neck pain|joint|knee|shoulder|muscle/i, name: 'muscle or joint pain' },
  { key: 'skin', re: /rash|itch|hives|skin/i, name: 'skin rash' },
  { key: 'dizzy', re: /dizzy|lightheaded|faint|vertigo/i, name: 'dizziness' },
  { key: 'tired', re: /tired|fatigue|exhausted|no energy|weak/i, name: 'tiredness' },
]

const CARE = {
  headache: ['Drink a large glass of water and rest in a dim, quiet room.', 'Ibuprofen or paracetamol can help if you normally tolerate them.', 'Note screen time, caffeine and sleep. They are common triggers.'],
  fever: ['Rest and drink fluids little and often.', 'Paracetamol can bring the temperature down.', 'Check your temperature every 4–6 hours.'],
  cough: ['Warm drinks with honey can soothe the throat.', 'Steam or a humidifier can ease congestion.', 'Most colds clear up within 7–10 days.'],
  stomach: ['Sip water or an oral rehydration drink.', 'Try bland foods like rice, toast and bananas.', 'Avoid alcohol, coffee and fatty food for a day.'],
  back: ['Keep gently moving and avoid long bed rest.', 'Use heat for stiffness and a cold pack for a fresh strain.', 'Simple stretches twice a day can speed recovery.'],
  skin: ['Wash with mild, fragrance-free soap.', 'A cool compress can calm itching.', 'Note new foods, products or medicines from the last few days.'],
  dizzy: ['Sit or lie down until it passes.', 'Get up slowly and drink some water.', 'Eat something if you have skipped a meal.'],
  tired: ['Aim for 7–9 hours of sleep at regular times.', 'A 20-minute walk in daylight can lift energy.', 'Low iron or vitamin D can cause tiredness. Your last vitamin D result was low.'],
  general: ['Rest, stay hydrated and keep track of how you feel.', 'Write down when it started and anything that makes it better or worse.', 'Over-the-counter remedies can help with mild symptoms.'],
}

function pickSymptom(t) {
  return SYMPTOMS.find((s) => s.re.test(t)) || null
}

function triageLevel(duration, severity, symptom) {
  if (severity === 'Severe') return 'urgent'
  if (duration === 'More than a week') return 'gp'
  if (severity === 'Moderate' && (symptom === 'fever' || symptom === 'dizzy')) return 'gp'
  return 'self'
}

const LEVEL_TEXT = {
  self: 'This sounds manageable at home for now.',
  gp: 'It would be a good idea to see a doctor in the next few days.',
  urgent: 'Please get medical help today.',
}

export function greet() {
  return {
    text: `Hi ${USER.name.split(' ')[0]}! I can check symptoms, explain lab results, track your vitals and medications, and book a visit. What would you like to do?`,
    quick: ['Check a symptom', 'Show my vitals', 'Book a visit'],
  }
}

export function respond(input, ctx = {}) {
  const t = input.trim()
  const lower = t.toLowerCase()

  if (RED_FLAGS.test(lower)) {
    const mind = MIND_CRISIS.test(lower)
    return {
      text: mind
        ? 'I’m really glad you told me. You deserve support right now, and you don’t have to go through this alone.'
        : 'What you’re describing can be serious. Please don’t wait. Get emergency help now.',
      blocks: [{ type: 'emergency', mind }],
      flow: null,
    }
  }

  if (ctx.flow?.name === 'triage') {
    const f = ctx.flow
    if (f.step === 'duration') {
      return {
        text: 'Thanks. How bad is it right now?',
        quick: ['Mild', 'Moderate', 'Severe'],
        flow: { ...f, step: 'severity', duration: t },
      }
    }
    if (f.step === 'severity') {
      const level = triageLevel(f.duration, t, f.symptom)
      return {
        text: `${LEVEL_TEXT[level]} Here’s what I’d suggest for your ${f.label}.`,
        blocks: [{ type: 'triage', level, symptom: f.symptom, label: f.label, duration: f.duration, severity: t, tips: CARE[f.symptom] || CARE.general }],
        quick: level === 'self' ? ['Remind me to check in tomorrow', 'Book a visit anyway'] : ['Book a visit', 'Find care near me'],
        flow: null,
      }
    }
  }

  if (has(lower, /^(hi|hello|hey|good (morning|afternoon|evening))\b/) && lower.length < 24) return greet()

  if (has(lower, /remind me|reminder/)) {
    return {
      text: /refill/.test(lower) ? 'Done. I’ll remind you 5 days before your amlodipine runs out, on 24 Oct.' : /walk/.test(lower) ? 'Done. I’ll nudge you at 18:00 for a 30-minute walk.' : 'Done. I’ll check in with you tomorrow at 09:00 to see how you’re feeling.',
      blocks: [{ type: 'done', label: 'Reminder set' }],
    }
  }

  if (has(lower, /share with|send to my doctor/)) {
    return {
      text: 'I’ve shared this week’s vitals with Dr. Mia Chen. She usually replies within one working day.',
      blocks: [{ type: 'done', label: 'Shared securely' }],
    }
  }

  if (has(lower, /recipe/)) {
    return {
      text: 'Try this 20-minute salmon bowl. It’s high in omega-3 and fibre and low in salt.',
      blocks: [{ type: 'list', items: ['Bake a salmon fillet at 200 °C for 12 minutes.', 'Serve on brown rice with spinach, edamame and avocado.', 'Dress with lemon, olive oil and sesame instead of soy sauce.'] }],
      quick: ['How much water should I drink?'],
    }
  }

  if (has(lower, /lower blood pressure|reduce blood pressure/)) {
    return {
      text: 'Small daily habits make a real difference for blood pressure:',
      blocks: [{ type: 'list', items: ['Cut back on salt to under 5 g a day. Watch bread, sauces and ready meals.', 'Move for 30 minutes on most days. Brisk walking counts.', 'Keep alcohol to a minimum and avoid smoking.', 'Take your amlodipine at the same time every morning.', 'Practise slow breathing for 5 minutes when stressed.'] }],
      quick: ['Start a breathing exercise', 'Remind me to walk at 18:00'],
    }
  }

  if (has(lower, /lower ldl|ldl down|cholesterol down/)) {
    return {
      text: 'To bring LDL down naturally:',
      blocks: [{ type: 'list', items: ['Swap butter and fatty meat for olive oil, fish and nuts.', 'Eat more soluble fibre: oats, beans, lentils and apples.', 'Get 150 minutes of moderate exercise a week.', 'Recheck your levels in about 3 months.'] }],
      quick: ['Plan a heart-healthy meal', 'Book a follow-up'],
    }
  }

  if (has(lower, /vitamin d|supplement/)) {
    return {
      text: 'At 21 ng/mL your vitamin D is below the 30 ng/mL target. Many doctors suggest 1,000–2,000 IU a day plus some daylight, and you already take 2,000 IU at 13:00. It’s worth rechecking in 3 months.',
      quick: ['What medications do I take today?'],
    }
  }

  if (has(lower, /ibuprofen/)) {
    return {
      text: 'Ibuprofen can raise blood pressure and reduce how well amlodipine works if used often. For an occasional headache, paracetamol is usually the gentler choice. Check with your pharmacist if you need it for more than a few days.',
      quick: ['Find a pharmacy near me'],
    }
  }

  if (has(lower, /falling asleep|wind[- ]down/)) {
    return {
      text: 'A simple wind-down routine:',
      blocks: [{ type: 'list', items: ['Dim lights and screens 60 minutes before bed.', 'Keep the bedroom cool, around 18 °C.', 'No caffeine after 14:00.', 'Try 4-7-8 breathing in bed.'] }],
      quick: ['Start a breathing exercise'],
    }
  }

  if (has(lower, /check[- ]?in|how am i doing|daily/)) {
    return {
      text: 'Good morning! Here’s your quick check-in. Your resting heart rate and blood pressure are steady. You have one medication left to take today.',
      blocks: [{ type: 'checkin' }],
      quick: ['How should I feel today?', 'Show my vitals', 'What medications do I take today?'],
    }
  }

  if (has(lower, /check a symptom|symptom/) && !pickSymptom(lower)) {
    return {
      text: 'Of course. Tell me what you’re feeling, for example “sore throat and fever since yesterday”.',
      quick: ['Headache', 'Fever', 'Stomach upset', 'Back pain'],
    }
  }

  const sym = pickSymptom(lower)
  if (sym && !has(lower, /sleep (score|schedule)|how did i sleep/)) {
    return {
      text: `Sorry you’re dealing with ${sym.name === 'tiredness' ? 'feeling tired' : `a ${sym.name}`}. A couple of quick questions so I can guide you. How long has it been going on?`,
      quick: ['Less than a day', '1–3 days', 'More than a week'],
      flow: { name: 'triage', step: 'duration', symptom: sym.key, label: sym.name },
    }
  }

  if (has(lower, /blood pressure|\bbp\b|heart rate|pulse|vital|oxygen|spo2|steps/)) {
    const bp = VITALS.bp
    return {
      text: `Your blood pressure has come down from ${bp.sys[0]}/${bp.dia[0]} to ${bp.now} this week. That’s heading the right way, though it’s still a little above the 120/80 target. Your resting heart rate of ${VITALS.heart.now} bpm and oxygen of ${VITALS.spo2.now}% look great.`,
      blocks: [{ type: 'vitals' }],
      quick: ['Tips to lower blood pressure', 'Share with my doctor'],
    }
  }

  if (has(lower, /lab|blood test|result|cholesterol|a1c|glucose|vitamin d|thyroid|tsh|ldl|hdl|report|upload/)) {
    const flagged = LABS.filter((l) => l.value < l.low || l.value > l.high)
    return {
      text: `I’ve read your blood panel from 2 Oct. ${LABS.length - flagged.length} of ${LABS.length} results are in range. Two are worth a look: LDL cholesterol is a little high and vitamin D is low. Neither is urgent, and both respond well to simple changes.`,
      blocks: [{ type: 'labs' }],
      quick: ['How do I lower LDL?', 'Should I take vitamin D?', 'Book a follow-up'],
    }
  }

  if (has(lower, /medication|meds|pill|dose|prescription|remind|amlodipine|ibuprofen|paracetamol|take today/)) {
    const left = MEDS.filter((m) => !m.taken).length
    return {
      text: `You have ${MEDS.length} items on today’s plan and ${left} still to take. Tap one to mark it as taken. There are no known interactions between them.`,
      blocks: [{ type: 'meds' }],
      quick: ['Can I take ibuprofen with these?', 'Set a refill reminder'],
    }
  }

  if (has(lower, /book|appointment|doctor|visit|clinic|follow[- ]?up|see someone/)) {
    return {
      text: 'Here are the next available appointments. Pick a time that suits you and I’ll book it.',
      blocks: [{ type: 'slots' }],
    }
  }

  if (has(lower, /near me|nearby|urgent care|pharmacy|hospital|find care/)) {
    return {
      text: 'Here’s the care closest to you right now:',
      blocks: [{ type: 'clinics' }],
    }
  }

  if (has(lower, /sleep|insomnia|bed ?time|nap|shift work/)) {
    return {
      text: `You averaged ${SLEEP.avg} a night this week, with a sleep score of ${SLEEP.score}. Thursday was short at 6h 12m. A steady bedtime around 23:00 would help.`,
      blocks: [{ type: 'sleep' }],
      quick: ['Tips for falling asleep', 'Start a wind-down routine'],
    }
  }

  if (has(lower, /stress|anxi|panic|calm|breath|overwhelm|relax/)) {
    return {
      text: 'Let’s slow things down together. Follow the circle: breathe in for 4, hold for 7, out for 8. Three rounds is enough to feel a difference.',
      blocks: [{ type: 'breathe' }],
      quick: ['Talk to someone', 'Tips for stress'],
    }
  }

  if (has(lower, /diet|eat|food|meal|calorie|protein|water|hydrat|nutrition|heart-healthy/)) {
    return {
      text: 'Here’s a heart-friendly plate for today, tuned for your cholesterol and blood pressure:',
      blocks: [{ type: 'plate' }],
      quick: ['Give me a recipe', 'How much water should I drink?'],
    }
  }

  if (has(lower, /talk to someone|human|nurse/)) {
    return {
      text: 'A nurse is available on chat or phone 24/7 through your plan. Want me to connect you?',
      blocks: [{ type: 'contact' }],
    }
  }

  return {
    text: 'I can help with that. To give you the most useful answer, could you tell me a bit more? For example, what you’re feeling, which result you’re asking about, or what you’d like to track.',
    quick: ['Check a symptom', 'Explain my lab results', 'Show my vitals'],
  }
}

export function improvePrompt(text) {
  const t = text.trim()
  if (!t) return 'I’d like a quick health check-in. Summarise my vitals, medications and anything I should watch this week.'
  if (/explain|simple terms/i.test(t)) return t
  return `${t.replace(/[.?!]*$/, '')}. Please explain in simple terms and tell me when I should see a doctor.`
}
