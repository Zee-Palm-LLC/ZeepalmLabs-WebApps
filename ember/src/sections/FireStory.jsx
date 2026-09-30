import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "../app-context.js";
import { chapters, place } from "../data.js";
import { clock, cookState, cookSteps, doneness } from "../lib/cook.js";
import { range, smooth, windowOpacity } from "../lib/math.js";

const easing = 0.1;
const letters = "EMBER".split("");
const probeMin = 0;
const probeMax = 70;
const probeMarks = [
  { temp: 50, label: "Rare" },
  { temp: 55, label: "Med-rare" },
  { temp: 60, label: "Medium" },
];
const scatter = [
  { x: -140, y: -260, r: -38 },
  { x: -60, y: -340, r: 24 },
  { x: 20, y: -300, r: -12 },
  { x: 90, y: -360, r: 30 },
  { x: 170, y: -240, r: -26 },
];

function Ticket({ ticketRef, stepRefs, timerRef, sideRef }) {
  return (
    <div ref={ticketRef} className="ticket" aria-hidden="true">
      <span className="ticket-clip" />
      <div className="ticket-paper">
        <p className="ticket-row ticket-head">
          <span>Table 7</span>
          <span>19:42</span>
        </p>
        <p className="ticket-row">
          <span>Covers 2</span>
          <span>Fire counter</span>
        </p>
        <span className="ticket-rule" />
        <p className="ticket-order">1 × Ribeye 450g</p>
        <p className="ticket-mod">Medium-rare, peppercorn</p>
        <span className="ticket-rule" />
        <ol className="ticket-steps">
          {cookSteps.map((step, index) => (
            <li
              key={step.key}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              className="ticket-step"
            >
              <span className="ticket-box" />
              {step.label}
            </li>
          ))}
        </ol>
        <span className="ticket-rule" />
        <p className="ticket-row ticket-foot">
          <span ref={timerRef}>On grill 00:00</span>
          <span>
            Side <span ref={sideRef}>-</span>
          </span>
        </p>
      </div>
    </div>
  );
}

