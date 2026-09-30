import { useEffect, useState } from "react";
import { useApp } from "../app-context.js";

const links = [
  { href: "#cook", label: "The cook" },
  { href: "#fire", label: "Fire" },
  { href: "#cuts", label: "Cuts" },
  { href: "#menu", label: "Menu" },
  { href: "#visit", label: "Visit" },
];

export default function Header() {
  const { soundOn, toggleSound } = useApp();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`header ${solid ? "is-solid" : ""} ${open ? "is-open" : ""}`}>
      <a href="#top" className="header-mark" onClick={() => setOpen(false)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2c1.2 3.6 5 5.6 5 10.4a5 5 0 0 1-10 0c0-2.8 1.5-4.2 2.7-5.8 0 2 .8 3.1 1.9 3.5-.8-2.7 0-5.7.4-8.1z" />
        </svg>
        Ember
      </a>
      <nav aria-label="Main" className="header-nav">
        <ul id="header-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="header-actions">
        <button type="button" className={`sound ${soundOn ? "is-on" : ""}`} aria-pressed={soundOn} onClick={toggleSound}>
          <span className="sound-flame" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="sound-label">{soundOn ? "Fire on" : "Fire off"}</span>
        </button>
        <a href="#book" className="button button-ember header-book" onClick={() => setOpen(false)}>
          Book a table
        </a>
        <button
          type="button"
          className="header-toggle"
          aria-expanded={open}
          aria-controls="header-links"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
