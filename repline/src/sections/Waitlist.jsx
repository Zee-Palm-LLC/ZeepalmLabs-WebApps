import { useId, useRef, useState } from "react";
import { useApp } from "../app-context.js";
import ChalkDust from "../components/ChalkDust.jsx";
import Magnetic from "../components/Magnetic.jsx";
import RevealText from "../components/RevealText.jsx";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Waitlist() {
  const { reduced, blip } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState("");
  const dustRef = useRef(null);
  const buttonRef = useRef(null);
  const inputId = useId();
  const messageId = useId();

  const submit = (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Enter your email address to join.");
      return;
    }
    if (!emailPattern.test(value)) {
      setError("That address needs an @ and a domain, like you@example.com.");
      return;
    }
    if (dustRef.current) {
      const box = buttonRef.current.getBoundingClientRect();
      dustRef.current.burst(box.left + box.width / 2, box.top + box.height / 2);
    }
    blip(880);
    setError("");
    setJoined(value);
  };

  return (
    <section className="waitlist" id="waitlist" aria-labelledby="waitlist-heading">
      {!reduced && <ChalkDust ref={dustRef} />}
      <div className="waitlist-inner">
        <RevealText text="First sensors ship in spring" id="waitlist-heading" className="display" />
        <p className="section-lede">Join the waitlist to get one from the first batch at the launch price.</p>

        {joined ? (
          <div className="waitlist-done" role="status">
            <p className="waitlist-done-title">You’re on the waitlist.</p>
            <p>We’ll email {joined} when the first sensors ship. Early spots get the launch price.</p>
          </div>
        ) : (
          <form className="waitlist-form" onSubmit={submit} noValidate>
            <label htmlFor={inputId} className="visually-hidden">
              Email address
            </label>
            <div className={`waitlist-field ${error ? "has-error" : ""}`}>
              <input
                id={inputId}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={messageId}
              />
              <Magnetic strength={0.25}>
                <button ref={buttonRef} type="submit" className="button button-lime waitlist-button">
                  Join waitlist
                </button>
              </Magnetic>
            </div>
            <p id={messageId} className={error ? "waitlist-error" : "waitlist-note"} aria-live="polite">
              {error || "One email when sensors ship. Nothing else."}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
