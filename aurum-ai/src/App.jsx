import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { S, getUi, renderNow, setUi, useFrame, useUi } from "./store.js";
import { computeLayout } from "./layout.js";
import { clamp } from "./lib/math.js";
import {
  aiScan,
  askAi,
  closeAnalysis,
  focusEntity,
  freezeAt,
  openHolding,
  playIntro,
  resetCamera,
  pulseRi,
  replayFan,
  skipIntro,
  toLaw,
  toUniverse,
  toggleAnalysis,
  zoomBy,
} from "./director.js";
import { nodeById } from "./universe/model.js";
import Overlays from "./components/Overlays.jsx";
import { closeOverlay, startFinance, toast } from "./finance/live.js";
import { getSummary } from "./finance/portfolio.js";
import { money, pct } from "./finance/format.js";
import { GoldDefs } from "./components/Icons.jsx";
import TopBar from "./components/TopBar.jsx";
import { LawDock, UniverseDock } from "./components/Dock.jsx";
import GraphCanvas from "./universe/GraphCanvas.jsx";
import YearRail from "./universe/YearRail.jsx";
import Legend from "./universe/Legend.jsx";
import NodeTooltip from "./universe/NodeTooltip.jsx";
import LawView from "./law/LawView.jsx";
import DetailPanel, { KpiPill } from "./law/DetailPanel.jsx";

const params = new URLSearchParams(window.location.search);
const FREEZE = params.has("t") ? Number(params.get("t")) : null;

