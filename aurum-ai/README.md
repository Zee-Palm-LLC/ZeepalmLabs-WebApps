# Aurum AI

Live: [zeepalm-aurum.vercel.app](https://zeepalm-aurum.vercel.app)

An AI wealth dashboard. Your portfolio sits at the centre of a live network, with sectors and holdings around it. Prices tick in real time, you can place paper trades, and an in-browser AI analyst answers questions about your money.

## Design credit

The visual language and motion are adapted from a Dribbble concept: [AI Dashboard Design for Control AI Policy Platform](https://dribbble.com/shots/27388009-AI-Dashboard-Design-for-Control-AI-Policy-Platform) by George Railean at Fuselab Creative. We reworked it into a finance product with our own branding, data and features; the code is ours. Credit the original shot when you post this.

## What it does

- **Live portfolio network:**
  - Portfolio at the centre; 12 sectors and 28 holdings around it, covering stocks, ETFs, bonds, a REIT and crypto.
  - Each holding shows its ticker and today's move, and pulses green or red when its price ticks.
  - Sector badges show their share of the portfolio.
  - Hover or tap a node for value, weight and return. Click a holding to open it; click a sector to zoom in on it.
  - Drag to pan; scroll, pinch or use + and − to zoom. The network button resets the view.
- **Position view:**
  - Shows the selected holding: name, ticker and five cards.
  - The cards are trade lots, peer holdings, market headlines, AI signals and analyst ratings. Each card fills the fan with its own list.
  - Clicking a peer opens that holding. Clicking any other item explains it in the AI block.
  - The detail panel shows live price and day move, AI sentiment, the latest price ticks, market value, shares, average cost and total return.
  - It also gives an AI recommendation (trim, hold, accumulate, lock in gains) and a **Trade now** button.
- **Paper trading:** **New Trade** opens a ticket.
  - Pick any asset, buy or sell, and use 25%, 50% or max.
  - It shows the estimated cost and cash afterwards, plus AI advice, and stops trades you can't afford or cover.
  - Positions, average cost, cash and trade history update immediately and are saved in the browser.
- **AI analyst:**
  - Ask a question in either dock: a ticker, a sector, risk, best or worst performers, today's movers, dividends, rebalancing or where to put cash. Answers are built from your live portfolio data.
  - **AI Analysis** and the AI scan in the toolbar list insights on concentration, oversized positions, rebalancing, movers, idle cash and winners. Each insight links to the holding it refers to.
  - **My agent** switches the advisor between Balanced Analyst, Income Strategist, Growth Hunter and Risk Guardian, which changes the advice.
  - The **+3** chip turns data sources on or off.
- **Toolbar:**
  - **Filter:** gainers or losers, sector toggles, and big positions only.
  - **Rank:** sizes nodes by weight, today's move, return or volatility.
  - **AI scan.**
- **Top right:**
  - Hide balances (privacy mode).
  - Search: Ctrl+K or /.
  - Account menu: risk profile (Careful, Balanced or Growth, which changes the sector targets), CSV export of trades, replay intro, and reset the demo portfolio.
- **Menu:** a drawer with net worth, quick navigation, every holding with its value and day move, and recent trades.
- **Timeline:** pick a year to show only the holdings you owned by then.
- **Intro:** a 20-second cinematic. The portfolio bursts into view, then the AI analyses Eli Lilly and the view dives into its position. Click, scroll or press a key to skip.

## Market data

- **Crypto:** BTC, ETH and SOL stream live from Binance's public market-data WebSocket (`data-stream.binance.vision`).
- **Stocks and ETFs:** come from a simulated market, a random walk scaled to each asset's volatility. They are demo prices, not real quotes.
- **Fallback:** if the Binance stream can't connect, crypto uses the simulator too.
- **Trades:** paper trades with demo money; nothing is sent to a broker.
- **AI analyst:** runs entirely in the browser on the portfolio data, with no external model.
- **Not advice:** none of this is financial advice.

## How it is built

- **Stack:** React 18, Vite and GSAP.
- **Finance code:**
  - `src/finance/holdings.js`: assets and sector targets.
  - `src/finance/market.js`: live and simulated prices.
  - `src/finance/portfolio.js`: positions, trades, persistence and portfolio metrics.
  - `src/finance/ai.js`: insights, answers, advice and feeds.
  - `src/finance/live.js`: keeps the graph in sync with the data.
- **Overlays:** `src/components/Overlays.jsx` holds the trade ticket, search, drawer, menus and toasts.
- **Layout:**
  - Built on a 1600 × 1200 design grid. `src/layout.js` picks a desktop or compact layout from the window size.
  - On phones and portrait tablets, the toolbar moves to a second row, the legend becomes a scrolling strip, the dock spans the bottom and the position details become a bottom sheet.
- **Rendering:**
  - A single GSAP timeline drives the intro.
  - Animated values live in one shared store and are drawn each frame.
  - The network is a canvas with pre-rendered sprites.
  - The position view uses DOM and SVG.
- **Frame freeze:** `?t=12.5` freezes the intro at that second.

## Run it

```bash
npm install
npm run dev
```

```bash
npm run build
```

The build goes to `dist/` and runs on any static host (for Vercel, use the Vite preset).

## Deploy

The site is hosted on Vercel as the project `aurum-ai`, with root directory `aurum-ai`, the Vite preset and output `dist`. The project is not linked to git, so a push does not deploy on its own. After pushing, start a new production deployment from the `main` branch of this repo in Vercel.
