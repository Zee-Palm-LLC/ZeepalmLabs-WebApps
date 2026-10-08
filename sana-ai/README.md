# Sana-AI

Live: [zeepalm-sana-ai.vercel.app](https://zeepalm-sana-ai.vercel.app)

A health assistant chatbot built in React. It recreates a Dribbble AI chatbot design pixel for pixel, with the content changed from crypto to health, and a working conversation behind it.

## Design credit

Based on the Dribbble shot [AI ChatBot UX/UI Design](https://dribbble.com/shots/27266845-AI-ChatBot-UX-UI-Design) by Alamgir Hossain. The original is a crypto assistant called Sorin-AI. The layout, colors and type follow the shot; the health content, the chat engine, the cards and the motion are ours. Credit the original shot when you post this.

## How it was matched

- The app area of the 3200 × 2400 shot is a 1440 × 979 layout at 2× density. The page is built at that size and scaled to fit the window, so at 1440 × 979 it lines up with the shot.
- **Type:** Geologica, chosen by rendering 30 candidate fonts and scoring them against the headline (92% shape match). Every text size and weight was then solved from the shot's ink widths, for example 30 px/500 for the greeting and 17 px for the menu.
- **Colors:** sampled from the shot. The brand mint is `#28F6AE` and the panels are `#F3F3F3`.
- **Avatar:** cut from the shot and upscaled with EDSR.

## What changed for health

| Sorin-AI (crypto) | Sana-AI (health) |
| --- | --- |
| Market Daily, My Portfolio, My Monitor, My Project | Daily Check-in, My Health, Vitals Monitor, My Records |
| Hot Topics, 24h Trends, Tokenized Assets, Prediction, Excute, Monitor | Symptoms, Vitals, Lab Results, Medications, Book Visit, Sleep |
| Market Rader | Health Radar: nearby urgent care, pharmacy and ER |
| Wallet address | Patient record number with a profile card |
| Official Bots | Connected Trackers: heart rate, steps, sleep, glucose and more |

## The chatbot

Type anything or tap a chip. Sana answers with streamed text and a rich card:

| Ask about | You get |
| --- | --- |
| A symptom, e.g. “I have a headache” | A short triage: how long, how bad, then a self-care / see a doctor / get care today card with tips and warning signs |
| Vitals or blood pressure | Heart rate, blood pressure, oxygen and steps with 7-day sparklines |
| Lab results, or attaching a report | Each marker on a range bar with High / Low / Normal and a plain-language note |
| Medications | Today’s doses you can tick off, with a progress bar |
| Booking a visit | Doctors with open slots; pick one and it confirms the booking |
| Sleep | Nightly bars against a goal, plus sleep stages |
| Stress or anxiety | A guided 4-7-8 breathing circle |
| Food | A heart-healthy plate |
| Chest pain, trouble breathing, stroke signs, self-harm | It stops and shows emergency numbers (911, or 988 for mental health) |

The composer works like the design: **+** opens quick actions, **Auto** switches between Auto, Clinical, Coach and Mind, the wand rewrites your message to be clearer, and the file icon attaches a report. Quick-reply buttons follow each answer. **New Chat** clears the thread, past chats reopen from the sidebar, and trackers connect or disconnect on click.

Dashboard, Labs and Help also work. They show a health score, vitals, activity, medications, sleep and the next visit; lab trends for each marker; and an FAQ with nurse and emergency contacts.

Sana is a demo. Its answers come from a rule-based engine on the page, the health data is sample data, and it says clearly that it is not a diagnosis.

## Phones and tablets

Below 900 px the app switches to a phone layout built for touch:

- a single compact header, with a **bottom tab bar** for Dashboard, Chat, Help and Labs;
- the sidebar slides out as a drawer with its own close button;
- the quick chips become a 3 × 2 grid of icon tiles (one row of six on tablets);
- a compact composer: one-line input, with **+**, the mode switch, the tools and **Send** on one row;
- full-width answer cards, with the bot avatar and name in a small header line above each answer;
- quick replies and doctor time slots scroll sideways;
- Health Radar and the profile open as bottom sheets;
- dynamic viewport height and safe-area insets, so nothing hides under the browser bars or the home indicator.

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

The site is the Vercel project `sana-ai`, with Root Directory `sana-ai` and the Vite preset. The project is not connected to Git, so to redeploy, deploy the latest commit of `main` to it.
