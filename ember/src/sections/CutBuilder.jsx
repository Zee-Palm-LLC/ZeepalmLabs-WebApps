import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { cuts, donenessLevels } from "../data.js";
import SteakSection from "../components/SteakSection.jsx";
import Magnetic from "../components/Magnetic.jsx";
import Reveal from "../components/Reveal.jsx";

function money(value) {
  return `£${value.toFixed(2)}`;
}

export default function CutBuilder() {
  const { reduced, requestCut, tick } = useApp();
  const [cutIndex, setCutIndex] = useState(0);
  const [levelIndex, setLevelIndex] = useState(2);
  const [weightIndex, setWeightIndex] = useState(1);
  const sliderId = useId();
  const visualRef = useRef(null);
  const cut = cuts[cutIndex];
  const level = donenessLevels[levelIndex];
  const weight = cut.weights[Math.min(weightIndex, cut.weights.length - 1)];
  const price = Math.round((weight / 100) * cut.per100 * 2) / 2;
  const grillMinutes = Math.round((weight / 450) * 8 * (0.7 + levelIndex * 0.16));

  useEffect(() => {
    if (reduced) return;
    gsap.fromTo(visualRef.current, { rotate: -6, scale: 0.92, opacity: 0.4 }, { rotate: 0, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" });
  }, [cutIndex, reduced]);

  const chooseCut = (index) => {
    setCutIndex(index);
    setWeightIndex(Math.min(1, cuts[index].weights.length - 1));
    tick();
  };

  return (
    <section className="cuts" id="cuts" aria-labelledby="cuts-heading">
      <div className="cuts-head">
        <Reveal text="Build your steak" id="cuts-heading" className="display" />
        <p className="lede">Pick a cut, a size and how you like it. We’ll show you what lands on your plate.</p>
      </div>

      <div className="cuts-grid">
        <div className="cuts-visual" data-hot>
          <div className="cuts-board" aria-hidden="true" />
          <div ref={visualRef} className="cuts-steak">
            <SteakSection cut={cut.key} level={level} />
          </div>
          <dl className="cuts-readout">
            <div>
              <dt>Core temperature</dt>
              <dd>{level.core}°C</dd>
            </div>
            <div>
              <dt>On the grill</dt>
              <dd>{grillMinutes} min</dd>
            </div>
            <div>
              <dt>Rest</dt>
              <dd>{level.rest} min</dd>
            </div>
          </dl>
        </div>

        <div className="cuts-controls">
          <fieldset className="choice-group">
            <legend>Cut</legend>
            <div className="cut-options">
              {cuts.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  className="cut-option"
                  aria-pressed={index === cutIndex}
                  onClick={() => chooseCut(index)}
                >
                  <span className="cut-option-name">{item.name}</span>
                  <span className="cut-option-meta">{item.aged} days aged</span>
                </button>
              ))}
            </div>
          </fieldset>

          <p className="cuts-body">{cut.body}</p>

          <fieldset className="choice-group">
            <legend>Weight</legend>
            <div className="weight-options">
              {cut.weights.map((value, index) => (
                <button
                  key={value}
                  type="button"
                  className="chip"
                  aria-pressed={value === weight}
                  onClick={() => setWeightIndex(index)}
                >
                  {value >= 1000 ? `${(value / 1000).toFixed(1)} kg` : `${value} g`}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="choice-group">
            <label htmlFor={sliderId} className="choice-label">
              How you like it <span className="choice-value">{level.name}</span>
            </label>
            <input
              id={sliderId}
              type="range"
              min="0"
              max={donenessLevels.length - 1}
              step="1"
              value={levelIndex}
              onChange={(event) => setLevelIndex(Number(event.target.value))}
              className="doneness-slider"
              style={{ "--fill": `${(levelIndex / (donenessLevels.length - 1)) * 100}%` }}
              aria-valuetext={level.name}
            />
            <div className="doneness-scale" aria-hidden="true">
              {donenessLevels.map((item, index) => (
                <span key={item.name} className={index === levelIndex ? "is-active" : ""}>
                  {item.name}
                </span>
              ))}
            </div>
            {levelIndex === donenessLevels.length - 1 && (
              <p className="cuts-note">We’ll cook it however you like. Well done takes about twelve minutes longer.</p>
            )}
          </div>

          <div className="cuts-total">
            <p className="cuts-price">
              <span className="cuts-price-value">{money(price)}</span>
              <span className="cuts-price-note">
                {money(cut.per100)} per 100 g
              </span>
            </p>
            <Magnetic>
              <button
                type="button"
                className="button button-ember"
                onClick={() =>
                  requestCut({ cut: cut.name, weight, level: level.name, price: money(price) })
                }
              >
                Book a table with this steak
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
