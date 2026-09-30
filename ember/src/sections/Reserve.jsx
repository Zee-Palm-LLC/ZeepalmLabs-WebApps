import { useEffect, useId, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { seating } from "../data.js";
import { availability, bookingCode, dayLabel, isClosed, longDate, times, upcomingDays } from "../lib/booking.js";
import Magnetic from "../components/Magnetic.jsx";
import Reveal from "../components/Reveal.jsx";

const statusText = { open: "Available", few: "Few left", full: "Full" };

function firstOpenDay(days) {
  return days.findIndex((day) => !isClosed(day));
}

export default function Reserve() {
  const { reduced, cutRequest, bell, tick } = useApp();
  const days = useMemo(() => upcomingDays(14), []);
  const [seat, setSeat] = useState("counter");
  const [guests, setGuests] = useState(2);
  const [dayIndex, setDayIndex] = useState(() => firstOpenDay(days));
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [booked, setBooked] = useState(null);
  const ticketRef = useRef(null);
  const nameId = useId();
  const phoneId = useId();
  const noteId = useId();

  const seatInfo = seating.find((item) => item.key === seat);
  const day = days[dayIndex];

  useEffect(() => {
    if (!cutRequest) return;
    const weight = cutRequest.weight >= 1000 ? `${(cutRequest.weight / 1000).toFixed(1)} kg` : `${cutRequest.weight} g`;
    setNote(`Please save a ${cutRequest.cut}, ${weight}, ${cutRequest.level.toLowerCase()}.`);
  }, [cutRequest]);

  useEffect(() => {
    if (guests > seatInfo.max) setGuests(seatInfo.max);
  }, [seatInfo, guests]);

  useEffect(() => {
    if (time && availability(day, time, seat, guests) === "full") setTime("");
  }, [day, seat, guests, time]);

  useEffect(() => {
    if (!booked || reduced) return;
    gsap.fromTo(ticketRef.current, { clipPath: "inset(0% 0% 100% 0%)", y: -20 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.4, ease: "steps(14)" });
    gsap.fromTo(".booked-stamp", { scale: 2.4, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: -9, duration: 0.5, delay: 1.35, ease: "back.out(2)" });
  }, [booked, reduced]);

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!time) next.time = "Pick a time for your table.";
    if (!name.trim()) next.name = "Enter the name for the booking.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = "Enter a phone number so we can reach you on the day.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const code = bookingCode([name, phone, day.toDateString(), time, seat]);
    setBooked({ code, name: name.trim(), seat: seatInfo.name, guests, date: longDate(day), time, note: note.trim() });
    bell();
  };

  const changeBooking = () => {
    setBooked(null);
    tick();
  };

  return (
    <section className="reserve" id="book" aria-labelledby="book-heading">
      <div className="reserve-head">
        <Reveal text="Book a table" id="book-heading" className="display" />
        <p className="lede">
          We hold tables for fifteen minutes. For groups over eight, call us on the number below.
        </p>
      </div>

      <div className="reserve-grid">
        <form className="reserve-form" onSubmit={submit} noValidate>
          <fieldset className="reserve-block">
            <legend>Where would you like to sit?</legend>
            <div className="seat-options">
              {seating.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`seat seat-${item.key}`}
                  aria-pressed={seat === item.key}
                  onClick={() => {
                    setSeat(item.key);
                    tick();
                  }}
                >
                  <span className="seat-plan" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="seat-name">{item.name}</span>
                  <span className="seat-body">{item.body}</span>
                  <span className="seat-max">Up to {item.max} guests</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="reserve-block reserve-guests">
            <legend>Guests</legend>
            <div className="stepper">
              <button type="button" onClick={() => setGuests((value) => Math.max(1, value - 1))} disabled={guests <= 1} aria-label="One fewer guest">
                −
              </button>
              <output aria-live="polite">
                {guests} {guests === 1 ? "guest" : "guests"}
              </output>
              <button
                type="button"
                onClick={() => setGuests((value) => Math.min(seatInfo.max, value + 1))}
                disabled={guests >= seatInfo.max}
                aria-label="One more guest"
              >
                +
              </button>
            </div>
          </fieldset>

          <fieldset className="reserve-block">
            <legend>Date</legend>
            <div className="date-strip" data-lenis-prevent>
              {days.map((date, index) => {
                const closed = isClosed(date);
                return (
                  <button
                    key={date.toDateString()}
                    type="button"
                    className="date"
                    aria-pressed={index === dayIndex}
                    disabled={closed}
                    onClick={() => setDayIndex(index)}
                    aria-label={`${longDate(date)}${closed ? ", closed" : ""}`}
                  >
                    <span className="date-day">{dayLabel(date, index)}</span>
                    <span className="date-number">{date.getDate()}</span>
                    <span className="date-month">{closed ? "Closed" : date.toLocaleDateString("en-GB", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="reserve-block">
            <legend>Time</legend>
            <div className="time-grid">
              {times.map((slot) => {
                const status = availability(day, slot, seat, guests);
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`time time-${status}`}
                    aria-pressed={time === slot}
                    disabled={status === "full"}
                    onClick={() => setTime(slot)}
                  >
                    <span className="time-value">{slot}</span>
                    <span className="time-status">{statusText[status]}</span>
                  </button>
                );
              })}
            </div>
            {errors.time && <p className="field-error">{errors.time}</p>}
          </fieldset>

          <div className="reserve-block reserve-fields">
            <div className="field">
              <label htmlFor={nameId}>Name</label>
              <input
                id={nameId}
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor={phoneId}>Phone</label>
              <input
                id={phoneId}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
            <div className="field field-wide">
              <label htmlFor={noteId}>Anything we should know?</label>
              <textarea
                id={noteId}
                rows="2"
                value={note}
                placeholder="Allergies, a birthday, a steak you want us to hold"
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>

          <Magnetic>
            <button type="submit" className="button button-ember reserve-submit">
              Book table
            </button>
          </Magnetic>
        </form>

        <aside className="reserve-ticket-wrap" aria-live="polite">
          <span className="printer" aria-hidden="true" />
          <div ref={ticketRef} className={`reserve-ticket ${booked ? "is-booked" : ""}`}>
            {booked ? (
              <>
                <p className="ticket-row ticket-head">
                  <span>Ember</span>
                  <span>{booked.code}</span>
                </p>
                <span className="ticket-rule" />
                <p className="reserve-ticket-title">Table booked</p>
                <p className="ticket-row">
                  <span>{booked.date}</span>
                </p>
                <p className="ticket-row">
                  <span>{booked.time}</span>
                  <span>
                    {booked.guests} {booked.guests === 1 ? "guest" : "guests"}
                  </span>
                </p>
                <p className="ticket-row">
                  <span>{booked.seat}</span>
                </p>
                <p className="ticket-row">
                  <span>Name: {booked.name}</span>
                </p>
                {booked.note && <p className="ticket-note">{booked.note}</p>}
                <span className="ticket-rule" />
                <p className="ticket-small">We’ll text you the day before. Running late? Call 020 7946 0321.</p>
                <span className="booked-stamp">Booked</span>
                <button type="button" className="text-button" onClick={changeBooking}>
                  Change booking
                </button>
              </>
            ) : (
              <>
                <p className="ticket-row ticket-head">
                  <span>Ember</span>
                  <span>Draft</span>
                </p>
                <span className="ticket-rule" />
                <p className="reserve-ticket-title">Your table</p>
                <p className="ticket-row">
                  <span>{longDate(day)}</span>
                </p>
                <p className="ticket-row">
                  <span>{time || "Time not picked"}</span>
                  <span>
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </span>
                </p>
                <p className="ticket-row">
                  <span>{seatInfo.name}</span>
                </p>
                {note && <p className="ticket-note">{note}</p>}
                <span className="ticket-rule" />
                <p className="ticket-small">This ticket prints when you book.</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
