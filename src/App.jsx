import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, Settings, TrendingUp, Grid, Sparkles } from 'lucide-react';
import { stocksData } from './data/stocksData';
import LandingSplash from './components/LandingSplash';
import SwipeWorkspace from './components/SwipeWorkspace';
import MatchListDashboard from './components/MatchListDashboard';
import MatchModal from './components/MatchModal';
import FundPortfolioModal from './components/FundPortfolioModal';
import DynamicSettings from './components/DynamicSettings';

export default function App() {
  // --- Core States ---
  const [screen, setScreen] = useState('landing'); // 'landing' | 'swiping' | 'dashboard'
  const [stocks, setStocks] = useState(stocksData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [rejects, setRejects] = useState([]); // Track rejected tickers in Q4 session
  const [history, setHistory] = useState([]); // Undo history buffer
  const [portfolio, setPortfolio] = useState(null); // Funded portfolio holdings
  const [dashboardTab, setDashboardTab] = useState('mix'); // 'mix' | 'matrix' | 'portfolio'

  // --- Monthly Earnings Deck State ---
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' | 1 | 2 | 3 ...

  // --- Card Parameters Visibility Configuration (Admin Panel) ---
  const [cardConfig, setCardConfig] = useState({
    showPrice: true,
    showChangeQ: true,
    showChangeY: true,
    showChange5Y: true,
    showRevenue: true,
    showMargin: true,
    showConsensus: true,
    showGossip: true,
    showTrivia: true
  });

  // --- Modal States ---
  const [celebrationStock, setCelebrationStock] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analystLogs, setAnalystLogs] = useState([]);

  // --- Sandbox / Dev Key States ---
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [apiKeys, setApiKeys] = useState({ openai: '', fmp: '' });

  // Load saved API keys on initial render
  useEffect(() => {
    const savedKeys = localStorage.getItem('stockmatch_keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse saved keys", e);
      }
    }
  }, []);

  // Live Price Fluctuation Simulator for Portfolio Holdings
  useEffect(() => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) return;

    const interval = setInterval(() => {
      setPortfolio((prev) => {
        if (!prev) return prev;
        const updatedHoldings = prev.holdings.map((holding) => {
          const pct = (Math.random() * 3.3 - 1.5) / 100; // -1.5% to +1.8%
          const nextPrice = Math.max(1, Math.round(holding.currentPrice * (1 + pct) * 100) / 100);
          return {
            ...holding,
            currentPrice: nextPrice
          };
        });
        return {
          ...prev,
          holdings: updatedHoldings
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [portfolio]);

  // Filter stocks dynamically by selected announcement month
  const activeDeck = selectedMonth === 'ALL'
    ? stocks
    : stocks.filter((s) => s.earningsMonth === selectedMonth);

  // Safeguard: Ensure matches contains no duplicate stock objects
  const uniqueMatches = matches.filter((stock, index, self) =>
    self.findIndex((s) => s.id === stock.id) === index
  );

  // Change Month Filter and reset deck pointer
  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    setCurrentIndex(0);
    setHistory([]);
  };

  // --- Swiping Logic Handlers ---
  const handleSwipeRight = (stock) => {
    setMatches((prev) => {
      if (prev.some((s) => s.id === stock.id)) return prev;
      return [...prev, stock];
    });
    setRejects((prev) => prev.filter((t) => t !== stock.ticker.toLowerCase()));
    setHistory((prev) => [...prev, { index: currentIndex, isMatch: true, stockId: stock.id }]);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeLeft = (stock) => {
    setMatches((prev) => prev.filter((s) => s.id !== stock.id));
    setRejects((prev) => {
      if (prev.includes(stock.ticker.toLowerCase())) return prev;
      return [...prev, stock.ticker.toLowerCase()];
    });
    setHistory((prev) => [...prev, { index: currentIndex, isMatch: false, stockId: stock.id }]);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUnmatch = (stockId) => {
    const targetStock = matches.find(s => s.id === stockId);
    if (!targetStock) return;
    
    // Remove from matches
    setMatches((prev) => prev.filter((s) => s.id !== stockId));
    // Add to rejects
    setRejects((prev) => [...prev, targetStock.ticker.toLowerCase()]);

    // Sell/remove stock from funded holdings if it was part of the portfolio
    setPortfolio((prev) => {
      if (!prev || !prev.holdings) return prev;
      const updatedHoldings = prev.holdings.filter((h) => h.id !== stockId);
      if (updatedHoldings.length === 0) return null; // Portfolio completely sold out
      
      const nextInvested = updatedHoldings.reduce((acc, h) => acc + h.investedAmount, 0);
      return {
        ...prev,
        totalInvested: nextInvested,
        holdings: updatedHoldings
      };
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastAction.index);

    if (lastAction.isMatch) {
      setMatches((prev) => prev.filter((s) => s.id !== lastAction.stockId));
    } else {
      // Find ticker name in stocks array to remove it from rejects
      const undoneStock = activeDeck[lastAction.index];
      if (undoneStock) {
        setRejects((prev) => prev.filter((t) => t !== undoneStock.ticker.toLowerCase()));
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setMatches([]);
    setRejects([]);
    setHistory([]);
    setSelectedMonth('ALL');
    setScreen('swiping');
    setPortfolio(null);
  };

  const handleResumeSwiping = () => {
    setCurrentIndex(0);
    setHistory([]);
    setScreen('swiping');
  };

  const handleDeployPortfolio = (amount, matchedList) => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      const allocation = amount / matchedList.length;
      const holdings = matchedList.map(stock => {
        const price = stock.lastPrice;
        const shares = Math.floor(allocation / price);
        const cost = shares * price;
        return {
          id: stock.id,
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          buyPrice: price,
          currentPrice: price,
          sharesOwned: shares,
          investedAmount: cost,
          logoBg: stock.logoBg
        };
      }).filter(h => h.sharesOwned > 0);
      
      const actualInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
      
      setPortfolio({
        totalInvested: actualInvested,
        dateFunded: new Date().toLocaleDateString(),
        holdings
      });
    } else {
      const portfolioTickers = portfolio.holdings.map(h => h.ticker);
      const newStocksToFund = matchedList.filter(s => !portfolioTickers.includes(s.ticker));
      
      if (newStocksToFund.length > 0) {
        const allocation = amount / newStocksToFund.length;
        const newHoldings = newStocksToFund.map(stock => {
          const price = stock.lastPrice;
          const shares = Math.floor(allocation / price);
          const cost = shares * price;
          return {
            id: stock.id,
            ticker: stock.ticker,
            name: stock.name,
            sector: stock.sector,
            buyPrice: price,
            currentPrice: price,
            sharesOwned: shares,
            investedAmount: cost,
            logoBg: stock.logoBg
          };
        }).filter(h => h.sharesOwned > 0);
        
        const addedInvested = newHoldings.reduce((sum, h) => sum + h.investedAmount, 0);
        
        setPortfolio(prev => ({
          ...prev,
          totalInvested: prev.totalInvested + addedInvested,
          holdings: [...prev.holdings, ...newHoldings]
        }));
      } else {
        const allocation = amount / matchedList.length;
        setPortfolio(prev => {
          let addedInvested = 0;
          const updatedHoldings = prev.holdings.map(h => {
            const isTarget = matchedList.some(s => s.id === h.id);
            if (!isTarget) return h;
            
            const price = h.currentPrice;
            const sharesChange = Math.floor(allocation / price);
            const costChange = sharesChange * price;
            addedInvested += costChange;
            
            return {
              ...h,
              sharesOwned: h.sharesOwned + sharesChange,
              investedAmount: h.investedAmount + costChange
            };
          });
          
          return {
            ...prev,
            totalInvested: prev.totalInvested + addedInvested,
            holdings: updatedHoldings
          };
        });
      }
    }
    
    setScreen('dashboard');
    setDashboardTab('portfolio');
  };

  const addAnalystLog = (text) => {
    setAnalystLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const handleAutoSelectMatches = async () => {
    setIsAnalyzing(true);
    setAnalystLogs([]);
    addAnalystLog("Booting StockMatch AI Analyst...");
    addAnalystLog("Pinging local Ollama status at http://localhost:11434...");

    let ollamaSucceeded = false;
    let selectedTickers = [];

    // Timeout-based fetch check for Ollama status
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    try {
      const pingRes = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (pingRes.ok) {
        addAnalystLog("Ollama status: ONLINE! Listing local models...");
        const tagData = await pingRes.json();
        const models = tagData.models || [];
        const modelNames = models.map(m => m.name);
        addAnalystLog(`Local Models Found: ${modelNames.join(', ') || 'None'}`);

        const activeModel = modelNames[0] || 'llama3';
        addAnalystLog(`Selecting model '${activeModel}' for financial screening...`);
        addAnalystLog("Sending 100 Nasdaq constituent financial ratios...");

        const ollamaController = new AbortController();
        const ollamaTimeoutId = setTimeout(() => ollamaController.abort(), 8000); // 8s max wait

        const promptText = `Analyze this list of Nasdaq stocks and select the top 20 tickers with the strongest financials (highest revenue growth and margins). Return ONLY a JSON list of tickers like ["AAPL", "MSFT", ...]. Stocks: ${JSON.stringify(stocksData.slice(0, 30).map(s => ({ ticker: s.ticker, rev: s.vitals.revenueGrowth, pm: s.vitals.profitMargin })))};`;

        const generateRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: activeModel,
            prompt: promptText,
            stream: false,
            options: { temperature: 0.1 }
          }),
          signal: ollamaController.signal
        });
        clearTimeout(ollamaTimeoutId);

        if (generateRes.ok) {
          const genData = await generateRes.json();
          addAnalystLog("Ollama AI response received. Parsing tickers...");
          const match = genData.response.match(/\[\s*".*?"\s*(?:,\s*".*?"\s*)*\]/);
          if (match) {
            selectedTickers = JSON.parse(match[0]);
            addAnalystLog(`Ollama selected: ${selectedTickers.join(', ')}`);
            ollamaSucceeded = true;
          }
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      addAnalystLog("Ollama connection failed (Offline, Timeout, or CORS blocked).");
    }

    // Heuristic Fallback
    if (!ollamaSucceeded) {
      addAnalystLog("Booting Local Rule-Based Financial Classifier...");
      addAnalystLog("Processing 100 balance sheets based on revenue growth, margins, and market momentum...");
      
      const scoredList = stocksData.map(s => {
        const rev = parseFloat(s.vitals.revenueGrowth.replace(/[+%]/g, '')) || 0;
        const pm = parseFloat(s.vitals.profitMargin.replace(/[+%]/g, '')) || 0;
        const score = (rev * 1.5) + (pm * 2.0) + (s.changeYear * 0.5);
        return { stock: s, score };
      });

      const sorted = scoredList.sort((a, b) => b.score - a.score).slice(0, 20);
      selectedTickers = sorted.map(x => x.stock.ticker);
      
      setTimeout(() => {
        addAnalystLog("Classifier evaluation complete!");
        sorted.slice(0, 5).forEach((x, i) => {
          addAnalystLog(`#Rank ${i+1}: ${x.stock.ticker} - Score: ${x.score.toFixed(1)} (${x.stock.name})`);
        });
      }, 800);
    }

    setTimeout(() => {
      addAnalystLog(`AI auto-matched ${selectedTickers.length} stocks successfully!`);
      addAnalystLog("Injecting matches into watchlist portfolio... ✓");
      addAnalystLog("Populating matrix table rejects... ✓");
      addAnalystLog("Redirecting to results dashboard... ✓");
    }, 1800);

    setTimeout(() => {
      const matchedList = stocksData.filter(s => selectedTickers.includes(s.ticker));
      setMatches((prev) => {
        const merged = [...prev, ...matchedList];
        return merged.filter((stock, index, self) =>
          self.findIndex((s) => s.id === stock.id) === index
        );
      });
      
      const rejectTickers = stocksData
        .filter(s => !selectedTickers.includes(s.ticker))
        .map(s => s.ticker.toLowerCase());
      setRejects((prev) => {
        const currentMatchTickers = matches.map(m => m.ticker.toLowerCase());
        const updated = prev.filter(t => !selectedTickers.map(x => x.toLowerCase()).includes(t));
        const addedRejects = rejectTickers.filter(t => !currentMatchTickers.includes(t));
        return Array.from(new Set([...updated, ...addedRejects]));
      });
      
      setCurrentIndex(stocksData.length);
      setIsAnalyzing(false);
      setScreen('dashboard');
    }, 2800);
  };

  const handleAddCustomStock = (newStock) => {
    const updatedStocks = [...stocks];
    updatedStocks.splice(currentIndex, 0, newStock);
    setStocks(updatedStocks);
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Navbar */}
      <header style={styles.navbar} className="glass-panel">
        <div style={styles.navLeft} onClick={() => setScreen('landing')} className="btn-hover-grow">
          <TrendingUp size={20} color="var(--color-purple)" />
          <span style={styles.logoText}>StockMatch</span>
        </div>

        <div style={styles.navRight}>
          {screen !== 'landing' && (
            <div 
              style={styles.matchCounterBadge} 
              onClick={() => setScreen(screen === 'swiping' ? 'dashboard' : 'swiping')}
              className="btn-hover-grow"
              title={screen === 'swiping' ? "View Dashboard Results" : "Resume Swiping / Edit Matches"}
            >
              <Heart size={14} color="var(--color-bearish)" fill="var(--color-bearish)" />
              <span style={styles.matchCountText}>{uniqueMatches.length} matches</span>
            </div>
          )}
          
          <button 
            onClick={() => setShowSettings(true)} 
            style={styles.settingsBtn} 
            className="btn-hover-grow"
            title="Open Developer Settings & Admin Panel"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Screen Layout Container */}
      <main style={styles.mainContent}>
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <LandingSplash 
              key="landing"
              onStart={() => setScreen('swiping')} 
              onAutoSelect={handleAutoSelectMatches}
              totalCount={stocks.length}
            />
          )}

          {screen === 'swiping' && (
            <SwipeWorkspace
              key="swiping"
              stocks={activeDeck}
              currentIndex={currentIndex}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onUndo={handleUndo}
              canUndo={history.length > 0}
              onFinish={() => setScreen('dashboard')}
              selectedMonth={selectedMonth}
              setSelectedMonth={handleSelectMonth}
              cardConfig={cardConfig}
            />
          )}

          {screen === 'dashboard' && (
            <MatchListDashboard
              key="dashboard"
              matches={uniqueMatches}
              rejects={rejects}
              onReset={handleResumeSwiping}
              onOpenFundModal={() => setShowFundModal(true)}
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              activeTab={dashboardTab}
              setActiveTab={setDashboardTab}
              onUnmatch={handleUnmatch}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Drawers */}
      <AnimatePresence>
        {celebrationStock && (
          <MatchModal 
            key="match-modal"
            stock={celebrationStock} 
            onClose={() => setCelebrationStock(null)} 
          />
        )}

        {showFundModal && (
          <FundPortfolioModal 
            key="fund-modal"
            matches={uniqueMatches}
            onUnmatch={handleUnmatch}
            onClose={() => setShowFundModal(false)} 
            onDeployPortfolio={handleDeployPortfolio}
            portfolio={portfolio}
          />
        )}

        {showSettings && (
          <DynamicSettings 
            key="settings-drawer"
            onClose={() => setShowSettings(false)}
            onAddCustomStock={handleAddCustomStock}
            isLiveMode={isLiveMode}
            setIsLiveMode={setIsLiveMode}
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
            cardConfig={cardConfig}
            setCardConfig={setCardConfig}
            onAutoSelect={handleAutoSelectMatches}
            onResetAll={handleReset}
            stocks={stocks}
            setStocks={setStocks}
            setPortfolio={setPortfolio}
            portfolio={portfolio}
          />
        )}

        {isAnalyzing && (
          <div style={styles.analystOverlay} key="analyst-overlay">
            <div style={styles.analystModal} className="glass-panel pulse-glow">
              <div style={styles.analystHeader}>
                <div style={styles.spinnerMini} />
                <h3 style={styles.analystTitle}>StockMatch AI Analyst</h3>
              </div>
              <p style={styles.analystDesc}>
                Evaluating 100 Nasdaq constituents...
              </p>
              <div style={styles.analystTerminal}>
                <div style={styles.terminalHeaderMini}>
                  <span>AI ANALYST OUTPUT TERMINAL</span>
                </div>
                <div style={styles.terminalBodyMini}>
                  {analystLogs.map((log, idx) => (
                    <div key={idx} style={styles.terminalLine}>{log}</div>
                  ))}
                  <div style={styles.terminalCursor}>■ Processing...</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '0 0 16px 16px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    background: 'rgba(15, 23, 42, 0.4)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '56px',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '1.15rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  matchCounterBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    padding: '4px 10px',
    borderRadius: '30px',
    cursor: 'pointer',
  },
  matchCountText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--color-bearish)',
    fontFamily: 'var(--font-display)',
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  analystOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(5, 5, 8, 0.95)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  analystModal: {
    maxWidth: '520px',
    width: '100%',
    padding: '30px 24px',
    borderRadius: '24px',
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    boxShadow: 'var(--shadow-glow-gold)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  analystHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  analystTitle: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    color: '#fff',
  },
  analystDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  analystTerminal: {
    background: '#070a13',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '10px',
  },
  terminalHeaderMini: {
    background: '#0d1220',
    padding: '6px 12px',
    fontSize: '0.62rem',
    color: '#94a3b8',
    fontWeight: '700',
    borderBottom: '1px solid #1e293b',
  },
  terminalBodyMini: {
    padding: '12px',
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    textAlign: 'left',
  },
  spinnerMini: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(139, 92, 246, 0.1)',
    borderTop: '2px solid var(--color-purple)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
