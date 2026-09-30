import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useApp } from "../app-context.js";
import { chapters } from "../story.js";
import { frames, load, phaseAt, speedCurve, telemetry } from "../lib/lift.js";
import { range, smooth, windowOpacity } from "../lib/math.js";
import StoryWidget from "../components/widgets.jsx";

const easing = 0.1;
const cardFade = 0.03;
const titleEnd = 0.05;
const letters = "REPLINE".split("");

export default function ScrubStory({ onLoadProgress, onReady }) {
  const { started, blip, scrollTo } = useApp();
  const [active, setActive] = useState(-1);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const shadeRef = useRef(null);
  const titleRef = useRef(null);
  const letterRefs = useRef([]);
  const taglineRef = useRef(null);
  const hintRef = useRef(null);
  const cardRefs = useRef([]);
  const widgetRefs = useRef([]);
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const hudRef = useRef(null);
  const phaseRef = useRef(null);
  const frameRef = useRef(null);
  const traceRef = useRef(null);
  const playheadRef = useRef(null);
  const speedRef = useRef(null);
  const heightRef = useRef(null);
  const powerRef = useRef(null);
  const flareRef = useRef(null);
  const curve = useMemo(() => speedCurve(1000, 100), []);

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
    const fallback = setTimeout(finish, 7000);

    return () => {
      video.removeEventListener("progress", report);
      video.removeEventListener("canplaythrough", finish);
      window.removeEventListener("touchstart", prime);
      clearTimeout(fallback);
    };
  }, [onLoadProgress, onReady]);

  useEffect(() => {
    const video = videoRef.current;
    const cards = cardRefs.current;
    let target = 0;
    let current = 0;
    let lastDrawn = -1;
    let lastActive = -1;
    let lastPhase = "";

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
      },
    });

    const tick = () => {
      current += (target - current) * easing;
      if (Math.abs(target - current) < 0.0002) current = target;
      if (current === lastDrawn) return;

      const canSeek = Boolean(video.duration) && !video.seeking;
      if (canSeek) {
        const time = current * (video.duration - 0.04);
        if (Math.abs(video.currentTime - time) > 0.008) video.currentTime = time;
      }

      const leaving = range(current, 0, titleEnd);
      letterRefs.current.forEach((letter, index) => {
        letter.style.transform = `translate3d(0, ${-leaving * (40 + index * 34)}px, 0)`;
      });
      titleRef.current.style.opacity = String(1 - smooth(leaving));
      titleRef.current.style.visibility = leaving >= 1 ? "hidden" : "visible";
      taglineRef.current.style.opacity = String(1 - range(current, 0, titleEnd * 0.6));
      hintRef.current.style.opacity = String(1 - range(current, 0, 0.02));

      let nowActive = -1;
      cards.forEach((card, index) => {
        const [start, end] = chapters[index].range;
        const opacity = smooth(windowOpacity(current, start, end, cardFade));
        card.style.opacity = String(opacity);
        card.style.transform = `translate3d(0, ${(1 - opacity) * 32}px, 0) scale(${0.96 + opacity * 0.04})`;
        card.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        if (opacity > 0.001) {
          nowActive = index;
          widgetRefs.current[index].update(range(current, start, end));
        }
      });

      if (nowActive !== lastActive) {
        lastActive = nowActive;
        setActive(nowActive);
        if (nowActive >= 0) blip(520 + nowActive * 70);
      }

      const data = telemetry(current);
      speedRef.current.textContent = data.velocity.toFixed(2);
      heightRef.current.textContent = data.height.toFixed(2);
      powerRef.current.textContent = String(Math.round(data.power)).padStart(4, "0");
      frameRef.current.textContent = String(Math.round(current * (frames - 1)) + 1).padStart(3, "0");

      const phase = phaseAt(current);
      if (phase !== lastPhase) {
        lastPhase = phase;
        phaseRef.current.textContent = phase;
      }

      const shown = range(current, 0.025, 0.06) * (1 - range(current, 0.9, 0.935));
      hudRef.current.style.opacity = String(shown);
      railRef.current.style.opacity = String(shown);
      railRef.current.style.visibility = shown > 0.01 ? "visible" : "hidden";
      fillRef.current.style.transform = `scaleY(${current})`;
      playheadRef.current.style.left = `${current * 100}%`;
      traceRef.current.style.clipPath = `inset(0 ${100 - current * 100}% 0 0)`;

      shadeRef.current.style.opacity = String(1 - range(current, 0.88, 0.95));
      flareRef.current.style.opacity = String(smooth(range(current, 0.95, 0.992)));

      lastDrawn = canSeek ? current : -1;
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
    };
  }, [blip]);

  const jumpTo = (index) => {
    const section = sectionRef.current;
    const [start, end] = chapters[index].range;
    const middle = (start + end) / 2;
    scrollTo(section.offsetTop + middle * (section.offsetHeight - window.innerHeight), { duration: 1.6 });
  };

  return (
    <section ref={sectionRef} className="scrub" id="story" aria-label="How Repline follows a lift">
      <div className="scrub-stage">
        <video
          ref={videoRef}
          className="scrub-video"
          src="./scrub.mp4"
          poster="./still-floor.jpg"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div ref={shadeRef} className="scrub-shade" aria-hidden="true" />

        <div ref={titleRef} className={`scrub-title ${started ? "is-in" : ""}`}>
          <h1 className="brand" aria-label="Repline">
            {letters.map((letter, index) => (
              <span
                key={index}
                ref={(node) => {
                  letterRefs.current[index] = node;
                }}
                className="brand-letter"
                aria-hidden="true"
              >
                <span className="brand-letter-inner" style={{ "--i": index }}>
                  {letter}
                </span>
              </span>
            ))}
          </h1>
          <p ref={taglineRef} className="tagline">
            <span>One rep at a time.</span>
          </p>
        </div>

        {chapters.map((chapter, index) => (
          <article
            key={chapter.key}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className={`story-card story-card-${chapter.place}`}
          >
            <p className="story-count">
              {index + 1} of {chapters.length}
            </p>
            <h2>{chapter.title}</h2>
            <p className="story-body">{chapter.body}</p>
            <StoryWidget
              kind={chapter.key}
              ref={(node) => {
                widgetRefs.current[index] = node;
              }}
            />
          </article>
        ))}

        <nav ref={railRef} className="rail" aria-label="Chapters">
          <span className="rail-line" aria-hidden="true">
            <span ref={fillRef} className="rail-fill" />
          </span>
          {chapters.map((chapter, index) => (
            <button
              key={chapter.key}
              type="button"
              className={`rail-stop ${index === active ? "is-active" : ""}`}
              style={{ top: `${((chapter.range[0] + chapter.range[1]) / 2) * 100}%` }}
              aria-current={index === active ? "step" : undefined}
              onClick={() => jumpTo(index)}
            >
              <span className="rail-tick" aria-hidden="true" />
              <span className="rail-label">{chapter.nav}</span>
            </button>
          ))}
        </nav>

        <div ref={hudRef} className="hud" aria-hidden="true">
          <div className="hud-left">
            <p ref={phaseRef} className="hud-phase">
              Approach
            </p>
            <p className="hud-meta">
              Frame <span ref={frameRef}>001</span> of {frames}, {load} kg
            </p>
          </div>
          <div className="hud-timeline">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="hud-curve">
              <path d={curve} />
            </svg>
            <svg ref={traceRef} viewBox="0 0 1000 100" preserveAspectRatio="none" className="hud-curve hud-trace">
              <path d={curve} />
            </svg>
            {chapters.map((chapter) => (
              <span
                key={chapter.key}
                className="hud-mark"
                style={{
                  left: `${chapter.range[0] * 100}%`,
                  width: `${(chapter.range[1] - chapter.range[0]) * 100}%`,
                }}
              />
            ))}
            <span ref={playheadRef} className="hud-playhead" />
          </div>
          <dl className="hud-readouts">
            <div className="hud-readout hud-readout-extra">
              <dt>Height</dt>
              <dd>
                <span ref={heightRef}>0.00</span> m
              </dd>
            </div>
            <div className="hud-readout hud-readout-extra">
              <dt>Power</dt>
              <dd>
                <span ref={powerRef}>0000</span> W
              </dd>
            </div>
            <div className="hud-readout hud-readout-main">
              <dt>Bar speed</dt>
              <dd>
                <span ref={speedRef}>0.00</span> m/s
              </dd>
            </div>
          </dl>
        </div>

        <p ref={hintRef} className="scroll-hint" aria-hidden="true">
          <span className="scroll-hint-line" />
          Scroll to lift
        </p>

        <div ref={flareRef} className="scrub-flare" aria-hidden="true" />
      </div>
    </section>
  );
}
