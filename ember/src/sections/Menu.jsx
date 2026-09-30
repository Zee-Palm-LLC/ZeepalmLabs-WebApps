import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "../app-context.js";
import { menu } from "../data.js";
import Reveal from "../components/Reveal.jsx";

export default function Menu() {
  const { reduced } = useApp();
  const [veg, setVeg] = useState(false);
  const [preview, setPreview] = useState(null);
  const rootRef = useRef(null);
  const previewRef = useRef(null);
  const follow = useRef(null);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return undefined;
    const node = previewRef.current;
    gsap.set(node, { xPercent: -50, yPercent: -115 });
    follow.current = {
      x: gsap.quickTo(node, "x", { duration: 0.5, ease: "power3.out" }),
      y: gsap.quickTo(node, "y", { duration: 0.5, ease: "power3.out" }),
      r: gsap.quickTo(node, "rotation", { duration: 0.6, ease: "power3.out" }),
    };
    let lastX = 0;
    const onMove = (event) => {
      follow.current.x(event.clientX);
      follow.current.y(event.clientY);
      follow.current.r(Math.max(-12, Math.min(12, (event.clientX - lastX) * 0.6)));
      lastX = event.clientX;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.utils.toArray(".menu-course").forEach((course) => {
        gsap.fromTo(
          course.querySelectorAll(".menu-item, .menu-course-title"),
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: course, start: "top 82%" },
          }
        );
      });
    }, rootRef);
    return () => context.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} className="menu" id="menu" aria-labelledby="menu-heading">
      <div className="menu-sheet">
        <header className="menu-head">
          <p className="menu-date">Autumn menu, from 30 September</p>
          <Reveal text="The menu" id="menu-heading" className="menu-title" />
          <div className="menu-filter">
            <button type="button" className="chip chip-ink" aria-pressed={veg} onClick={() => setVeg((value) => !value)}>
              Show vegetarian dishes
            </button>
          </div>
        </header>

        <div className={`menu-columns ${veg ? "is-veg" : ""}`}>
          {menu.map((course) => (
            <section key={course.key} className={`menu-course menu-course-${course.key}`} aria-labelledby={`course-${course.key}`}>
              <h3 id={`course-${course.key}`} className="menu-course-title">
                {course.name}
              </h3>
              <ul>
                {course.items.map((item) => (
                  <li
                    key={item.name}
                    className={`menu-item ${item.tag === "v" ? "is-v" : ""} ${item.preview ? "has-preview" : ""}`}
                    onPointerEnter={() => item.preview && setPreview(item.preview)}
                    onPointerLeave={() => item.preview && setPreview(null)}
                  >
                    <p className="menu-line">
                      <span className="menu-name">
                        {item.name}
                        {item.tag && <span className={`menu-tag menu-tag-${item.tag === "v" ? "v" : "house"}`}>{item.tag === "v" ? "V" : item.tag}</span>}
                      </span>
                      <span className="menu-leader" aria-hidden="true" />
                      <span className="menu-price">{item.price}</span>
                    </p>
                    <p className="menu-note">{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="menu-foot">
          <p>Prices in pounds. A discretionary 12.5% service charge goes to the whole team.</p>
          <p>Tell us about allergies when you book. Everything is cooked over the same fire.</p>
        </footer>
      </div>

      <div ref={previewRef} className={`menu-preview ${preview ? "is-shown" : ""}`} aria-hidden="true">
        {preview && <img src={`./${preview}`} alt="" />}
      </div>
    </section>
  );
}
