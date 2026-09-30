import { forwardRef, useImperativeHandle, useRef } from "react";
import { easeOut, lerp, range } from "../lib/math.js";

const repSlots = 8;
const repsDone = 5;

const RepCount = forwardRef(function RepCount(_, ref) {
  const countRef = useRef(null);
  const dotRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    update(t) {
      const reps = Math.floor(range(t, 0.12, 0.8) * repsDone + 0.001);
      countRef.current.textContent = String(reps).padStart(2, "0");
      dotRefs.current.forEach((dot, index) => dot.classList.toggle("is-on", index < reps));
    },
  }));

  return (
    <div className="widget widget-reps">
      <p className="widget-figure">
        <span ref={countRef} className="widget-number">
          00
        </span>
        <span className="widget-unit">reps logged, set 3</span>
      </p>
      <div className="rep-dots">
        {Array.from({ length: repSlots }, (_, index) => (
          <span
            key={index}
            ref={(node) => {
              dotRefs.current[index] = node;
            }}
            className="rep-dot"
          />
        ))}
      </div>
    </div>
  );
});

const SpeedRead = forwardRef(function SpeedRead(_, ref) {
  const speedRef = useRef(null);
  const timeRef = useRef(null);
  const needleRef = useRef(null);

  useImperativeHandle(ref, () => ({
    update(t) {
      const amount = easeOut(range(t, 0.1, 0.72));
      speedRef.current.textContent = (1.84 * amount).toFixed(2);
      timeRef.current.textContent = (0.642 * range(t, 0.1, 0.72)).toFixed(3);
      needleRef.current.style.left = `${amount * 92}%`;
    },
  }));

  return (
    <div className="widget widget-speed">
      <p className="widget-figure">
        <span ref={speedRef} className="widget-number">
          0.00
        </span>
        <span className="widget-unit">m/s peak</span>
        <span className="widget-aside">
          <span ref={timeRef}>0.000</span> s
        </span>
      </p>
      <div className="speed-ruler">
        <span ref={needleRef} className="speed-needle" />
      </div>
    </div>
  );
});

const fatigueReps = [0.92, 0.9, 0.88, 0.85, 0.79, 0.7, 0.61];
const fatigueLimit = 0.92 * 0.8;

const FatigueBars = forwardRef(function FatigueBars(_, ref) {
  const barRefs = useRef([]);
  const flagRef = useRef(null);

  useImperativeHandle(ref, () => ({
    update(t) {
      barRefs.current.forEach((bar, index) => {
        const grow = easeOut(range(t, 0.1 + index * 0.08, 0.24 + index * 0.08));
        bar.style.transform = `scaleY(${grow})`;
      });
      flagRef.current.style.opacity = String(range(t, 0.7, 0.82));
    },
  }));

  return (
    <div className="widget widget-fatigue">
      <div className="fatigue-chart">
        {fatigueReps.map((speed, index) => (
          <span
            key={index}
            ref={(node) => {
              barRefs.current[index] = node;
            }}
            className={`fatigue-bar ${speed < fatigueLimit ? "is-slow" : ""}`}
            style={{ height: `${speed * 100}%` }}
          />
        ))}
        <span className="fatigue-limit" style={{ bottom: `${fatigueLimit * 100}%` }} />
      </div>
      <p ref={flagRef} className="fatigue-flag">
        Rack it at rep 5
      </p>
    </div>
  );
});

const BarPath = forwardRef(function BarPath(_, ref) {
  const pathRef = useRef(null);
  const markRef = useRef(null);
  const noteRef = useRef(null);

  useImperativeHandle(ref, () => ({
    update(t) {
      pathRef.current.style.strokeDashoffset = String(1 - range(t, 0.1, 0.75));
      const shown = String(range(t, 0.45, 0.58));
      markRef.current.style.opacity = shown;
      noteRef.current.style.opacity = shown;
    },
  }));

  return (
    <div className="widget widget-path">
      <svg viewBox="0 0 120 84" className="path-plot" aria-hidden="true">
        <line x1="60" y1="4" x2="60" y2="80" className="path-ideal" />
        <path
          ref={pathRef}
          d="M60 80 C 54 66, 72 50, 66 40 S 57 18, 60 4"
          pathLength="1"
          className="path-trace"
        />
        <circle ref={markRef} cx="68" cy="45" r="4" className="path-mark" />
      </svg>
      <p ref={noteRef} className="path-note">
        <span className="widget-number">3.1</span>
        <span className="widget-unit">cm forward at the knee, rep 4</span>
      </p>
    </div>
  );
});

const RecordStamp = forwardRef(function RecordStamp(_, ref) {
  const weightRef = useRef(null);
  const stampRef = useRef(null);

  useImperativeHandle(ref, () => ({
    update(t) {
      const amount = easeOut(range(t, 0.1, 0.55));
      weightRef.current.textContent = lerp(137.5, 142.5, amount).toFixed(1);
      const stamp = range(t, 0.55, 0.66);
      stampRef.current.style.opacity = String(stamp);
      stampRef.current.style.transform = `rotate(-6deg) scale(${lerp(1.7, 1, easeOut(stamp))})`;
    },
  }));

  return (
    <div className="widget widget-record">
      <p className="widget-figure">
        <span ref={weightRef} className="widget-number">
          137.5
        </span>
        <span className="widget-unit">kg clean and press</span>
      </p>
      <span ref={stampRef} className="record-stamp">
        New record
      </span>
    </div>
  );
});

const kinds = {
  count: RepCount,
  speed: SpeedRead,
  fatigue: FatigueBars,
  form: BarPath,
  record: RecordStamp,
};

const StoryWidget = forwardRef(function StoryWidget({ kind }, ref) {
  const Widget = kinds[kind];
  return <Widget ref={ref} />;
});

export default StoryWidget;
