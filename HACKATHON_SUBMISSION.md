# StockMatch 💜📈
### "Tinder for Stocks" — Swipe your way to a smarter portfolio

---

## Functional Description

StockMatch is a self-directed stock discovery and portfolio-building tool built specifically for **beginner investors** who are priced out of, or intimidated by, traditional investing routes.

Most new investors are funnelled toward mutual funds or actively-managed portfolios, where a fund manager charges an ongoing **management/expense fee** (often 1–2% of assets per year) simply to pick stocks on their behalf — a cost that compounds silently over decades and eats into returns regardless of performance. At the same time, the "just buy stocks yourself" alternative feels inaccessible to a beginner: it demands reading 10-Q filings, understanding ratios, and picking individually from thousands of tickers with no guardrails.

StockMatch closes that gap by:

- **Removing the fund manager entirely.** There is no advisory layer and no ongoing management fee — the user swipes, decides, and holds their own picks directly. The only cost incurred is the **minimal, one-time brokerage fee** paid per trade when a stock is bought or sold, instead of a recurring percentage-of-assets fee charged whether the fund does well or not.
- **Putting the decision — and the savings — in the beginner's hands.** By translating dense financial statements into plain-English "vibe checks" and color-coded vitals (revenue growth, margin, analyst sentiment), a first-time investor can make an *informed, self-directed* buy/pass decision in seconds, without needing to hire someone else to do it for them.
- **Deliberately capping the universe to the Nasdaq-100.** To keep risk bounded for a beginner audience, StockMatch does not expose the full market. It only ever surfaces the ~100 constituents of the Nasdaq-100 — large-cap, highly liquid, heavily-analyst-covered companies. This intentionally excludes penny stocks, micro-caps, and speculative/illiquid names, so a new investor's worst-case downside is bounded by "blue-chip volatility," not "small-cap wipeout."
- **Letting users simulate before they risk capital.** The funding/portfolio simulator lets a beginner practice allocating a budget across their matched stocks, see simulated live price movement, and understand position sizing and P&L — before ever touching a real brokerage account.
- **Pacing decisions to a monthly/quarterly cadence, not a daily one.** Rather than encouraging the anxious, screen-checking, day-trading habits that hurt novice investors, the swipe deck is organized around each company's **earnings announcement month**. New or refreshed "profiles" surface once a company reports its quarterly results, so a beginner only needs to review and decide on their matches when there's actually new, meaningful information — once a month or once a quarter — instead of feeling pressure to watch and react to daily price noise.

In short: StockMatch is designed as a **low-cost, low-complexity, risk-bounded on-ramp into self-directed investing** — replacing a fund manager's ongoing fee with a one-time brokerage cost, replacing overwhelming choice with a curated, beginner-safe, blue-chip-only universe, and replacing daily trading anxiety with a calm, monthly/quarterly earnings-driven decision rhythm.

---

## 1. Problem Statement

Retail investors, especially first-timers, are put off by investing because research means wading through dense 10-Q filings, jargon-filled analyst notes, and spreadsheets full of ratios. Their two realistic options today are (a) pay a fund manager an ongoing management fee to invest on their behalf, or (b) attempt to self-direct across a bewildering, largely unbounded universe of thousands of stocks with no guardrails. There's no low-cost, low-risk, low-friction way to *discover* stocks the way people discover music, restaurants, or dates.

**StockMatch** solves this by turning stock discovery into a swipe-based experience over a deliberately bounded, beginner-safe universe (the Nasdaq-100): each company becomes a "dating profile" — plain-English bio, key vitals, sentiment — and you swipe right to match or left to pass, paying only minimal per-trade brokerage instead of ongoing fund management fees.

---

## 2. What It Does

StockMatch is a single-page React web app that lets a user:

1. **Swipe through the Nasdaq‑100** — each stock is presented as a flippable card (front = vibe/summary, back = financial vitals) with Tinder-style drag gestures (swipe right = match/interested, swipe left = pass).
2. **Filter by "earnings month"** — a monthly earnings deck view (`ALL`, Jan, Feb, Mar) lets users focus on companies reporting soon.
3. **Undo swipes** — a full history buffer allows stepping back through recent decisions.
4. **Get an AI Analyst auto-pick** — a "StockMatch AI Analyst" feature that:
   - First tries to talk to a **local Ollama LLM** (`http://localhost:11434`) to rank the top 20 stocks by financial strength, streaming its reasoning into a live terminal-style log UI.
   - **Falls back to a deterministic rule-based scoring classifier** (revenue growth × margin × yearly momentum) if Ollama is offline/unreachable — so the demo always works even without a local model running.
