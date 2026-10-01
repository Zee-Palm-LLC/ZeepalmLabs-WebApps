export const SECTORS = {
  core: { name: "Core Funds", short: "Core", target: { conservative: 0.3, balanced: 0.25, growth: 0.18 } },
  eco: { name: "Technology", short: "Tech", target: { conservative: 0.12, balanced: 0.2, growth: 0.28 } },
  gov: { name: "Financials", short: "Fin", target: { conservative: 0.08, balanced: 0.07, growth: 0.05 } },
  health: { name: "Healthcare", short: "Health", target: { conservative: 0.1, balanced: 0.08, growth: 0.06 } },
  energy: { name: "Energy & Mobility", short: "Energy", target: { conservative: 0.05, balanced: 0.06, growth: 0.07 } },
  culture: { name: "Media & Telecom", short: "Media", target: { conservative: 0.03, balanced: 0.05, growth: 0.06 } },
  justice: { name: "Bonds", short: "Bonds", target: { conservative: 0.25, balanced: 0.15, growth: 0.06 } },
  family: { name: "Crypto", short: "Crypto", target: { conservative: 0.01, balanced: 0.05, growth: 0.1 } },
  sport: { name: "Consumer", short: "Consumer", target: { conservative: 0.03, balanced: 0.03, growth: 0.04 } },
  security: { name: "Cybersecurity", short: "Cyber", target: { conservative: 0.01, balanced: 0.02, growth: 0.04 } },
  env: { name: "Clean Energy", short: "Clean", target: { conservative: 0.01, balanced: 0.02, growth: 0.03 } },
  edu: { name: "Real Estate", short: "REIT", target: { conservative: 0.03, balanced: 0.02, growth: 0.03 } },
};

export const SECTOR_ORDER = Object.keys(SECTORS);

