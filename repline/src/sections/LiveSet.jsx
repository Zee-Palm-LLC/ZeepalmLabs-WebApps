import { useEffect, useMemo, useReducer, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { dropLimit, maxReps, platesFor, repSpeed, setLoads } from "../lib/lift.js";
import Magnetic from "../components/Magnetic.jsx";
import RevealText from "../components/RevealText.jsx";

const initialSet = { load: 120, reps: [], status: "ready" };

function setReducer(state, action) {
  switch (action.type) {
    case "load":
      return { load: action.load, reps: [], status: "ready" };
    case "start":
      return { ...state, status: "lifting" };
    case "finish": {
      const reps = [...state.reps, action.speed];
      const drop = 1 - action.speed / Math.max(...reps);
      const done = drop >= dropLimit || reps.length >= maxReps;
      return { ...state, reps, status: done ? "done" : "ready" };
    }
    case "reset":
      return { ...state, reps: [], status: "ready" };
    default:
      return state;
  }
}

function summary(reps) {
  if (!reps.length) return { best: 0, last: 0, drop: 0 };
  const best = Math.max(...reps);
  const last = reps[reps.length - 1];
  return { best, last, drop: 1 - last / best };
}

function statusLine(status, reps, drop) {
  if (status === "done" && drop >= dropLimit) {
    return `Rack it. Speed is down ${Math.round(drop * 100)}% from your best rep, so the next one is a grind.`;
  }
  if (status === "done") return "Eight clean reps. That weight is too light for you today.";
  if (status === "lifting") return `Rep ${reps.length + 1} is moving.`;
  if (!reps.length) return "The bar is loaded. Lift when you’re ready.";
  return `Rep ${reps.length} logged at ${reps[reps.length - 1].toFixed(2)} m/s. Go again.`;
}

export default function LiveSet() {
  const { reduced, blip } = useApp();
  const [set, dispatch] = useReducer(setReducer, initialSet);
  const rootRef = useRef(null);
  const platformRef = useRef(null);
  const barRef = useRef(null);
  const trailRef = useRef(null);
  const tagRef = useRef(null);
  const motion = useMemo(() => ({ timeline: null }), []);
  const { best, last, drop } = summary(set.reps);
  const limit = best * (1 - dropLimit);

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.from(".set-panel", {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".set-grid", start: "top 80%" },
      });
    }, rootRef);
    return () => context.revert();
  }, [reduced]);

  useEffect(() => {
    return () => {
      if (motion.timeline) motion.timeline.kill();
    };
  }, [motion]);

  const lift = () => {
    if (set.status !== "ready") return;
    const speed = repSpeed(set.load, set.reps.length);
    dispatch({ type: "start" });

    if (reduced) {
      dispatch({ type: "finish", speed });
      return;
    }

    const travel = platformRef.current.clientHeight - barRef.current.clientHeight - 56;
    const up = 0.42 / speed;
    tagRef.current.textContent = `${speed.toFixed(2)} m/s`;

    motion.timeline = gsap
      .timeline({
        onComplete: () => {
          dispatch({ type: "finish", speed });
          blip(440 + speed * 420);
        },
      })
      .to(barRef.current, { y: -travel, duration: up, ease: "power2.out" })
      .fromTo(trailRef.current, { scaleY: 0 }, { scaleY: 1, duration: up, ease: "power2.out" }, 0)
      .fromTo(tagRef.current, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.25 }, up * 0.6)
      .to(barRef.current, { y: 0, duration: 0.42, ease: "power2.in" }, up + 0.18)
      .to(trailRef.current, { opacity: 0, duration: 0.4 }, up + 0.18)
      .to(tagRef.current, { opacity: 0, duration: 0.3 }, up + 0.3)
      .set(trailRef.current, { opacity: 1, scaleY: 0 });
  };

  const chooseLoad = (load) => {
    if (set.status === "lifting") return;
    dispatch({ type: "load", load });
  };

  return (
    <section ref={rootRef} className="set" id="try" aria-labelledby="set-heading">
      <div className="set-head">
        <RevealText text="Try a set" id="set-heading" className="display" />
        <p className="set-lede">Pick a weight and lift. Watch what happens to the speed as the reps add up.</p>
      </div>

      <div className="set-grid">
        <div className="set-panel set-platform" ref={platformRef} aria-hidden="true">
          <span className="platform-scale" />
          <span className="platform-lockout">Lockout</span>
          <span className="platform-load">{set.load} kg</span>
          <span ref={trailRef} className="platform-trail" />
          <div ref={barRef} className="platform-bar">
            <span className="bar-steel" />
            {["left", "right"].map((side) => (
              <span key={side} className={`bar-plates bar-plates-${side}`}>
                {platesFor(set.load).map((size, index) => (
                  <span
                    key={`${set.load}-${index}`}
                    className={`bar-plate bar-plate-${size}`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  />
                ))}
              </span>
            ))}
            <span className="bar-sensor" />
            <span ref={tagRef} className="bar-tag" />
          </div>
          <span className="platform-floor" />
        </div>

        <div className="set-panel set-console">
          <fieldset className="set-loads">
            <legend>Weight on the bar</legend>
            {setLoads.map((load) => (
              <button
                key={load}
                type="button"
                className="load-chip"
                aria-pressed={set.load === load}
                disabled={set.status === "lifting"}
                onClick={() => chooseLoad(load)}
              >
                {load} kg
              </button>
            ))}
          </fieldset>

          <dl className="set-stats">
            <div>
              <dt>Reps</dt>
              <dd>{String(set.reps.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Best</dt>
              <dd>{best ? best.toFixed(2) : "0.00"}</dd>
            </div>
            <div>
              <dt>Last</dt>
              <dd>{last ? last.toFixed(2) : "0.00"}</dd>
            </div>
            <div className={drop >= dropLimit ? "is-alert" : ""}>
              <dt>Drop</dt>
              <dd>{Math.round(drop * 100)}%</dd>
            </div>
          </dl>

          <div className="set-chart" role="img" aria-label={`Bar speed for ${set.reps.length} reps`}>
            {Array.from({ length: maxReps }, (_, index) => {
              const speed = set.reps[index];
              const slow = speed !== undefined && speed < limit;
              return (
                <span key={index} className="chart-slot">
                  {speed !== undefined && (
                    <span className={`chart-bar ${slow ? "is-slow" : ""}`} style={{ height: `${speed * 100}%` }}>
                      <span className="chart-value">{speed.toFixed(2)}</span>
                    </span>
                  )}
                  <span className="chart-index">{index + 1}</span>
                </span>
              );
            })}
            {best > 0 && <span className="chart-limit" style={{ bottom: `${limit * 100}%` }} />}
          </div>

          <p className={`set-status ${set.status === "done" ? "is-done" : ""}`} aria-live="polite">
            {statusLine(set.status, set.reps, drop)}
          </p>

          <Magnetic>
            {set.status === "done" ? (
              <button type="button" className="button button-lime" onClick={() => dispatch({ type: "reset" })}>
                Start a new set
              </button>
            ) : (
              <button
                type="button"
                className="button button-lime"
                disabled={set.status === "lifting"}
                onClick={lift}
              >
                Lift a rep
              </button>
            )}
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