5. **Review matches on a Dashboard** with three views:
   - **Mix** — sector/portfolio composition breakdown.
   - **Matrix** — full grid/table of matched vs. rejected tickers with search/filter.
   - **Portfolio** — simulated brokerage view of funded holdings.
6. **"Fund" a virtual portfolio** — allocate a mock cash amount across matched stocks, with automatic share-quantity and cost-basis calculation, plus a side-by-side comparison tool before committing capital.
7. **Simulate live trading** — buy/sell additional shares of a holding, unmatch a stock (which sells out the position), and watch holdings fluctuate in near-real time via a client-side price-simulation interval.
8. **Admin / Developer Settings panel** — a power-user drawer to:
   - Add custom stocks on the fly.
   - Toggle which data fields appear on cards (price, QoQ/YoY/5Y change, revenue, margin, consensus, gossip, trivia) — a live "card designer."
   - Configure API keys (OpenAI / FMP) for future live-data mode.
   - Run a simulated **Interactive Brokers (IBKR) sandbox sync** that mimics authenticating to a paper account and pulling live quotes for Nasdaq constituents.
   - Reset the whole session.

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Animation / Gestures | Framer Motion (drag physics, card stack, transitions) |
| Icons | lucide-react |
| Linting | Oxlint |
| Data | Local static dataset (`src/data/stocksData.js`) — 100 Nasdaq-100 constituents with generated financial vitals |
| AI | Local Ollama LLM integration (optional) with rule-based heuristic fallback — no external API key required to demo |
| Persistence | `localStorage` (saved API keys) |
| Deployment | GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`) |

No backend/server is required — it's a fully client-side app, which makes it trivial to demo and deploy (currently ships to GitHub Pages on every push to `main`).

---

## 4. Architecture

```
src/
├── App.jsx                    # Root state machine: screen routing, swipe/match/portfolio logic, AI analyst orchestration
├── data/stocksData.js         # Static Nasdaq-100 dataset (ticker, sector, vitals, bios, earnings month)
└── components/
    ├── LandingSplash.jsx      # Hero/onboarding screen
    ├── SwipeWorkspace.jsx     # Swipe deck: drag physics, card stack, month filter, undo
    ├── StockCard.jsx          # Flippable stock "profile" card (front bio / back vitals)
    ├── MatchListDashboard.jsx # Mix / Matrix / Portfolio dashboard views
    ├── FundPortfolioModal.jsx # Capital allocation + order ticket + comparison flow
    ├── MatchModal.jsx         # "It's a Match!" celebration modal
    └── DynamicSettings.jsx    # Admin drawer: card config, custom stocks, AI/IBKR sandbox sync
```

**App-level state** (in `App.jsx`) drives three screens (`landing` → `swiping` → `dashboard`) and owns: the active stock deck, matches, rejects, swipe history (for undo), the simulated portfolio, and card-visibility configuration — all passed down as props (no external state library needed given the app's scope).

---

## 5. Key Engineering Highlights (good talking points for judges)

- **Graceful AI degradation** — the auto-match feature tries a real local LLM first and silently degrades to a deterministic scoring algorithm on timeout/CORS/offline, so the "AI" demo is never flaky on stage.
- **Physics-based swipe interactions** — velocity- and offset-based thresholds (Framer Motion `useMotionValue`/`useTransform`) replicate native swipe-card feel in the browser.
- **Undo stack** — swipe actions are journaled so any single decision can be reverted without losing dashboard state.
- **Portfolio math correctness** — funding, top-ups, buys/sells, and unmatch-triggered liquidation all recompute `investedAmount`/`sharesOwned` immutably and consistently.
- **Zero backend, fully static deploy** — entire experience (including the "live" IBKR sync) runs client-side with simulated network calls, making it demo-safe with no server costs or API keys required.

---

## 6. How to Run

```bash
npm install
npm run dev       # local dev server (Vite)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

Deployment is automatic: pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages.

---

## 7. Future Roadmap

- Replace the static dataset with a real market-data API (Financial Modeling Prep key field already scaffolded in Settings).
- Wire the OpenAI key field into a real LLM analyst call as an alternative to local Ollama.
- Persist matches/portfolio across sessions (currently in-memory + localStorage for keys only).
- Real brokerage integration beyond the simulated IBKR sandbox flow.

---

## 8. Team / Submission Notes

*(Fill in: team name, members, hackathon track, and any demo video/link here.)*
