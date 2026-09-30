import { useApp } from "../app-context.js";

export default function Header() {
  const { soundOn, toggleSound } = useApp();

  return (
    <>
      <header className="header">
        <a href="#top" className="header-mark">
          Repline
        </a>
        <a href="#waitlist" className="header-link">
          Join waitlist
        </a>
      </header>
      <button
        type="button"
        className={`sound-pill ${soundOn ? "is-on" : ""}`}
        aria-pressed={soundOn}
        onClick={toggleSound}
      >
        <span className="sound-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {soundOn ? "Sound on" : "Sound off"}
      </button>
    </>
  );
}
