import { useEffect, useState } from "react";
import { hours, place } from "../data.js";
import Reveal from "../components/Reveal.jsx";

const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toMinutes(text) {
  const [h, m] = text.split(":").map(Number);
  return h * 60 + m;
}

function londonNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return { day: get("weekday"), minutes: Number(get("hour")) * 60 + Number(get("minute")), clock: `${get("hour")}:${get("minute")}` };
}

function status(now) {
  const today = hours.find((entry) => entry.day === now.day);
  for (const [open, close] of today.slots) {
    if (now.minutes >= toMinutes(open) && now.minutes < toMinutes(close)) {
      return { open: true, text: `Open now. Kitchen closes at ${close === "24:00" ? "midnight" : close}.` };
    }
  }
  const later = today.slots.find(([open]) => toMinutes(open) > now.minutes);
  if (later) return { open: false, text: `Closed right now. Fire's lit, doors open at ${later[0]}.` };
  const start = order.indexOf(now.day);
  for (let step = 1; step <= 7; step += 1) {
    const next = hours.find((entry) => entry.day === order[(start + step) % 7]);
    if (next.slots.length) {
      return { open: false, text: `Closed for the night. Back ${step === 1 ? "tomorrow" : `on ${next.day}`} at ${next.slots[0][0]}.` };
    }
  }
  return { open: false, text: "Closed." };
}

function formatSlots(slots) {
  if (!slots.length) return "Closed";
  return slots.map(([open, close]) => `${open} to ${close === "24:00" ? "midnight" : close}`).join(", ");
}

export default function Visit() {
  const [now, setNow] = useState(londonNow);
  const current = status(now);

  useEffect(() => {
    const timer = setInterval(() => setNow(londonNow()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="visit" id="visit" aria-labelledby="visit-heading">
      <div className="visit-copy">
        <Reveal text="Find the fire" id="visit-heading" className="display" />
        <p className={`visit-status ${current.open ? "is-open" : ""}`}>
          <span className="visit-status-dot" aria-hidden="true" />
          {current.text}
          <span className="visit-clock">London time {now.clock}</span>
        </p>

        <div className="visit-columns">
          <address className="visit-address">
            <p className="visit-label">Address</p>
            <p>
              {place.street}
              <br />
              {place.city}
            </p>
            <p className="visit-label">Book or ask</p>
            <p>
              <a href={place.phoneHref}>{place.phone}</a>
              <br />
              <a href={`mailto:${place.email}`}>{place.email}</a>
            </p>
          </address>

          <table className="visit-hours">
            <caption className="visit-label">Opening hours</caption>
            <tbody>
              {hours.map((entry) => (
                <tr key={entry.day} className={entry.day === now.day ? "is-today" : ""}>
                  <th scope="row">{entry.day}</th>
                  <td>{formatSlots(entry.slots)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="visit-notes">
          <li>Six minutes’ walk from Farringdon station.</li>
          <li>Step-free entrance on the lane side, accessible toilet downstairs by lift.</li>
          <li>Dogs welcome on the terrace. Water bowls by the brazier.</li>
        </ul>
      </div>

      <div className="visit-map" role="img" aria-label="Map showing Ember on Foundry Lane, six minutes' walk from Farringdon station">
        <svg viewBox="0 0 600 520" aria-hidden="true">
          <rect width="600" height="520" className="map-ground" />
          <path d="M-20 110 L 620 170" className="map-road map-road-main" />
          <path d="M-20 360 L 620 300" className="map-road map-road-main" />
          <path d="M140 -20 L 210 540" className="map-road" />
          <path d="M400 -20 L 360 540" className="map-road" />
          <path d="M210 250 L 520 236" className="map-road map-road-lane" />
          <path d="M0 470 L 600 430" className="map-road" />
          <rect x="30" y="180" width="90" height="140" rx="6" className="map-block" />
          <rect x="228" y="176" width="150" height="46" rx="6" className="map-block" />
          <rect x="228" y="262" width="118" height="30" rx="6" className="map-block" />
          <rect x="420" y="190" width="150" height="80" rx="6" className="map-park" />
          <rect x="30" y="380" width="120" height="60" rx="6" className="map-block" />
          <rect x="420" y="330" width="150" height="80" rx="6" className="map-block" />
          <path d="M92 104 C 140 170, 190 220, 300 240" className="map-route" />
          <g className="map-station">
            <circle cx="88" cy="100" r="16" />
            <rect x="72" y="96" width="32" height="8" rx="2" />
          </g>
          <text x="40" y="70" className="map-text">Farringdon</text>
          <text x="238" y="232" className="map-text map-text-lane">Foundry Lane</text>
          <text x="440" y="226" className="map-text map-text-soft">Charterhouse Gardens</text>
          <g className="map-pin" transform="translate(300 240)">
            <circle r="34" className="map-pin-pulse" />
            <circle r="34" className="map-pin-pulse map-pin-pulse-late" />
            <circle r="13" className="map-pin-dot" />
            <path d="M0 -7 C 2 -2, 6 0, 6 4 A 6 6 0 0 1 -6 4 C -6 1, -3 -1, -2 -3 C -2 -1, -1 0, 0 1 C -1 -2, 0 -5, 0 -7 Z" className="map-pin-flame" />
          </g>
        </svg>
        <a className="visit-directions" href="https://www.google.com/maps/search/Farringdon+station+London" target="_blank" rel="noreferrer">
          Directions from Farringdon
        </a>
      </div>
    </section>
  );
}
