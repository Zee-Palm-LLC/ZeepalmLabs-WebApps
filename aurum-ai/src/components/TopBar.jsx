import { useRef } from "react";
import { useFrame, useUi } from "../store.js";
import { backOut, clamp } from "../lib/math.js";
import {
  ChevronDown,
  FilterIcon,
  Hamburger,
  LogoMark,
  MinusIcon,
  NetworkIcon,
  PlusIcon,
  SearchIcon,
  SortIcon,
  SparkFrameIcon,
  ThemeIcon,
  TreeIcon,
} from "./Icons.jsx";

function pop(el, v, y = -10) {
  if (!el) return;
  const t = clamp(v);
  el.style.opacity = String(t);
  el.style.transform = `translateY(${(1 - backOut(t)) * y}px) scale(${0.92 + 0.08 * backOut(t)})`;
  el.style.visibility = t <= 0.001 ? "hidden" : "visible";
}

export default function TopBar({ onTool }) {
  const view = useUi((ui) => ui.view);
  const filter = useUi((ui) => ui.filter);
  const rank = useUi((ui) => ui.rank);
  const privacy = useUi((ui) => ui.privacy);
  const overlay = useUi((ui) => ui.overlay);
  const filterCount = (filter.move !== "all" ? 1 : 0) + filter.sectors.length + (filter.minWeight > 0 ? 1 : 0);
  const burgerRef = useRef(null);
  const logoRef = useRef(null);
  const groupRefs = useRef([]);
  const rightRef = useRef(null);

  useFrame((s) => {
    pop(burgerRef.current, s.chrome.hamburger, 0);
    pop(logoRef.current, s.chrome.logo, 0);
    s.chrome.toolbar.forEach((v, i) => pop(groupRefs.current[i], v));
    pop(rightRef.current, s.chrome.right);
  });

  const group = (i) => (node) => {
    groupRefs.current[i] = node;
  };

  return (
    <header className="topbar">
      <button ref={burgerRef} type="button" className="tb-burger" aria-label="Open navigation" aria-expanded={overlay === "drawer"} onClick={(e) => onTool("menu", e)}>
        <Hamburger />
      </button>
      <a
        ref={logoRef}
        className="tb-logo"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onTool("network", e);
        }}
      >
        <LogoMark size={44} />
        <span className="tb-logo-text">
          <span className="tb-logo-name">Aurum AI</span>
          <span className="tb-logo-sub">Wealth Platform</span>
        </span>
      </a>

      <nav className="tb-tools" aria-label="Graph tools">
        <div ref={group(0)} className="tb-group tb-g1">
          <button
            type="button"
            className="tb-btn is-active"
            aria-label="Network view"
            aria-pressed={view === "universe"}
            onClick={(e) => onTool("network", e)}
          >
            <NetworkIcon active />
          </button>
          <button
            type="button"
            className="tb-btn"
            aria-label="Open position view"
            aria-pressed={view === "law"}
            onClick={(e) => onTool("tree", e)}
          >
            <TreeIcon />
          </button>
        </div>
        <div ref={group(1)} className="tb-group tb-g2">
          <button type="button" className="tb-btn" aria-label="Zoom in" onClick={(e) => onTool("zoomIn", e)}>
            <PlusIcon size={26} />
          </button>
          <span className="tb-divider" aria-hidden="true" />
          <button type="button" className="tb-btn" aria-label="Zoom out" onClick={(e) => onTool("zoomOut", e)}>
            <MinusIcon size={26} />
          </button>
        </div>
        <div ref={group(2)} className="tb-group tb-single">
          <button
            type="button"
            className="tb-btn"
            aria-label={`Filter holdings, ${filterCount} active`}
            aria-expanded={overlay === "filter"}
            onClick={(e) => onTool("filter", e)}
          >
            <FilterIcon />
            {filterCount > 0 && <span className="tb-badge">{filterCount}</span>}
          </button>
        </div>
        <div ref={group(3)} className="tb-group tb-single">
          <button type="button" className="tb-btn" aria-label="Rank holdings" aria-expanded={overlay === "rank"} onClick={(e) => onTool("rank", e)}>
            <SortIcon />
            {rank !== "none" && <span className="tb-badge">1</span>}
          </button>
        </div>
        <div ref={group(4)} className="tb-group tb-single">
          <button type="button" className="tb-btn" aria-label="Run AI portfolio scan" onClick={(e) => onTool("scan", e)}>
            <SparkFrameIcon />
          </button>
        </div>
      </nav>

      <div ref={rightRef} className="tb-right">
        <button type="button" className="tb-new" onClick={(e) => onTool("trade", e)}>
          <PlusIcon size={20} color="#f2f2f0" width={1.9} />
          New Trade
        </button>
        <button
          type="button"
          className={`tb-icon${privacy ? " is-on" : ""}`}
          aria-label={privacy ? "Show balances" : "Hide balances"}
          aria-pressed={privacy}
          title={privacy ? "Show balances" : "Hide balances"}
          onClick={(e) => onTool("privacy", e)}
        >
          <ThemeIcon size={25} />
        </button>
        <button type="button" className="tb-icon tb-search" aria-label="Search holdings (Ctrl+K)" title="Search (Ctrl+K)" onClick={(e) => onTool("search", e)}>
          <SearchIcon size={24} />
        </button>
        <button type="button" className="tb-avatar" aria-label="Account menu" aria-expanded={overlay === "account"} onClick={(e) => onTool("account", e)}>
          <img src="./assets/avatar.png" alt="" width="25" height="25" />
          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  );
}
