import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { AppContext } from "./app-context.js";
import { createSound } from "./lib/sound.js";
import useReducedMotion from "./useReducedMotion.js";
import Header from "./components/Header.jsx";
import Loader from "./components/Loader.jsx";
import SparkCursor from "./components/SparkCursor.jsx";
import FireStory from "./sections/FireStory.jsx";
import StaticStory from "./sections/StaticStory.jsx";
import Manifesto from "./sections/Manifesto.jsx";
import Woods from "./sections/Woods.jsx";
import DryAge from "./sections/DryAge.jsx";
import CutBuilder from "./sections/CutBuilder.jsx";
import Menu from "./sections/Menu.jsx";
import Reserve from "./sections/Reserve.jsx";
import Visit from "./sections/Visit.jsx";
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
  const [cutRequest, setCutRequest] = useState(null);
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
    document.fonts.ready.then(() => ScrollTrigger.refresh());
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

  const bell = useCallback(() => soundRef.current?.bell(), []);
  const tick = useCallback(() => soundRef.current?.tick(), []);

  const requestCut = useCallback(
    (request) => {
      setCutRequest(request);
      scrollTo("#book", { duration: 1.6 });
    },
    [scrollTo]
  );

  const finishLoader = useCallback(() => setLoaderDone(true), []);
  const markReady = useCallback(() => setVideoReady(true), []);

  const context = useMemo(
    () => ({ reduced, started, soundOn, toggleSound, bell, tick, scrollTo, requestCut, cutRequest }),
    [reduced, started, soundOn, toggleSound, bell, tick, scrollTo, requestCut, cutRequest]
  );

  return (
    <AppContext.Provider value={context}>
      {!reduced && !loaderDone && <Loader progress={loadProgress} ready={videoReady} onDone={finishLoader} />}
      {!reduced && <SparkCursor />}
      <Header />
      <main className="page" id="top">
        {reduced ? <StaticStory /> : <FireStory onLoadProgress={setLoadProgress} onReady={markReady} />}
        <Manifesto />
        <Woods />
        <DryAge />
        <CutBuilder />
        <Menu />
        <Reserve />
        <Visit />
      </main>
      <Footer />
    </AppContext.Provider>
  );
}
