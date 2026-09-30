import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { AppContext } from "./app-context.js";
import { createSound } from "./lib/sound.js";
import useReducedMotion from "./useReducedMotion.js";
import Header from "./components/Header.jsx";
import Loader from "./components/Loader.jsx";
import Cursor from "./components/Cursor.jsx";
import ScrubStory from "./sections/ScrubStory.jsx";
import StaticStory from "./sections/StaticStory.jsx";
import Manifesto from "./sections/Manifesto.jsx";
import HowItWorks from "./sections/HowItWorks.jsx";
import LiveSet from "./sections/LiveSet.jsx";
import Features from "./sections/Features.jsx";
import Marquee from "./sections/Marquee.jsx";
import Pricing from "./sections/Pricing.jsx";
import Waitlist from "./sections/Waitlist.jsx";
import Footer from "./sections/Footer.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const reduced = useReducedMotion();
  const lenisRef = useRef(null);
  const soundRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const started = loaderDone || reduced;

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: true });
    const raf = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = lenis;
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", !started);
    const lenis = lenisRef.current;
    if (lenis) {
      if (started) lenis.start();
      else lenis.stop();
    }
    if (started) ScrollTrigger.refresh();
  }, [started, reduced]);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
  }, []);

  const scrollTo = useCallback((target, options) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, options);
      return;
    }
    if (typeof target === "number") window.scrollTo(0, target);
    else document.querySelector(target)?.scrollIntoView();
  }, []);

  const toggleSound = useCallback(() => {
    if (!soundRef.current) soundRef.current = createSound();
    setSoundOn((current) => {
      soundRef.current.setEnabled(!current);
      return !current;
    });
  }, []);

  const blip = useCallback((frequency) => {
    if (soundRef.current) soundRef.current.blip(frequency);
  }, []);

  const finishLoader = useCallback(() => setLoaderDone(true), []);
  const markReady = useCallback(() => setVideoReady(true), []);

  const context = useMemo(
    () => ({ reduced, started, soundOn, toggleSound, blip, scrollTo }),
    [reduced, started, soundOn, toggleSound, blip, scrollTo]
  );

  return (
    <AppContext.Provider value={context}>
      {!reduced && !loaderDone && <Loader progress={loadProgress} ready={videoReady} onDone={finishLoader} />}
      {!reduced && <Cursor />}
      <Header />
      <main className="page" id="top">
        {reduced ? <StaticStory /> : <ScrubStory onLoadProgress={setLoadProgress} onReady={markReady} />}
        <Manifesto />
        <HowItWorks />
        <LiveSet />
        <Features />
        <Marquee />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </AppContext.Provider>
  );
}
