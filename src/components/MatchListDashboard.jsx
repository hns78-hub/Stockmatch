import React, { useState } from 'react';
import { Briefcase, CreditCard, RotateCcw, ChevronRight, Info, Check, X, Search, Grid, PieChart } from 'lucide-react';
import { stocksData } from '../data/stocksData';

export default function MatchListDashboard({ 
  matches, 
  rejects = [], 
  onReset, 
  onOpenFundModal,
  portfolio,
  setPortfolio,
  activeTab: propsActiveTab,
  setActiveTab: propsSetActiveTab,
  onUnmatch
}) {
  const [localActiveTab, setLocalActiveTab] = useState('mix');
  const activeTab = propsActiveTab !== undefined ? propsActiveTab : localActiveTab;
  const setActiveTab = propsSetActiveTab !== undefined ? propsSetActiveTab : setLocalActiveTab;

  const [hoveredSector, setHoveredSector] = useState(null);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Portfolio Calculations & Trading State ---
  const holdings = portfolio?.holdings || [];
  const totalInvested = portfolio?.totalInvested || 0;
  const totalCurrentValue = holdings.reduce((acc, h) => acc + (h.sharesOwned * h.currentPrice), 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const [tradingTicker, setTradingTicker] = useState(null);
  const [tradeQuantity, setTradeQuantity] = useState('5');
  const [tradeType, setTradeType] = useState('BUY');

  const handleExecuteTrade = (ticker) => {
    const qty = parseInt(tradeQuantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    // Check if we are selling all shares of this stock
    const holding = portfolio?.holdings?.find(h => h.ticker === ticker);
    if (holding && tradeType === 'SELL' && qty >= holding.sharesOwned) {
      const matchItem = matches.find(m => m.ticker === ticker);
      if (matchItem && onUnmatch) {
        onUnmatch(matchItem.id);
        setTradingTicker(null);
        return;
      }
    }

    setPortfolio((prev) => {
      if (!prev) return prev;
      const updatedHoldings = prev.holdings.map((h) => {
        if (h.ticker !== ticker) return h;
        
        const price = h.currentPrice;
        const qtyChange = tradeType === 'BUY' ? qty : -Math.min(qty, h.sharesOwned);
        const valueChange = qtyChange * price;
        
        return {
          ...h,
          sharesOwned: Math.max(0, Math.round(h.sharesOwned + qtyChange)),
          investedAmount: Math.max(0, h.investedAmount + valueChange)
        };
      }).filter(h => h.sharesOwned > 0);

      const nextInvested = updatedHoldings.reduce((acc, h) => acc + h.investedAmount, 0);

      return {
        ...prev,
        totalInvested: nextInvested,
        holdings: updatedHoldings
      };
    });

    setTradingTicker(null);
  };

  // Helper to generate seed-based stable historical swipes for Q1, Q2, Q3
  const getHistoricalDecision = (ticker, quarter) => {
    let hash = 0;
    const key = `${ticker}-${quarter}`;
    for (let i = 0; i < key.length; i++) {
      hash = Math.imul(31, hash) + key.charCodeAt(i) | 0;
    }
    return (hash % 3 === 0); // 33% chance of match
  };

  const getQ4Decision = (ticker) => {
    const isMatched = matches.some(s => s.ticker === ticker);
    const isRejected = rejects.some(t => t === ticker.toLowerCase());
    
    if (isMatched) return 'match';
    if (isRejected) return 'reject';
    return 'unswiped';
  };

  const totalMatches = matches.length;

  // Group matches by sector
  const matchesBySector = matches.reduce((acc, stock) => {
    acc[stock.sector] = (acc[stock.sector] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart segments
  const totalWeight = Object.values(matchesBySector).reduce((sum, val) => sum + val, 0);
  
  const colors = {
    'Tech': '#a78bfa',        // Purple
    'Retail': '#60a5fa',      // Blue
    'Healthcare': '#fb7185',  // Rose
    'Automotive': '#f472b6',  // Pink
    'Entertainment': '#38bdf8', // Light Blue
    'Food & Beverage': '#fbbf24', // Gold
    'Custom': '#34d399'       // Emerald
  };

  let cumulativePercent = 0;
  const sectorsList = Object.keys(matchesBySector).map((key) => {
    const count = matchesBySector[key];
    const percentage = Math.round((count / totalWeight) * 100);
    const color = colors[key] || '#94a3b8';
    const startPercent = cumulativePercent;
    cumulativePercent += percentage;
    return { name: key, count, percentage, color, startPercent };
  });

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const renderDonutChart = () => {
    if (sectorsList.length === 0) return null;

    let totalPercentageDrawn = 0;

    return (
      <div style={styles.donutWrapper}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={styles.donutSvg}>
          {sectorsList.map((sector, index) => {
            const startVal = totalPercentageDrawn / 100;
            totalPercentageDrawn += sector.percentage;
            const endVal = totalPercentageDrawn / 100;

            const [startX, startY] = getCoordinatesForPercent(startVal);
            const [endX, endY] = getCoordinatesForPercent(endVal);

            const largeArcFlag = sector.percentage > 50 ? 1 : 0;

            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`
            ].join(' ');

            const isHighlighted = hoveredSector === sector.name || selectedSectorFilter === sector.name;

            return (
              <path
                key={index}
                d={pathData}
                fill={sector.color}
                opacity={selectedSectorFilter && !isHighlighted ? 0.25 : isHighlighted ? 0.95 : 0.75}
                style={{
                  cursor: 'pointer',
                  transform: isHighlighted ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: '0 0',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={() => setHoveredSector(sector.name)}
                onMouseLeave={() => setHoveredSector(null)}
                onClick={() => {
                  if (selectedSectorFilter === sector.name) {
                    setSelectedSectorFilter(null);
                  } else {
                    setSelectedSectorFilter(sector.name);
                  }
                }}
              />
            );
          })}
        </svg>
        
        <div style={styles.donutTextContainer}>
          <span style={styles.donutValue}>
            {hoveredSector 
              ? `${sectorsList.find(s => s.name === hoveredSector).percentage}%` 
              : selectedSectorFilter
              ? `${sectorsList.find(s => s.name === selectedSectorFilter).percentage}%`
              : `${totalMatches}`}
          </span>
          <span style={styles.donutLabel}>
            {hoveredSector 
              ? hoveredSector 
              : selectedSectorFilter
              ? selectedSectorFilter
              : 'Matches'}
          </span>
        </div>
      </div>
    );
  };

  const filteredMatches = selectedSectorFilter 
    ? matches.filter(s => s.sector === selectedSectorFilter)
    : matches;

  // Search filter for Birds Eye Table
  const filteredAllStocks = stocksData.filter(stock => 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPortfolioTab = () => {
    if (!portfolio || holdings.length === 0) {
      return (
        <div style={styles.emptyCard} className="glass-panel">
          <Briefcase size={40} color="var(--color-purple)" style={{ marginBottom: '12px' }} />
          <h3>No Active Holdings Yet</h3>
          <p>
            You have {matches.length} matches. Click the button below to fund your watchlist and deploy simulated capital.
          </p>
          <button 
            onClick={matches.length > 0 ? onOpenFundModal : onReset} 
            style={styles.emptySwipeBtn} 
            className="btn-hover-grow glow-purple"
          >
            {matches.length > 0 ? "Fund this Portfolio" : "Resume Swiping / Match Stocks"}
          </button>
        </div>
      );
    }

    return (
      <div style={styles.portfolioGrid}>
        {/* Performance Header summary cards */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard} className="glass-panel">
            <span style={styles.summaryLabel}>Total Portfolio Value</span>
            <div style={styles.valueRow}>
              <h2 style={styles.summaryValue}>
                ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div style={styles.liveIndicator}>
                <span style={styles.liveDot} />
                <span style={styles.liveText}>LIVE</span>
              </div>
            </div>
          </div>

          <div style={styles.summaryCard} className="glass-panel">
            <span style={styles.summaryLabel}>Total Profit / Loss</span>
            <h2 style={{ ...styles.summaryValue, color: totalPnL >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={styles.percentPnL}> ({totalPnLPct.toFixed(2)}%)</span>
            </h2>
          </div>

          <div style={styles.summaryCard} className="glass-panel">
            <span style={styles.summaryLabel}>Simulated Cash Invested</span>
            <h2 style={{ ...styles.summaryValue, color: '#fff' }}>
              ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Portfolio Area Chart */}
        <div style={styles.chartPanel} className="glass-panel">
          <h4 style={styles.chartTitle}>Simulated Value History (Past 30 Days)</h4>
          <div style={styles.chartContainer}>
            <svg viewBox="0 0 500 120" style={{ width: '100%', height: '120px' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d={`M 0 100 L 80 95 L 160 102 L 240 85 L 320 70 L 400 75 L 500 ${Math.max(10, Math.min(110, 100 - (totalPnLPct * 2.5)))}`}
                fill="none" 
                stroke="var(--color-purple)" 
                strokeWidth="2.5" 
              />
              <path 
                d={`M 0 100 L 80 95 L 160 102 L 240 85 L 320 70 L 400 75 L 500 ${Math.max(10, Math.min(110, 100 - (totalPnLPct * 2.5)))} L 500 120 L 0 120 Z`}
                fill="url(#chartGrad)" 
              />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
            </svg>
          </div>
        </div>

        {/* Holdings Table */}
        <div style={styles.holdingsPanel} className="glass-panel">
          <h4 style={styles.panelTitle}>Your Positions ({holdings.length})</h4>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.tableTh}>Asset</th>
                  <th style={styles.tableTh}>Avg Cost</th>
                  <th style={styles.tableTh}>Live Price</th>
                  <th style={styles.tableTh}>Shares Owned</th>
                  <th style={styles.tableTh}>Current Value</th>
                  <th style={styles.tableTh}>Returns</th>
                  <th style={styles.tableTh}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const currentValue = h.sharesOwned * h.currentPrice;
                  const pnl = currentValue - h.investedAmount;
                  const pnlPct = h.investedAmount > 0 ? (pnl / h.investedAmount) * 100 : 0;

                  return (
                    <React.Fragment key={h.id}>
                      <tr style={styles.tableRow}>
                        <td style={styles.tableTd}>
                          <div style={styles.assetCell}>
                            <div style={{ ...styles.assetLogo, background: h.logoBg }}>{h.ticker.substring(0,2)}</div>
                            <div>
                              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{h.ticker}</strong>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.tableTd}>${h.buyPrice.toFixed(2)}</td>
                        <td style={{ ...styles.tableTd, fontWeight: '700', color: '#fff' }}>
                          ${h.currentPrice.toFixed(2)}
                        </td>
                        <td style={styles.tableTd}>{h.sharesOwned.toFixed(3)}</td>
                        <td style={{ ...styles.tableTd, fontWeight: '700', color: '#fff' }}>
                          ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ ...styles.tableTd, fontWeight: '700', color: pnl >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                        </td>
                        <td style={styles.tableTd}>
                          <button 
                            onClick={() => {
                              setTradingTicker(tradingTicker === h.ticker ? null : h.ticker);
                              setTradeQuantity('5');
                            }}
                            style={styles.tradeBtn}
                            className="btn-hover-grow"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Inline Trading Panel */}
                      {tradingTicker === h.ticker && (
                        <tr>
                          <td colSpan="7" style={styles.tradePanelTd}>
                            <div style={styles.tradePanelBox} className="glass-panel">
                              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.78rem' }}>Simulated Brokerage Execution</span>
                              <div style={styles.tradeRow}>
                                <div style={styles.tradeToggle}>
                                  <button 
                                    onClick={() => setTradeType('BUY')} 
                                    style={{ ...styles.tradeTypeBtn, background: tradeType === 'BUY' ? 'var(--color-bullish)' : 'rgba(255,255,255,0.03)', color: '#fff' }}
                                  >
                                    Buy Shares
                                  </button>
                                  <button 
                                    onClick={() => setTradeType('SELL')} 
                                    style={{ ...styles.tradeTypeBtn, background: tradeType === 'SELL' ? 'var(--color-bearish)' : 'rgba(255,255,255,0.03)', color: '#fff' }}
                                  >
                                    Sell Shares
                                  </button>
                                </div>
                                <div style={styles.tradeInputGroup}>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Quantity (shares):</span>
                                  <input 
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={tradeQuantity}
                                    onChange={(e) => setTradeQuantity(e.target.value)}
                                    style={styles.tradeInput}
                                  />
                                  <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '600', marginLeft: '6px' }}>
                                    Est. Value: ${(parseInt(tradeQuantity, 10) * h.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleExecuteTrade(h.ticker)}
                                  style={styles.executeTradeBtn}
                                  className="btn-hover-grow"
                                >
                                  Execute {tradeType}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Dashboard Top Header */}
      <div style={styles.dashboardHeader}>
        <div style={styles.titleArea}>
          <Briefcase size={22} color="var(--color-purple)" />
          <h1 style={styles.title}>Watchlist Dashboard</h1>
        </div>
        <button onClick={onReset} style={styles.resetBtn} className="btn-hover-grow">
          <RotateCcw size={15} />
          <span>Resume Swiping / Add More</span>
        </button>
      </div>

      {/* Tabs Selector */}
      <div style={styles.tabBar} className="glass-panel">
        <button 
          onClick={() => setActiveTab('mix')} 
          style={{ 
            ...styles.tabBtn, 
            background: activeTab === 'mix' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: activeTab === 'mix' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <PieChart size={16} />
          <span>Portfolio Mix</span>
        </button>
        <button 
          onClick={() => setActiveTab('birdseye')} 
          style={{ 
            ...styles.tabBtn, 
            background: activeTab === 'birdseye' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: activeTab === 'birdseye' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Grid size={16} />
          <span>Birds Eye View (Q1-Q4 Matrix)</span>
        </button>
        <button 
          onClick={() => setActiveTab('portfolio')} 
          style={{ 
            ...styles.tabBtn, 
            background: activeTab === 'portfolio' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: activeTab === 'portfolio' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Briefcase size={16} />
          <span>Active Portfolio</span>
        </button>
      </div>

      {/* Render tab bodies */}
      {activeTab === 'mix' && (
        totalMatches === 0 ? (
          <div style={styles.emptyCard} className="glass-panel">
            <h3>No matches yet!</h3>
            <p>You swiped left on everything. Try resetting and matching with some companies to see your dream mix!</p>
            <button onClick={onReset} style={styles.emptySwipeBtn} className="btn-hover-grow glow-gold">
              Start Swiping
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {/* LEFT COLUMN: Analytics */}
            <div style={styles.analyticsColumn} className="glass-panel">
              <h3 style={styles.sectionTitle}>SECTOR ALLOCATION</h3>
              
              {renderDonutChart()}

              {/* Legends */}
              <div style={styles.legendList}>
                {sectorsList.map((sector, idx) => {
                  const isFiltered = selectedSectorFilter === sector.name;
                  return (
                    <div 
                      key={idx} 
                      style={{
                        ...styles.legendRow,
                        background: isFiltered ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderColor: isFiltered ? 'rgba(255,255,255,0.1)' : 'transparent',
                      }}
                      onClick={() => {
                        if (selectedSectorFilter === sector.name) {
                          setSelectedSectorFilter(null);
                        } else {
                          setSelectedSectorFilter(sector.name);
                        }
                      }}
                    >
                      <div style={styles.legendLeft}>
                        <span style={{ ...styles.legendDot, background: sector.color }} />
                        <span style={styles.legendName}>{sector.name}</span>
                      </div>
                      <div style={styles.legendRight}>
                        <span style={styles.legendCount}>{sector.count} stocks</span>
                        <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{sector.percentage}%</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Watchlist */}
            <div style={styles.watchlistColumn} className="glass-panel">
              <div style={styles.watchlistHeader}>
                <h3 style={styles.sectionTitle}>YOUR MATCHED watchlist ({filteredMatches.length})</h3>
                
                {matches.length > 0 && (
                  <button 
                    onClick={onOpenFundModal} 
                    style={styles.fundBtn}
                    className="btn-hover-grow glow-purple"
                  >
                    <CreditCard size={14} />
                    <span>Fund this Portfolio</span>
                  </button>
                )}
              </div>

              {selectedSectorFilter && (
                <div style={styles.filterChip}>
                  <span>Filtering: <strong>{selectedSectorFilter}</strong></span>
                  <button onClick={() => setSelectedSectorFilter(null)} style={styles.clearFilter}>
                    <X size={12} />
                  </button>
                </div>
              )}

              <div style={styles.watchlistScroll}>
                {filteredMatches.map((stock) => (
                  <div key={stock.id} style={styles.stockItem} className="glass-panel">
                    <div style={styles.stockInfo}>
                      <div style={{ ...styles.logoBg, background: stock.logoBg }}>
                        {stock.ticker.substring(0, 2)}
                      </div>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{stock.ticker}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                      </div>
                    </div>
                    <div style={styles.stockMetrics}>
                      <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Price</span>
                        <strong style={styles.metricVal}>${stock.lastPrice}</strong>
                      </div>
                      <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>1Y Return</span>
                        <strong style={{ 
                          ...styles.metricVal, 
                          color: stock.changeYear >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' 
                        }}>
                          {stock.changeYear >= 0 ? '+' : ''}{stock.changeYear}%
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

      {activeTab === 'birdseye' && (
        <div style={styles.birdsEyeContainer} className="glass-panel">
          <div style={styles.matrixHeaderRow}>
            <div>
              <h3 style={styles.matrixTitle}>Q1-Q4 Earnings Swipe Matrix</h3>
              <p style={styles.matrixSubtitle}>
                A complete bird's eye view comparing matches (✓) and passes (✗) across historical quarters.
              </p>
            </div>
            
            {/* Search Input */}
            <div style={styles.searchBox}>
              <Search size={14} color="var(--text-secondary)" style={{ marginLeft: '10px' }} />
              <input 
                type="text" 
                placeholder="Search ticker or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={styles.clearSearch}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.tableTh}>Company</th>
                  <th style={styles.tableTh}>Sector</th>
                  <th style={styles.tableTh}>Q1 (Historical)</th>
                  <th style={styles.tableTh}>Q2 (Historical)</th>
                  <th style={styles.tableTh}>Q3 (Historical)</th>
                  <th style={styles.tableTh}>Q4 (Active Session)</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllStocks.map((stock) => {
                  const q1 = getHistoricalDecision(stock.ticker, 'Q1');
                  const q2 = getHistoricalDecision(stock.ticker, 'Q2');
                  const q3 = getHistoricalDecision(stock.ticker, 'Q3');
                  const q4 = getQ4Decision(stock.ticker);

                  return (
                    <tr key={stock.id} style={styles.tableRow}>
                      <td style={styles.tableTd}>
                        <div style={styles.assetCell}>
                          <div style={{ ...styles.assetLogo, background: stock.logoBg }}>{stock.ticker.substring(0, 2)}</div>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{stock.ticker}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableTd}>
                        <span style={{ 
                          ...styles.matrixSectorBadge, 
                          color: colors[stock.sector] || 'var(--text-muted)', 
                          background: `rgba(${parseInt((colors[stock.sector] || '#fff').substring(1,3), 16)}, ${parseInt((colors[stock.sector] || '#fff').substring(3,5), 16)}, ${parseInt((colors[stock.sector] || '#fff').substring(5,7), 16)}, 0.08)` 
                        }}>
                          {stock.sector}
                        </span>
                      </td>
                      <td style={styles.tableTd}>
                        {q1 ? (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeMatch }}><Check size={12} /> MATCH</div>
                        ) : (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeReject }}><X size={12} /> PASS</div>
                        )}
                      </td>
                      <td style={styles.tableTd}>
                        {q2 ? (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeMatch }}><Check size={12} /> MATCH</div>
                        ) : (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeReject }}><X size={12} /> PASS</div>
                        )}
                      </td>
                      <td style={styles.tableTd}>
                        {q3 ? (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeMatch }}><Check size={12} /> MATCH</div>
                        ) : (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeReject }}><X size={12} /> PASS</div>
                        )}
                      </td>
                      <td style={styles.tableTd}>
                        {q4 === 'match' ? (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeMatch, border: '1px solid var(--color-bullish)' }}><Check size={12} /> MATCH</div>
                        ) : q4 === 'reject' ? (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeReject, border: '1px solid var(--color-bearish)' }}><X size={12} /> PASS</div>
                        ) : (
                          <div style={{ ...styles.matrixBadge, ...styles.badgeUnswiped }}>— UNSWIPED</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredAllStocks.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No companies match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && renderPortfolioTab()}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '1.6rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    color: '#fff',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    padding: '6px 14px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    padding: '6px',
    borderRadius: '14px',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  tabBtn: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    transition: 'var(--transition-smooth)',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '50px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  emptySwipeBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    marginTop: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    width: '100%',
  },
  analyticsColumn: {
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  donutWrapper: {
    position: 'relative',
    width: '200px',
    height: '200px',
    margin: '0 auto',
  },
  donutSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  donutTextContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  donutValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  donutLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  legendRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendName: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  legendRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  legendCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  watchlistColumn: {
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  watchlistHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
  },
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: '6px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  clearFilter: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  watchlistScroll: {
    maxHeight: '380px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '4px',
  },
  stockItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
  },
  stockInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoBg: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  stockMetrics: {
    display: 'flex',
    gap: '16px',
    textAlign: 'right',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: '0.85rem',
    color: '#fff',
    fontWeight: '600',
  },
  birdsEyeContainer: {
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  matrixHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  matrixTitle: {
    fontSize: '1.05rem',
    color: '#fff',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    marginBottom: '2px',
  },
  matrixSubtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    width: '260px',
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '8px 10px 8px 30px',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.78rem',
    outline: 'none',
  },
  clearSearch: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  tableScroll: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  tableTh: {
    color: 'var(--text-muted)',
    fontWeight: '700',
    padding: '12px 16px',
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.015)',
    transition: 'background 0.2s ease',
  },
  tableTd: {
    padding: '10px 16px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    fontSize: '0.8rem',
  },
  assetCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  assetLogo: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.58rem',
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  matrixSectorBadge: {
    fontSize: '0.65rem',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  matrixBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
  },
  badgeMatch: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--color-bullish)',
  },
  badgeReject: {
    background: 'rgba(244, 63, 94, 0.1)',
    color: 'var(--color-bearish)',
  },
  badgeUnswiped: {
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-muted)',
  },
  // --- Portfolio Dashboard Styles ---
  portfolioGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    animation: 'fadeIn 0.4s ease-out',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  summaryCard: {
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  summaryLabel: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  summaryValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  percentPnL: {
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  liveIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '2px 6px',
    borderRadius: '8px',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--color-bullish)',
    boxShadow: '0 0 6px var(--color-bullish)',
  },
  liveText: {
    fontSize: '0.52rem',
    color: 'var(--color-bullish)',
    fontWeight: '900',
    letterSpacing: '0.05em',
  },
  chartPanel: {
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  chartTitle: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  chartContainer: {
    width: '100%',
  },
  holdingsPanel: {
    padding: '18px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  panelTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    marginBottom: '12px',
  },
  tradeBtn: {
    padding: '4px 10px',
    background: 'rgba(139, 92, 246, 0.12)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    borderRadius: '6px',
    color: 'var(--color-purple)',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tradePanelTd: {
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.15)',
  },
  tradePanelBox: {
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.01)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tradeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  tradeToggle: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '2px',
  },
  tradeTypeBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tradeInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tradeInput: {
    width: '80px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  executeTradeBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    color: '#fff',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
  }
};