function useStageFit(stageRef) {
  useLayoutEffect(() => {
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const stage = computeLayout(vw, vh, Math.min(2, window.devicePixelRatio || 1));
      S.stage = stage;
      const root = document.documentElement.style;
      root.setProperty("--cx", `${stage.cx}px`);
      root.setProperty("--cy", `${stage.cy}px`);
      root.setProperty("--dx", `${stage.dx}px`);
      root.setProperty("--dy", `${stage.dy}px`);
      root.setProperty("--sw", `${stage.w}px`);
      root.setProperty("--sh", `${stage.h}px`);
      if (stageRef.current) stageRef.current.style.transform = `translate(${stage.x}px, ${stage.y}px) scale(${stage.scale})`;
      const compact = stage.mode === "compact";
      if (getUi().compact !== compact || getUi().side !== stage.side) setUi({ compact, side: stage.side, sheetOpen: false });
      renderNow();
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [stageRef]);
}

function Backgrounds() {
  const uRef = useRef(null);
  const lRef = useRef(null);
  useFrame((s) => {
    if (uRef.current) uRef.current.style.opacity = String(clamp(s.u.show));
    if (lRef.current) lRef.current.style.opacity = String(clamp(s.l.show));
  });
  return (
    <>
      <div ref={uRef} className="bg bg-universe" aria-hidden="true" />
      <div ref={lRef} className="bg bg-law" aria-hidden="true" />
    </>
  );
}

export default function App() {
  const stageRef = useRef(null);
  const view = useUi((ui) => ui.view);
  const privacy = useUi((ui) => ui.privacy);
  const compact = useUi((ui) => ui.compact);
  const side = useUi((ui) => ui.side);
  useStageFit(stageRef);

  useEffect(() => {
    let cancelled = false;
    startFinance();
    document.fonts.ready.then(() => {
      if (cancelled) return;
      if (FREEZE !== null) freezeAt(FREEZE);
      else playIntro();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (FREEZE !== null) return undefined;
    const skip = (event) => {
      if (!getUi().intro) return;
      if (event.type === "keydown" && !["Escape", " ", "Enter"].includes(event.key)) return;
      skipIntro();
    };
    const onKey = (event) => {
      const typing = /input|textarea|select/i.test(event.target?.tagName || "");
      if ((event.key === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        if (getUi().intro) skipIntro();
        setUi({ overlay: "search", anchor: null });
        return;
      }
      if (getUi().intro) {
        skip(event);
        return;
      }
      if (event.key === "Escape") {
        if (getUi().overlay) closeOverlay();
        else if (getUi().view === "law") toUniverse();
        else if (S.chrome.analysis > 0.5) closeAnalysis();
      }
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleOverlay = useCallback((name, event, extra = {}) => {
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const anchor = rect ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height } : null;
    if (getUi().overlay === name) closeOverlay();
    else setUi({ overlay: name, anchor, ...extra });
  }, []);

  const run = useCallback((action) => {
    if (action.type === "holding") openHolding(action.id);
    else if (action.type === "sector") {
      if (getUi().view === "law") toUniverse();
      const node = nodeById(action.key);
      if (node) setTimeout(() => focusEntity(node), getUi().view === "law" ? 900 : 0);
    } else if (action.type === "trade") setUi({ overlay: "trade", anchor: null, tradeFor: getUi().view === "law" ? getUi().holding : null });
    else if (action.type === "scan") {
      const list = aiScan();
      toast(`AI scan complete · ${list.length} insights`, "good");
    } else if (action.type === "privacy") {
      const privacy = !getUi().privacy;
      setUi({ privacy });
      toast(privacy ? "Balances hidden" : "Balances visible");
    } else if (action.type === "network") toUniverse();
  }, []);

  const onActivate = useCallback((node) => {
    if (node.kind === "legislation" || node.kind === "constitution") toLaw(node);
    else if (node.kind === "entity") {
      focusEntity(node);
      const s = getSummary().sectorByKey.get(node.sector);
      if (s) toast(`${s.name}: ${money(s.value, { compact: true })} · ${pct(s.weight, 1, false)} of portfolio (target ${pct(s.target, 0, false)})`);
    }
  }, []);

  const onTool = useCallback(
    (tool, event) => {
      if (tool === "replay") {
        playIntro();
        return;
      }
      if (getUi().intro) skipIntro();
      if (tool === "network") {
        if (getUi().view === "law") toUniverse();
        else resetCamera();
      } else if (tool === "tree") toLaw();
      else if (tool === "zoomIn") getUi().view === "universe" ? zoomBy(1.3) : toUniverse();
      else if (tool === "zoomOut") getUi().view === "universe" ? zoomBy(1 / 1.3) : toUniverse();
      else if (tool === "filter" || tool === "rank" || tool === "account" || tool === "search") toggleOverlay(tool, event);
      else if (tool === "menu") toggleOverlay("drawer", event);
      else if (tool === "trade") toggleOverlay("trade", event, { tradeFor: getUi().view === "law" ? getUi().holding : null });
      else if (tool === "scan") run({ type: "scan" });
      else if (tool === "privacy") run({ type: "privacy" });
    },
    [run, toggleOverlay]
  );

  const onAsk = useCallback((query) => {
    if (getUi().intro) skipIntro();
    const result = askAi(query);
    toast(`AI answered: ${result.title}`);
  }, []);

  return (
    <div className={`app view-${view}${compact ? " is-compact" : ""}${side ? " is-side" : ""}${privacy ? " is-private" : ""}`}>
      <GoldDefs />
      <div ref={stageRef} className="stage">
        <StageMirror centered />
        <Backgrounds />
      </div>
      <GraphCanvas onActivate={onActivate} />
      <div className="stage stage-ui">
        <StageMirror />
        <YearRail />
        <Legend />
        <NodeTooltip />
        <LawView onSelect={() => replayFan()} onOpen={(id) => openHolding(id)} />
        <KpiPill />
        <DetailPanel onTrade={(id) => setUi({ overlay: "trade", anchor: null, tradeFor: id })} onResetAi={() => setUi({ focusItem: null, lawAnswer: null })} />
        <UniverseDock
          onAsk={onAsk}
          onRi={() => !getUi().intro && toggleAnalysis()}
          onChip={toggleOverlay}
          onCloseAnalysis={() => closeAnalysis()}
          onOpenHolding={(id) => openHolding(id)}
        />
        <LawDock
          onAsk={onAsk}
          onChip={toggleOverlay}
          onRi={() => {
            setUi({ focusItem: null, lawAnswer: null });
            pulseRi();
            toast("AI refreshed its advice for this position");
          }}
        />
        <TopBar onTool={onTool} />
      </div>
      <Overlays onRun={run} onReplay={() => playIntro()} />
    </div>
  );
}

function StageMirror({ centered = false }) {
  const ref = useRef(null);
  useFrame((s) => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const t = centered ? `translate(${s.stage.x}px, ${s.stage.y}px) scale(${s.stage.scale})` : `scale(${s.stage.scale})`;
    if (parent.style.transform !== t) parent.style.transform = t;
  });
  return <span ref={ref} hidden />;
}
