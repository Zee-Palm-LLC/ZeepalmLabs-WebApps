import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { priceLines } from "../story.js";
import Magnetic from "../components/Magnetic.jsx";

const price = "149";
const digits = Array.from({ length: 10 }, (_, index) => index);

export default function Pricing() {
  const rootRef = useRef(null);
  const { reduced } = useApp();

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: ".pricing-inner", start: "top 72%" } });
      gsap.utils.toArray(".odometer-strip").forEach((strip, index) => {
        timeline.fromTo(
          strip,
          { yPercent: 0, y: 0 },
          { yPercent: -Number(price[index]) * 10, y: 0, duration: 1.8 + index * 0.25, ease: "power4.inOut" },
          index * 0.1
        );
      });
      timeline
        .from(".price-currency, .price-unit", { opacity: 0, y: 24, duration: 0.8, ease: "power3.out" }, 0.9)
        .from(".price-line", { opacity: 0, x: -28, duration: 0.8, ease: "power3.out", stagger: 0.12 }, 0.5)
        .from(".price-line-rule", { scaleX: 0, duration: 1, ease: "power3.inOut", stagger: 0.12 }, 0.5)
        .from(".pricing-after, .pricing-cta", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out", stagger: 0.1 }, 1.1);

      gsap.fromTo(
        ".pricing-photo img",
        { yPercent: -14 },
        {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, rootRef);
    return () => context.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} className="pricing" id="pricing" aria-labelledby="pricing-heading">
      <div className="pricing-photo" aria-hidden="true">
        <img src="./still-lockout.jpg" alt="" />
      </div>
      <div className="pricing-inner">
        <h2 id="pricing-heading" className="visually-hidden">
          Pricing
        </h2>
        <p className="price">
          <span className="visually-hidden">$149, paid once</span>
          <span className="price-currency" aria-hidden="true">
            $
          </span>
          <span className="odometer" aria-hidden="true">
            {price.split("").map((digit, index) => (
              <span key={index} className="odometer-window">
                <span className="odometer-strip" style={{ transform: `translateY(${-Number(digit) * 10}%)` }}>
                  {digits.map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </span>
              </span>
            ))}
          </span>
          <span className="price-unit" aria-hidden="true">
            once
          </span>
        </p>

        <div className="pricing-detail">
          <ul className="price-lines">
            {priceLines.map((line) => (
              <li key={line} className="price-line">
                <span>{line}</span>
                <span className="price-included">Included</span>
                <span className="price-line-rule" aria-hidden="true" />
              </li>
            ))}
          </ul>
          <p className="pricing-after">
            After the first year the app is $6 a month, or keep your history for free without new sessions.
          </p>
          <div className="pricing-cta">
            <Magnetic>
              <a href="#waitlist" className="button button-lime">
                Get the launch price
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