export const HOLDINGS = [
  { id: "L11", ticker: "LLY", name: "Eli Lilly and Company", short: "Eli Lilly & Co.", sector: "health", type: "Common Stock", venue: "NYSE", price: 812.4, shares: 36, cost: 0.52, vol: 0.3, yield: 0.7 },
  { id: "s99", ticker: "UNH", name: "UnitedHealth Group", short: "UnitedHealth", sector: "health", type: "Common Stock", venue: "NYSE", price: 512.2, shares: 15, cost: 1.05, vol: 0.25, yield: 1.6 },
  { id: "s33", ticker: "NVDA", name: "NVIDIA Corporation", short: "NVIDIA Corp.", sector: "eco", type: "Common Stock", venue: "NASDAQ", price: 138.4, shares: 260, cost: 0.3, vol: 0.5, yield: 0.03 },
  { id: "L3", ticker: "MSFT", name: "Microsoft Corporation", short: "Microsoft", sector: "eco", type: "Common Stock", venue: "NASDAQ", price: 468.2, shares: 55, cost: 0.55, vol: 0.25, yield: 0.7 },
  { id: "i_12", ticker: "AAPL", name: "Apple Inc.", short: "Apple Inc.", sector: "eco", type: "Common Stock", venue: "NASDAQ", price: 228.6, shares: 90, cost: 0.6, vol: 0.25, yield: 0.4 },
  { id: "L4", ticker: "VOO", name: "Vanguard S&P 500 ETF", short: "Vanguard S&P 500", sector: "core", type: "ETF", venue: "NYSE Arca", price: 548.3, shares: 70, cost: 0.7, vol: 0.15, yield: 1.3 },
  { id: "L7", ticker: "QQQ", name: "Invesco QQQ Trust", short: "Invesco QQQ", sector: "core", type: "ETF", venue: "NASDAQ", price: 512.7, shares: 35, cost: 0.66, vol: 0.19, yield: 0.6 },
  { id: "L12", ticker: "SCHD", name: "Schwab U.S. Dividend Equity ETF", short: "Schwab Dividend", sector: "core", type: "ETF", venue: "NYSE Arca", price: 28.4, shares: 600, cost: 0.9, vol: 0.13, yield: 3.6 },
  { id: "L16", ticker: "GLD", name: "SPDR Gold Shares", short: "SPDR Gold", sector: "core", type: "ETF", venue: "NYSE Arca", price: 248.9, shares: 40, cost: 0.7, vol: 0.14, yield: 0 },
  { id: "L1", ticker: "JPM", name: "JPMorgan Chase & Co.", short: "JPMorgan Chase", sector: "gov", type: "Common Stock", venue: "NYSE", price: 248.6, shares: 60, cost: 0.62, vol: 0.22, yield: 2.1 },
  { id: "L2", ticker: "V", name: "Visa Inc.", short: "Visa Inc.", sector: "gov", type: "Common Stock", venue: "NYSE", price: 312.4, shares: 40, cost: 0.7, vol: 0.2, yield: 0.7 },
  { id: "L5", ticker: "CRWD", name: "CrowdStrike Holdings", short: "CrowdStrike", sector: "security", type: "Common Stock", venue: "NASDAQ", price: 412.5, shares: 30, cost: 0.58, vol: 0.45, yield: 0 },
  { id: "L6", ticker: "XOM", name: "Exxon Mobil Corporation", short: "Exxon Mobil", sector: "energy", type: "Common Stock", venue: "NYSE", price: 114.3, shares: 80, cost: 0.85, vol: 0.24, yield: 3.4 },
  { id: "L8", ticker: "CVX", name: "Chevron Corporation", short: "Chevron Corp.", sector: "energy", type: "Common Stock", venue: "NYSE", price: 156.2, shares: 45, cost: 0.95, vol: 0.24, yield: 4.2 },
  { id: "L9", ticker: "TSLA", name: "Tesla, Inc.", short: "Tesla Inc.", sector: "energy", type: "Common Stock", venue: "NASDAQ", price: 342.8, shares: 40, cost: 0.9, vol: 0.58, yield: 0 },
  { id: "L10", ticker: "UBER", name: "Uber Technologies", short: "Uber Tech.", sector: "energy", type: "Common Stock", venue: "NYSE", price: 82.6, shares: 120, cost: 0.7, vol: 0.38, yield: 0 },
  { id: "L13", ticker: "NFLX", name: "Netflix, Inc.", short: "Netflix Inc.", sector: "culture", type: "Common Stock", venue: "NASDAQ", price: 924.1, shares: 12, cost: 0.55, vol: 0.35, yield: 0 },
  { id: "L14", ticker: "DIS", name: "The Walt Disney Company", short: "Walt Disney Co.", sector: "culture", type: "Common Stock", venue: "NYSE", price: 112.5, shares: 70, cost: 1.08, vol: 0.27, yield: 0.8 },
  { id: "L15", ticker: "SPOT", name: "Spotify Technology", short: "Spotify Tech.", sector: "culture", type: "Common Stock", venue: "NYSE", price: 584.2, shares: 15, cost: 0.5, vol: 0.42, yield: 0 },
  { id: "L17", ticker: "TLT", name: "iShares 20+ Year Treasury Bond ETF", short: "iShares 20Y Treasury", sector: "justice", type: "Bond ETF", venue: "NASDAQ", price: 88.4, shares: 220, cost: 1.12, vol: 0.16, yield: 4.3 },
  { id: "L18", ticker: "BND", name: "Vanguard Total Bond Market ETF", short: "Vanguard Total Bond", sector: "justice", type: "Bond ETF", venue: "NASDAQ", price: 72.6, shares: 300, cost: 1.0, vol: 0.06, yield: 3.6 },
  { id: "s10", ticker: "COST", name: "Costco Wholesale", short: "Costco", sector: "sport", type: "Common Stock", venue: "NASDAQ", price: 912.3, shares: 10, cost: 0.65, vol: 0.2, yield: 0.5 },
  { id: "s0", ticker: "ENPH", name: "Enphase Energy", short: "Enphase Energy", sector: "env", type: "Common Stock", venue: "NASDAQ", price: 68.4, shares: 90, cost: 1.6, vol: 0.6, yield: 0 },
  { id: "s9", ticker: "FSLR", name: "First Solar", short: "First Solar", sector: "env", type: "Common Stock", venue: "NASDAQ", price: 186.7, shares: 25, cost: 1.1, vol: 0.5, yield: 0 },
  { id: "s92", ticker: "O", name: "Realty Income Corporation", short: "Realty Income", sector: "edu", type: "REIT", venue: "NYSE", price: 57.9, shares: 200, cost: 1.03, vol: 0.18, yield: 5.5 },
  { id: "s119", ticker: "BTC", name: "Bitcoin", short: "Bitcoin", sector: "family", type: "Crypto", venue: "Binance", price: 98400, shares: 0.18, cost: 0.45, vol: 0.55, yield: 0, stream: "btcusdt", decimals: 4 },
  { id: "i_11", ticker: "ETH", name: "Ethereum", short: "Ethereum", sector: "family", type: "Crypto", venue: "Binance", price: 3420, shares: 3.2, cost: 0.6, vol: 0.7, yield: 0, stream: "ethusdt", decimals: 3 },
  { id: "i_8e", ticker: "SOL", name: "Solana", short: "Solana", sector: "family", type: "Crypto", venue: "Binance", price: 182, shares: 40, cost: 0.5, vol: 0.85, yield: 0, stream: "solusdt", decimals: 2 },
];

export const START_CASH = 18400;

export const HOLDING_BY_ID = new Map(HOLDINGS.map((h) => [h.id, h]));
export const HOLDING_BY_TICKER = new Map(HOLDINGS.map((h) => [h.ticker, h]));

export const DEFAULT_HOLDING = "L11";

export const NODE_KINDS = {
  constitution: { label: "Portfolio", tip: "Portfolio" },
  entity: { label: "Sectors", tip: "Sector" },
  legislation: { label: "Holdings", tip: "Holding" },
  service: { label: "Trade lots", tip: "Trade lot" },
  regulation: { label: "AI signals", tip: "AI signal" },
  info: { label: "Alerts", tip: "Alert" },
};