export default function FireStory({ onLoadProgress, onReady }) {
  const { started, scrollTo, bell, tick } = useApp();
  const [active, setActive] = useState(-1);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const shadeRef = useRef(null);
  const heroRef = useRef(null);
  const letterRefs = useRef([]);
  const heroMetaRef = useRef(null);
  const hintRef = useRef(null);
  const chapterRefs = useRef([]);
  const ticketRef = useRef(null);
  const stepRefs = useRef([]);
  const timerRef = useRef(null);
  const sideRef = useRef(null);
  const probeRef = useRef(null);
  const probeFillRef = useRef(null);
  const coreRef = useRef(null);
  const donenessRef = useRef(null);
  const grillRef = useRef(null);
  const railRef = useRef(null);
  const railFillRef = useRef(null);
  const flareRef = useRef(null);
  const heatRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    let finished = false;

    const report = () => {
      if (!video.duration || !video.buffered.length) return;
      onLoadProgress(video.buffered.end(video.buffered.length - 1) / video.duration);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      onLoadProgress(1);
      onReady();
    };

    const prime = () => {
      const attempt = video.play();
      if (attempt && attempt.then) attempt.then(() => video.pause()).catch(() => {});
    };

    video.addEventListener("progress", report);
    video.addEventListener("canplaythrough", finish);
    window.addEventListener("touchstart", prime, { once: true, passive: true });
    if (video.readyState >= 4) finish();
    const fallback = setTimeout(finish, 8000);

    return () => {
      video.removeEventListener("progress", report);
      video.removeEventListener("canplaythrough", finish);
      window.removeEventListener("touchstart", prime);
      clearTimeout(fallback);
    };
  }, [onLoadProgress, onReady]);

  useEffect(() => {
    const video = videoRef.current;
    let target = 0;
    let current = 0;
    let lastDrawn = -1;
    let lastActive = -1;
    let lastStep = -1;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
      },
    });

    const frame = () => {
      current += (target - current) * easing;
      if (Math.abs(target - current) < 0.0002) current = target;
      if (current === lastDrawn) return;

      const canSeek = Boolean(video.duration) && !video.seeking;
      if (canSeek) {
        const time = current * (video.duration - 0.04);
        if (Math.abs(video.currentTime - time) > 0.008) video.currentTime = time;
      }

      const leave = smooth(range(current, 0, 0.045));
      letterRefs.current.forEach((letter, index) => {
        const path = scatter[index];
        letter.style.transform = `translate3d(${path.x * leave}px, ${path.y * leave}px, 0) rotate(${path.r * leave}deg)`;
        letter.style.filter = `blur(${leave * 10}px)`;
      });
      heroRef.current.style.opacity = String(1 - leave);
      heroRef.current.style.visibility = leave >= 1 ? "hidden" : "visible";
      heroMetaRef.current.style.opacity = String(1 - range(current, 0, 0.02));
      hintRef.current.style.opacity = String(1 - range(current, 0, 0.015));

      let nowActive = -1;
      chapterRefs.current.forEach((node, index) => {
        const [start, end] = chapters[index].range;
        const opacity = windowOpacity(current, start, end, 0.025);
        node.style.opacity = String(smooth(opacity));
        node.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        if (opacity > 0.4) nowActive = index;
      });
      if (nowActive !== lastActive) {
        lastActive = nowActive;
        setActive(nowActive);
      }

      const state = cookState(current);
      if (state.stepIndex !== lastStep) {
        const forward = state.stepIndex > lastStep;
        lastStep = state.stepIndex;
        stepRefs.current.forEach((node, index) => {
          node.classList.toggle("is-done", index < state.stepIndex || (index === state.stepIndex && index === cookSteps.length - 1));
          node.classList.toggle("is-now", index === state.stepIndex && index < cookSteps.length - 1);
        });
        if (forward && state.stepIndex === cookSteps.length - 1) bell();
        else if (forward && state.stepIndex >= 0) tick();
      }
      timerRef.current.textContent = state.resting ? `Resting ${clock(state.restSeconds)}` : `On grill ${clock(state.cookSeconds)}`;
      sideRef.current.textContent = state.side || "-";

      const fill = (state.core - probeMin) / (probeMax - probeMin);
      probeFillRef.current.style.transform = `scaleY(${fill})`;
      coreRef.current.textContent = state.core.toFixed(1);
      donenessRef.current.textContent = doneness(state.core);
      grillRef.current.textContent = String(state.grill).padStart(3, "0");
      heatRef.current.style.opacity = String(0.25 + (state.grill / 470) * 0.75);

      const shown = range(current, 0.03, 0.07) * (1 - range(current, 0.92, 0.95));
      [ticketRef, probeRef, railRef].forEach((ref) => {
        ref.current.style.opacity = String(shown);
        ref.current.style.visibility = shown > 0.01 ? "visible" : "hidden";
      });
      ticketRef.current.style.transform = `translate3d(0, ${(1 - shown) * -40}px, 0) rotate(${-2.5 + shown * 0.5}deg)`;
      railFillRef.current.style.transform = `scaleX(${current})`;

      shadeRef.current.style.opacity = String(1 - range(current, 0.9, 0.95));
      flareRef.current.style.opacity = String(smooth(range(current, 0.945, 0.995)));

      lastDrawn = canSeek ? current : -1;
    };

    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      trigger.kill();
    };
  }, [bell, tick]);

  const jumpTo = (index) => {
    const section = sectionRef.current;
    const [start, end] = chapters[index].range;
    const middle = (start + end) / 2;
    scrollTo(section.offsetTop + middle * (section.offsetHeight - window.innerHeight), { duration: 1.8 });
  };

  return (
    <section ref={sectionRef} className="cook" id="cook" aria-label="How a steak is cooked at Ember">
      <div className="cook-stage">
        <video
          ref={videoRef}
          className="cook-video"
          src="./scrub.mp4"
          poster="./poster.jpg"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div ref={shadeRef} className="cook-shade" aria-hidden="true" />
        <div ref={heatRef} className="cook-heat" aria-hidden="true" />

        <div ref={heroRef} className={`cook-hero ${started ? "is-in" : ""}`}>
          <h1 className="brand">
            <span className="visually-hidden">Ember</span>
            {letters.map((letter, index) => (
              <span
                key={index}
                ref={(node) => {
                  letterRefs.current[index] = node;
                }}
                className="brand-letter"
                aria-hidden="true"
              >
                <span className="brand-glyph" style={{ "--i": index }} data-letter={letter}>
                  {letter}
                </span>
              </span>
            ))}
          </h1>
          <div ref={heroMetaRef} className="cook-hero-meta">
            <p className="cook-hero-line">Everything we cook touches the fire.</p>
            <p className="cook-hero-place">
              {place.line}. Open from 17:30 tonight.
            </p>
          </div>
        </div>

        {chapters.map((chapter, index) => (
          <article
            key={chapter.key}
            ref={(node) => {
              chapterRefs.current[index] = node;
            }}
            className={`chapter ${index === active ? "is-active" : ""}`}
          >
            <p className="chapter-count">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="chapter-count-total">/ {String(chapters.length).padStart(2, "0")}</span>
            </p>
            <h2 className="chapter-title">
              {chapter.title.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="chapter-word" style={{ "--w": wordIndex }}>
                  <span>{word}</span>
                </span>
              ))}
            </h2>
            <p className="chapter-body">{chapter.body}</p>
          </article>
        ))}

        <Ticket ticketRef={ticketRef} stepRefs={stepRefs} timerRef={timerRef} sideRef={sideRef} />

        <div ref={probeRef} className="probe" aria-hidden="true">
          <p className="probe-grill">
            <span className="probe-caption">Grate</span>
            <span className="probe-grill-value">
              <span ref={grillRef}>000</span>°
            </span>
          </p>
          <div className="probe-scale">
            <span className="probe-tube">
              <span ref={probeFillRef} className="probe-fill" />
            </span>
            {probeMarks.map((mark) => (
              <span
                key={mark.temp}
                className="probe-mark"
                style={{ bottom: `${((mark.temp - probeMin) / (probeMax - probeMin)) * 100}%` }}
              >
                <span className="probe-mark-temp">{mark.temp}°</span>
                <span className="probe-mark-label">{mark.label}</span>
              </span>
            ))}
          </div>
          <p className="probe-core">
            <span className="probe-caption">Core</span>
            <span className="probe-core-value">
              <span ref={coreRef}>18.0</span>°C
            </span>
            <span ref={donenessRef} className="probe-doneness">
              Raw
            </span>
          </p>
        </div>

        <nav ref={railRef} className="rail" aria-label="Steps of the cook">
          <span className="rail-track" aria-hidden="true">
            <span ref={railFillRef} className="rail-fill" />
          </span>
          {chapters.map((chapter, index) => (
            <button
              key={chapter.key}
              type="button"
              className={`rail-stop ${index === active ? "is-active" : ""}`}
              style={{ left: `${chapter.range[0] * 100}%`, width: `${(chapter.range[1] - chapter.range[0]) * 100}%` }}
              aria-current={index === active ? "step" : undefined}
              onClick={() => jumpTo(index)}
            >
              <span className="rail-stop-label">{chapter.nav}</span>
            </button>
          ))}
        </nav>

        <p ref={hintRef} className="scroll-hint" aria-hidden="true">
          <span className="scroll-hint-line" />
          Scroll to cook
        </p>

        <div ref={flareRef} className="cook-flare" aria-hidden="true" />
      </div>
    </section>
  );
}
