import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, Sparkles, Wallet, Trash2, ShieldAlert, Swords, Star, FileText, ArrowLeft, BarChart2, Check } from 'lucide-react';

export default function FundPortfolioModal({ matches, onUnmatch, onClose, onDeployPortfolio, portfolio }) {
  const [fundingAmount, setFundingAmount] = useState(1000);
  const [tradingState, setTradingState] = useState('input'); // 'input' | 'confirm' | 'pending' | 'success'
  const [showComparison, setShowComparison] = useState(false); // Toggle comparison dashboard manually
  const [comparisonStage, setComparisonStage] = useState('select'); // 'select' | 'compare'
  
  // Pre-select first 3 stocks if available to make onboarding easier
  const [selectedPruneIds, setSelectedPruneIds] = useState(
    matches.slice(0, 3).map(s => s.id)
  );

  const mockSharePrices = {
    'NVDA': 130, 'AAPL': 220, 'TSLA': 250, 'AMZN': 195, 'NFLX': 680,
    'MSFT': 450, 'COST': 840, 'PEP': 165, 'AMD': 170, 'LULU': 310,
    'META': 500, 'SBUX': 75, 'MRNA': 85, 'GOOGL': 180, 'MDLZ': 70
  };

  const getMockPrice = (ticker) => mockSharePrices[ticker] || 100;

  const totalStocks = matches.length;
  
  // Categorize matches into existing portfolio positions vs new matches
  const portfolioTickers = portfolio?.holdings?.map(h => h.ticker) || [];
  const existingMatches = matches.filter(s => portfolioTickers.includes(s.ticker));
  const newMatches = matches.filter(s => !portfolioTickers.includes(s.ticker));

  // Determine funding allocation distribution
  const targetNewCount = newMatches.length > 0 ? newMatches.length : matches.length;
  const allocationPerNewStock = targetNewCount > 0 ? (fundingAmount / targetNewCount) : 0;
  const percentPerNewStock = targetNewCount > 0 ? Math.round((100 / targetNewCount) * 10) / 10 : 0;

  // Toggle selection checkbox
  const handleToggleSelectStock = (id) => {
    setSelectedPruneIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Get compared stocks list
  const comparedStocks = matches.filter(s => selectedPruneIds.includes(s.id));

  // --- Compute Order Tickets ---
  const generateOrderTickets = () => {
    const stocksToFund = newMatches.length > 0 ? newMatches : matches;
    const allocation = fundingAmount / stocksToFund.length;
    
    let totalExecutedCost = 0;
    const tickets = stocksToFund.map(stock => {
      const price = getMockPrice(stock.ticker);
      const shares = Math.floor(allocation / price);
      const executionCost = shares * price;
      totalExecutedCost += executionCost;
      
      return {
        id: stock.id,
        ticker: stock.ticker,
        name: stock.name,
        logoBg: stock.logoBg,
        price,
        shares,
        executionCost
      };
    });
    
    const leftoverCash = fundingAmount - totalExecutedCost;
    
    return {
      tickets,
      totalExecutedCost,
      leftoverCash
    };
  };

  const { tickets, totalExecutedCost, leftoverCash } = generateOrderTickets();

  const handleGoToConfirmation = () => {
    setTradingState('confirm');
  };

  const handleDeployFunds = () => {
    setTradingState('pending');
    setTimeout(() => {
      setTradingState('success');
    }, 2800);
  };

  const handleCloseSuccess = () => {
    onDeployPortfolio(fundingAmount, matches);
    onClose();
  };

  const handlePruneStockFromComparison = (id) => {
    onUnmatch(id);
    setSelectedPruneIds(prev => prev.filter(item => item !== id));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Define comparison grid rows
  const comparisonRows = [
    { label: 'Share Price', getValue: (s) => `$${s.lastPrice}` },
    { label: 'Market Cap', getValue: (s) => `$${s.marketCap}` },
    { label: 'P/E Ratio', getValue: (s) => s.peRatio, checkSafety: (s) => s.peRatio >= 5 && s.peRatio <= 25 },
    { label: 'EPS', getValue: (s) => `$${s.eps}`, checkSafety: (s) => s.eps > 0 },
    { label: 'Div Yield', getValue: (s) => `${s.divYield}%`, checkSafety: (s) => s.divYield >= 1.5 },
    { label: 'ROE', getValue: (s) => `${s.roe}%`, checkSafety: (s) => s.roe >= 15.0 },
    { label: 'Debt-to-Equity', getValue: (s) => s.debtToEquity, checkSafety: (s) => s.debtToEquity <= 0.8 },
    { label: 'Quarter Change', getValue: (s) => `${s.changeQuarter >= 0 ? '+' : ''}${s.changeQuarter}%`, checkSafety: (s) => s.changeQuarter >= 0 },
    { label: '1Y Change', getValue: (s) => `${s.changeYear >= 0 ? '+' : ''}${s.changeYear}%`, checkSafety: (s) => s.changeYear >= 0 },
    { label: '5Y Change', getValue: (s) => `${s.change5Years >= 0 ? '+' : ''}${s.change5Years}%`, checkSafety: (s) => s.change5Years >= 0 },
  ];

  return (
    <div style={styles.overlay}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.backdrop}
        onClick={tradingState === 'input' ? onClose : undefined}
      />

      <AnimatePresence mode="wait">
        {/* CASE 1: MULTI-SELECT PRUNING & SIDE-BY-SIDE MATRIX */}
        {tradingState === 'input' && showComparison && (
          <motion.div 
            key="comparison-window"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{ ...styles.modalCard, maxWidth: comparisonStage === 'compare' ? '920px' : '580px' }}
            className="glass-panel"
          >
            <div style={styles.modalHeader}>
              <div style={styles.headerTitleRow}>
                <Swords size={20} color="var(--color-purple)" />
                <h3 style={styles.title}>
                  {comparisonStage === 'compare' ? 'Side-by-Side Financial Analyzer' : 'Select Stocks to Compare'}
                </h3>
              </div>
              <button onClick={() => setShowComparison(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* STAGE A: SELECTION CHECKLIST */}
            {comparisonStage === 'select' && (
              <div style={styles.pruneSelectionContent}>
                <div style={styles.limitWarningBox}>
                  <Info size={24} color="var(--color-purple)" style={{ flexShrink: 0 }} />
                  <p style={styles.limitWarningText}>
                    Select multiple companies from your matches below. We will render a comprehensive financial comparison table to help you prune your watchlist.
                  </p>
                </div>

                <span style={styles.sectionTitle}>YOUR MATCHED COMPANIES ({totalStocks})</span>
                
                <div style={styles.selectionGrid}>
                  {matches.map(stock => {
                    const isSelected = selectedPruneIds.includes(stock.id);
                    const isFunded = portfolioTickers.includes(stock.ticker);
                    return (
                      <div 
                        key={stock.id} 
                        onClick={() => handleToggleSelectStock(stock.id)}
                        style={{
                          ...styles.selectorCard,
                          background: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.01)',
                          borderColor: isSelected ? 'var(--color-purple)' : 'rgba(255,255,255,0.05)'
                        }}
                        className="btn-hover-grow glass-panel"
                      >
                        <div style={styles.selectorCheckRow}>
                          <div style={{
                            ...styles.selectorCheckbox,
                            background: isSelected ? 'var(--color-purple)' : 'transparent',
                            borderColor: isSelected ? 'var(--color-purple)' : 'rgba(255,255,255,0.2)'
                          }}>
                            {isSelected && <Check size={10} color="#fff" />}
                          </div>
                          {isFunded && (
                            <span style={styles.fundedMiniBadge}>Funded</span>
                          )}
                        </div>
                        <span style={styles.selectorTicker}>{stock.ticker}</span>
                        <span style={styles.selectorName}>{stock.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.bottomActionsRow}>
                  <button 
                    onClick={() => setShowComparison(false)}
                    style={styles.backBtn}
                    className="btn-hover-grow"
                  >
                    Back to funding
                  </button>
                  <button 
                    onClick={() => setComparisonStage('compare')}
                    disabled={comparedStocks.length < 2}
                    style={{
                      ...styles.confirmExecuteBtn,
                      opacity: comparedStocks.length < 2 ? 0.5 : 1,
                      cursor: comparedStocks.length < 2 ? 'not-allowed' : 'pointer'
                    }}
                    className="btn-hover-grow glow-purple"
                  >
                    <BarChart2 size={14} />
                    Compare {comparedStocks.length} Stocks
                  </button>
                </div>
              </div>
            )}

            {/* STAGE B: DETAILED COMPARISON TABLE */}
            {comparisonStage === 'compare' && (
              <div style={styles.comparisonTableContent}>
                <div style={styles.tableHeaderRow}>
                  <button 
                    onClick={() => setComparisonStage('select')}
                    style={styles.backLink}
                    className="btn-hover-grow"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to selection</span>
                  </button>
                  <span style={styles.faceoffRemainingBadge}>{comparedStocks.length} Stocks Compared</span>
                </div>

                {/* Outer scroll wrapper for wide tables */}
                <div style={styles.matrixWrapper}>
                  <table style={styles.comparisonMatrixTable}>
                    <thead>
                      <tr>
                        <th style={styles.matrixTh}>Financial Parameter</th>
                        {comparedStocks.map(stock => (
                          <th key={stock.id} style={styles.matrixThCenter}>
                            <div style={styles.matrixHeaderBox}>
                              <div style={{ ...styles.rowLogo, background: stock.logoBg, width: '24px', height: '24px', fontSize: '0.65rem' }}>
                                {stock.ticker.substring(0, 2)}
                              </div>
                              <div style={{ textAlign: 'left' }}>
                                <strong style={{ color: '#fff', fontSize: '0.8rem' }}>{stock.ticker}</strong>
                                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{stock.sector}</div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, idx) => (
                        <tr key={idx} style={styles.matrixRow}>
                          <td style={styles.matrixTdLabel}>
                            <div style={styles.rowExplanationBox}>
                              <strong style={{ color: '#fff', fontSize: '0.78rem' }}>{row.label}</strong>
                            </div>
                          </td>
                          {comparedStocks.map(stock => {
                            const value = row.getValue(stock);
                            const isSafe = row.checkSafety ? row.checkSafety(stock) : null;
                            
                            return (
                              <td key={stock.id} style={styles.matrixTdValue}>
                                <span style={{
                                  fontWeight: 'bold',
                                  fontSize: '0.82rem',
                                  color: isSafe === null ? '#fff' : isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)'
                                }}>
                                  {value}
                                </span>
                                {isSafe !== null && (
                                  <span style={{
                                    display: 'block',
                                    fontSize: '0.58rem',
                                    marginTop: '1px',
                                    color: isSafe ? 'rgba(16,185,129,0.7)' : 'rgba(244,63,94,0.7)',
                                    fontWeight: '600'
                                  }}>
                                    {isSafe ? 'Safety Indicator' : 'Risk Indicator'}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      
                      {/* Action trigger row */}
                      <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <td style={styles.matrixTdLabel}>
                          <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Actions</strong>
                        </td>
                        {comparedStocks.map(stock => {
                          const isFunded = portfolioTickers.includes(stock.ticker);
                          return (
                            <td key={stock.id} style={styles.matrixTdValue}>
                              <div style={styles.matrixActionColumn}>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  color: isFunded ? 'var(--color-gold)' : 'var(--text-muted)',
                                  fontWeight: 'bold'
                                }}>
                                  {isFunded ? 'Portfolio position active' : 'Watchlist match only'}
                                </span>
                                <button
                                  onClick={() => handlePruneStockFromComparison(stock.id)}
                                  style={styles.pruneActionBtn}
                                  className="btn-hover-grow"
                                  title="Sell and unmatch"
                                >
                                  <Trash2 size={11} />
                                  <span>{isFunded ? 'Sell & Prune' : 'Drop Match'}</span>
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={styles.bottomActionsRow} style={{ marginTop: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowComparison(false)}
                    style={{ ...styles.confirmExecuteBtn, maxWidth: '200px' }}
                    className="btn-hover-grow glow-purple"
                  >
                    Close & Return to Funding
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* CASE 2: NORMAL FUNDING FORM */}
        {tradingState === 'input' && !showComparison && (
          <motion.div 
            key="fund-form"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={styles.modalCard}
            className="glass-panel"
          >
            <div style={styles.modalHeader}>
              <div style={styles.headerTitleRow}>
                <Wallet size={20} color="var(--color-purple)" />
                <h3 style={styles.title}>Simulate Investment</h3>
              </div>
              <button onClick={onClose} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Top comparison trigger button */}
            <div style={styles.topActionsRow}>
              <button 
                onClick={() => {
                  setShowComparison(true);
                  setComparisonStage('select');
                }}
                style={styles.toggleComparisonBtn}
                className="btn-hover-grow glow-purple"
              >
                <Swords size={13} color="var(--color-purple)" />
                <span>Compare & Prune Portfolio</span>
              </button>
            </div>

            <p style={styles.description}>
              Adjust your budget. Cash is distributed equally to buy **whole shares only**. Fractional shares are disabled.
            </p>

            <div style={styles.sliderContainer}>
              <div style={styles.sliderHeader}>
                <span style={styles.sliderLabel}>Investment Budget</span>
                <span style={styles.sliderValue}>{formatCurrency(fundingAmount)}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="10000" 
                step="100"
                value={fundingAmount} 
                onChange={(e) => setFundingAmount(Number(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderTicks}>
                <span>$100</span>
                <span>$5,000</span>
                <span>$10,000</span>
              </div>
            </div>

            <div style={styles.allocationBox}>
              <span style={styles.sectionTitle}>PORTFOLIO SPLIT BREAKDOWN</span>
              <div style={styles.stockScrollList}>
                {/* Existing holdings already funded */}
                {existingMatches.length > 0 && (
                  <>
                    <div style={styles.categoryDivider}>
                      <span>ACTIVE HOLDINGS IN PORTFOLIO ({existingMatches.length})</span>
                    </div>
                    {existingMatches.map((stock) => {
                      const holding = portfolio.holdings.find(h => h.id === stock.id);
                      const currentValue = holding ? (holding.sharesOwned * holding.currentPrice) : 0;
                      return (
                        <div key={stock.id} style={{ ...styles.allocationRow, opacity: 0.75 }}>
                          <div style={styles.rowLeft}>
                            <div style={{ ...styles.rowLogo, background: stock.logoBg }}>
                              {stock.ticker.substring(0, 2)}
                            </div>
                            <div style={styles.rowMeta}>
                              <span style={styles.rowName}>{stock.name}</span>
                              <span style={styles.rowSub}>Current holding: {holding?.sharesOwned} shares</span>
                            </div>
                          </div>
                          <div style={styles.rowRight}>
                            <span style={styles.rowCash}>{formatCurrency(currentValue)}</span>
                            <span style={styles.rowShares}>Total invested: {formatCurrency(holding?.investedAmount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* New matches to add */}
                {newMatches.length > 0 && (
                  <>
                    <div style={{ ...styles.categoryDivider, marginTop: '10px' }}>
                      <span>NEW WATCHLIST MATCHES TO ADD ({newMatches.length})</span>
                    </div>
                    {newMatches.map((stock) => {
                      const sharePrice = getMockPrice(stock.ticker);
                      const allocatedCash = allocationPerNewStock;
                      const sharesOwned = Math.floor(allocatedCash / sharePrice);
                      const actualSpent = sharesOwned * sharePrice;

                      return (
                        <div key={stock.id} style={styles.allocationRow}>
                          <div style={styles.rowLeft}>
                            <div style={{ ...styles.rowLogo, background: stock.logoBg }}>
                              {stock.ticker.substring(0, 2)}
                            </div>
                            <div style={styles.rowMeta}>
                              <span style={styles.rowName}>{stock.name}</span>
                              <span style={styles.rowSub}>{stock.ticker} • {formatCurrency(sharePrice)} / share</span>
                            </div>
                          </div>
                          <div style={styles.rowRight}>
                            <span style={styles.rowCash}>{formatCurrency(actualSpent)}</span>
                            <span style={styles.rowShares}>{sharesOwned} shares ({percentPerNewStock}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <div style={styles.alertNote}>
              <Info size={14} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={styles.alertText}>
                {newMatches.length > 0 
                  ? `Funding will buy whole shares of ${newMatches.length} new stocks. Any leftover budget cents will be refunded to your cash balance.`
                  : `Funding will top-up existing portfolio holdings with whole shares.`}
              </p>
            </div>

            <button 
              onClick={handleGoToConfirmation}
              style={styles.submitButton}
              className="btn-hover-grow glow-purple"
            >
              <FileText size={16} />
              Review Buy Orders
            </button>
          </motion.div>
        )}

        {/* CASE 2.5: BUY ORDERS CONFIRMATION SCREEN */}
        {tradingState === 'confirm' && (
          <motion.div 
            key="confirm-orders"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={styles.modalCard}
            className="glass-panel"
          >
            <div style={styles.modalHeader}>
              <div style={styles.headerTitleRow}>
                <FileText size={20} color="var(--color-purple)" />
                <h3 style={styles.title}>Confirm Buy Orders</h3>
              </div>
              <button onClick={() => setTradingState('input')} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <p style={styles.description}>
              Review your simulated buy tickets below. Stocks are purchased in **whole quantities only**.
            </p>

            <div style={styles.allocationBox}>
              <span style={styles.sectionTitle}>BUY ORDER TICKETS</span>
              <div style={{ ...styles.stockScrollList, maxHeight: '220px' }}>
                {tickets.map(ticket => (
                  <div key={ticket.id} style={styles.ticketCard} className="glass-panel">
                    <div style={styles.ticketLeft}>
                      <div style={{ ...styles.rowLogo, background: ticket.logoBg, width: '24px', height: '24px', fontSize: '0.62rem' }}>
                        {ticket.ticker.substring(0, 2)}
                      </div>
                      <div style={styles.ticketMeta}>
                        <strong style={{ color: '#fff', fontSize: '0.78rem' }}>{ticket.ticker}</strong>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>BUY MARKET</span>
                      </div>
                    </div>
                    <div style={styles.ticketQtyRow}>
                      <span style={styles.ticketQtyLabel}>Qty:</span>
                      <strong style={styles.ticketQty}>{ticket.shares}</strong>
                    </div>
                    <div style={styles.ticketCostRow}>
                      <span style={styles.ticketPrice}>@ {formatCurrency(ticket.price)}</span>
                      <strong style={styles.ticketCost}>{formatCurrency(ticket.executionCost)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leftover Summary Cash Receipt */}
            <div style={styles.receiptContainer}>
              <div style={styles.receiptRow}>
                <span>Proposed Capital:</span>
                <strong>{formatCurrency(fundingAmount)}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Order Execution Cost:</span>
                <strong style={{ color: '#fff' }}>{formatCurrency(totalExecutedCost)}</strong>
              </div>
              <div style={{ ...styles.receiptRow, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>Leftover Refund Cash:</span>
                <strong style={{ color: 'var(--color-gold)' }}>{formatCurrency(leftoverCash)}</strong>
              </div>
            </div>

            <div style={styles.confirmButtonsRow}>
              <button 
                onClick={() => setTradingState('input')}
                style={styles.backBtn}
                className="btn-hover-grow"
              >
                Back / Edit
              </button>
              <button 
                onClick={handleDeployFunds}
                style={styles.confirmExecuteBtn}
                className="btn-hover-grow glow-purple"
              >
                <Sparkles size={14} />
                Execute orders
              </button>
            </div>
          </motion.div>
        )}

        {/* CASE 3: LOADING/PENDING */}
        {tradingState === 'pending' && (
          <motion.div 
            key="loading-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{ ...styles.modalCard, padding: '50px 30px' }}
            className="glass-panel"
          >
            <div style={styles.loadingWrapper}>
              <div style={styles.spinner} />
              <h3 style={styles.loadingTitle}>Simulating Execution</h3>
              <p style={styles.loadingSubtitle}>Routing integer share buy orders to sandbox broker...</p>
              
              <div style={styles.checklist}>
                <div style={styles.checkItem}>
                  <div style={styles.activeDot} />
                  <span>Submitting market order tickets...</span>
                </div>
                <div style={{ ...styles.checkItem, opacity: 0.5 }}>
                  <div style={styles.pendingDot} />
                  <span>Acquiring whole shares & verifying assets...</span>
                </div>
                <div style={{ ...styles.checkItem, opacity: 0.5 }}>
                  <div style={styles.pendingDot} />
                  <span>Refunding leftover cash remainder...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CASE 4: SUCCESS CERTIFICATE */}
        {tradingState === 'success' && (
          <motion.div 
            key="success-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{ ...styles.modalCard, border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: 'var(--shadow-glow-green)' }}
            className="glass-panel"
          >
            <div style={styles.successWrapper}>
              <div style={styles.successIconBadge} className="glow-green">
                <CheckCircle size={48} color="var(--color-bullish)" />
              </div>

              <h2 style={styles.successTitle}>Orders Executed!</h2>
              <p style={styles.successSubtitle}>
                Simulated execution succeeded! You purchased whole shares, and leftover cash was returned to your balance.
              </p>

              <div style={styles.statsCertificate}>
                <div style={styles.certRow}>
                  <span>Total Capital Allocated:</span>
                  <strong>{formatCurrency(fundingAmount)}</strong>
                </div>
                <div style={styles.certRow}>
                  <span>Spent on Shares:</span>
                  <strong style={{ color: 'var(--color-bullish)' }}>{formatCurrency(totalExecutedCost)}</strong>
                </div>
                <div style={styles.certRow}>
                  <span>Leftover Cash Refunded:</span>
                  <strong style={{ color: 'var(--color-gold)' }}>{formatCurrency(leftoverCash)}</strong>
                </div>
                <div style={styles.certRow}>
                  <span>Execution Status:</span>
                  <span style={{ color: 'var(--color-bullish)', fontWeight: 'bold' }}>Completed (100% Mock)</span>
                </div>
              </div>

              <button 
                onClick={handleCloseSuccess}
                style={{ ...styles.submitButton, background: 'linear-gradient(135deg, var(--color-bullish), #059669)' }}
                className="btn-hover-grow glow-green"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(5, 5, 8, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  modalCard: {
    maxWidth: '480px',
    width: '100%',
    padding: '24px 20px',
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '24px',
    background: 'var(--bg-card)',
    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '1.2rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: '2px',
  },
  toggleComparisonBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#fff',
    padding: '4px 10px',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    transition: 'all 0.2s ease',
  },
  description: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  limitWarningBox: {
    display: 'flex',
    gap: '12px',
    background: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    borderRadius: '16px',
    padding: '10px 12px',
    alignItems: 'center',
  },
  limitWarningText: {
    fontSize: '0.75rem',
    color: '#d8b4fe',
    lineHeight: '1.4',
  },
  faceoffRemainingBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  sliderContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: '12px 16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    color: 'var(--color-purple)',
  },
  slider: {
    width: '100%',
    margin: '4px 0',
  },
  sliderTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  allocationBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTitle: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
  },
  categoryDivider: {
    padding: '4px 2px',
    fontSize: '0.62rem',
    fontWeight: '900',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    width: '100%',
  },
  stockScrollList: {
    maxHeight: '160px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: 'rgba(0,0,0,0.15)',
    padding: '8px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  allocationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  rowLogo: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  rowMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  rowName: {
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: '600',
  },
  rowSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  rowRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
  },
  rowCash: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#fff',
  },
  rowShares: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  alertNote: {
    background: 'rgba(245, 158, 11, 0.04)',
    border: '1px solid rgba(245, 158, 11, 0.1)',
    borderRadius: '12px',
    padding: '8px 12px',
    display: 'flex',
    gap: '8px',
  },
  alertText: {
    fontSize: '0.72rem',
    color: '#ffedd5',
    lineHeight: '1.4',
  },
  submitButton: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 6px 20px -5px rgba(139, 92, 246, 0.5)',
  },
  ticketCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  ticketLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 2,
  },
  ticketMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  ticketQtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  ticketQtyLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  ticketQty: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: 'bold',
  },
  ticketCostRow: {
    textAlign: 'right',
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
  },
  ticketPrice: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
  },
  ticketCost: {
    fontSize: '0.82rem',
    color: 'var(--color-purple)',
    fontWeight: 'bold',
  },
  receiptContainer: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  confirmButtonsRow: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginTop: '6px',
  },
  backBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  },
  confirmExecuteBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '10px 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(139, 92, 246, 0.1)',
    borderTop: '4px solid var(--color-purple)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingTitle: {
    fontSize: '1.15rem',
    color: '#fff',
    marginBottom: '6px',
  },
  loadingSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  checklist: {
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'rgba(0,0,0,0.1)',
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--color-purple)',
    boxShadow: '0 0 6px var(--color-purple)',
  },
  pendingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
  },
  successWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  successIconBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  successTitle: {
    fontSize: '1.35rem',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  successSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  statsCertificate: {
    width: '100%',
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
    margin: '4px 0 12px 0',
  },
  certRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    paddingBottom: '6px',
  },
  pruneSelectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  selectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '10px',
    maxHeight: '260px',
    overflowY: 'auto',
    padding: '4px',
  },
  selectorCard: {
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    position: 'relative',
    textAlign: 'left',
  },
  selectorCheckRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorCheckbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  fundedMiniBadge: {
    fontSize: '0.58rem',
    fontWeight: '800',
    color: 'var(--color-gold)',
    background: 'rgba(245,158,11,0.1)',
    padding: '1px 5px',
    borderRadius: '4px',
    border: '1px solid rgba(245,158,11,0.2)',
  },
  selectorTicker: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    marginTop: '2px',
  },
  selectorName: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bottomActionsRow: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginTop: '8px',
  },
  comparisonTableContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'var(--color-purple)',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-display)',
  },
  matrixWrapper: {
    width: '100%',
    overflowX: 'auto',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  comparisonMatrixTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  matrixTh: {
    padding: '12px 14px',
    fontSize: '0.72rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap',
  },
  matrixThCenter: {
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    minWidth: '160px',
  },
  matrixHeaderBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  matrixRow: {
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    transition: 'background 0.2s ease',
  },
  matrixTdLabel: {
    padding: '10px 14px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '0.75rem',
  },
  matrixTdValue: {
    padding: '10px 14px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  matrixActionColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  pruneActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(244,63,94,0.05)',
    border: '1px solid rgba(244,63,94,0.2)',
    color: 'var(--color-bearish)',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.68rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
  }
};
