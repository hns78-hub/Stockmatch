import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle, RefreshCw, Sparkles, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function StockCard({ stock, isTop, cardConfig = {} }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardTap = (e) => {
    if (e.target.closest('.no-flip')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const renderConsensus = (type) => {
    if (type === 'up') {
      return (
        <div style={{ ...styles.vitalBadge, color: 'var(--color-bullish)', background: 'rgba(16, 185, 129, 0.12)' }}>
          <ThumbsUp size={14} style={{ marginRight: '4px' }} />
          <span>Bullish Vibe</span>
        </div>
      );
    } else {
      return (
        <div style={{ ...styles.vitalBadge, color: 'var(--color-bearish)', background: 'rgba(244, 63, 94, 0.12)' }}>
          <ThumbsDown size={14} style={{ marginRight: '4px' }} />
          <span>Bearish Vibe</span>
        </div>
      );
    }
  };

  const formatPercent = (val) => {
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val}%`;
  };

  const getPercentColor = (val) => {
    return val >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)';
  };

  // Determine if we have performance stats to show
  const hasPerfStats = cardConfig.showChangeQ || cardConfig.showChangeY || cardConfig.showChange5Y;
  // Determine if we have any vitals to show
  const hasVitals = cardConfig.showRevenue || cardConfig.showMargin || cardConfig.showConsensus;

  return (
    <div style={styles.cardContainer} className="card-perspective">
      <div 
        style={styles.cardInner} 
        className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}
        onClick={handleCardTap}
      >
        {/* FRONT SIDE */}
        <div style={styles.cardFront} className="card-front glass-panel">
          {/* Card Header */}
          <div style={styles.cardHeader}>
            <div style={styles.logoRow}>
              <div style={{ ...styles.logo, background: stock.logoBg }}>
                {stock.ticker.substring(0, 2)}
              </div>
              <div style={styles.companyMeta}>
                <h2 style={styles.companyName}>{stock.name}</h2>
                <div style={styles.tickerRow}>
                  <span style={styles.ticker}>{stock.ticker}</span>
                  <span style={styles.sectorBadge}>{stock.sector}</span>
                </div>
              </div>
              {cardConfig.showPrice !== false && (
                <div style={styles.priceContainer}>
                  <span style={styles.priceLabel}>SHARE PRICE</span>
                  <span style={styles.priceValue}>${stock.lastPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vibe Check (Bio) */}
          <div style={styles.section}>
            <div style={styles.sectionTitleRow}>
              <span style={styles.sectionTitle}>THE VIBE CHECK</span>
              <Sparkles size={14} color="var(--color-purple)" />
            </div>
            <p style={styles.vibeText}>{stock.vibeCheck}</p>
          </div>

          {/* Performance Percent Changes (Q/Y/5Y) */}
          {hasPerfStats !== false && (
            <div style={styles.section}>
              <span style={styles.sectionTitle}>HISTORICAL PERFORMANCE</span>
              <div style={styles.perfGrid}>
                {cardConfig.showChangeQ !== false && (
                  <div style={styles.perfItem}>
                    <span style={styles.perfLabel}>Last Quarter</span>
                    <span style={{ ...styles.perfValue, color: getPercentColor(stock.changeQuarter) }}>
                      {formatPercent(stock.changeQuarter)}
                    </span>
                  </div>
                )}
                {cardConfig.showChangeY !== false && (
                  <div style={styles.perfItem}>
                    <span style={styles.perfLabel}>Last Year</span>
                    <span style={{ ...styles.perfValue, color: getPercentColor(stock.changeYear) }}>
                      {formatPercent(stock.changeYear)}
                    </span>
                  </div>
                )}
                {cardConfig.showChange5Y !== false && (
                  <div style={styles.perfItem}>
                    <span style={styles.perfLabel}>Last 5 Years</span>
                    <span style={{ ...styles.perfValue, color: getPercentColor(stock.change5Years) }}>
                      {formatPercent(stock.change5Years)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vitals (Stats) */}
          {hasVitals !== false && (
            <div style={styles.section}>
              <span style={styles.sectionTitle}>THE VITALS (LATEST Q)</span>
              <div style={styles.vitalsGrid}>
                {cardConfig.showRevenue !== false && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalLabel}>Revenue Growth?</span>
                    <span style={{ 
                      ...styles.vitalValue, 
                      color: stock.vitals.revenueGrowthYes ? 'var(--color-bullish)' : 'var(--color-bearish)' 
                    }}>
                      {stock.vitals.revenueGrowthYes ? 'Yes' : 'No'} ({stock.vitals.revenueGrowth})
                    </span>
                  </div>
                )}

                {cardConfig.showMargin !== false && (
                  <div style={styles.vitalCard}>
                    <span style={styles.vitalLabel}>Keeping what they make?</span>
                    <span style={{ 
                      ...styles.vitalValue, 
                      color: stock.vitals.profitMarginYes ? 'var(--color-bullish)' : 'var(--color-bearish)' 
                    }}>
                      {stock.vitals.profitMarginYes ? 'Yes' : 'No'} ({stock.vitals.profitMargin} Margin)
                    </span>
                  </div>
                )}

                {cardConfig.showConsensus !== false && (
                  <div style={{ ...styles.vitalCard, gridColumn: cardConfig.showRevenue !== false && cardConfig.showMargin !== false ? 'span 2' : 'span 1' }}>
                    <div style={styles.consensusRow}>
                      <span style={styles.vitalLabel}>Analyst Vibe:</span>
                      {renderConsensus(stock.vitals.analystConsensus)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gossip (Highlight) */}
          {cardConfig.showGossip !== false && (
            <div style={styles.section}>
              <div style={styles.sectionTitleRow}>
                <span style={styles.sectionTitle}>THE GOSSIP</span>
                <HelpCircle size={14} color="var(--color-gold)" className="tooltip no-flip" data-tooltip="Key takeaway from the earnings call" />
              </div>
              <div style={styles.gossipCard}>
                <p style={styles.gossipText}>"{stock.gossip}"</p>
              </div>
            </div>
          )}

          {/* Card Footer Indicator */}
          <div style={styles.cardFooter}>
            <RefreshCw size={12} style={styles.flipIcon} />
            <span>Tap Card to Reveal Secret Stats</span>
          </div>
        </div>

        {/* BACK SIDE */}
        <div style={styles.cardBack} className="card-back glass-panel">
          <div style={styles.cardHeader}>
            <div style={styles.logoRow}>
              <div style={{ ...styles.logo, background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))' }}>
                ?
              </div>
              <div style={styles.companyMeta}>
                <h2 style={styles.companyName}>{stock.name} Vitals</h2>
                <div style={styles.tickerRow}>
                  <span style={styles.ticker}>{stock.ticker}</span>
                  <span style={{ ...styles.sectorBadge, background: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-purple)' }}>Financial Flashcard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core financial ratios list with risk/safety color coding */}
          <div style={styles.ratiosContainer}>
            {/* 1. P/E Ratio */}
            {(() => {
              const val = stock.peRatio;
              const isSafe = val >= 5 && val <= 25;
              return (
                <div style={styles.ratioItem}>
                  <div style={styles.ratioHeader}>
                    <span style={styles.ratioName}>1. P/E Ratio (Price-to-Earnings)</span>
                    <span style={{ ...styles.ratioVal, color: isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                      {val} ({isSafe ? 'Safety' : 'Risky'})
                    </span>
                  </div>
                  <p style={styles.ratioDesc}>
                    Price you pay per $1 of profit. High = expensive/growth bet; Low = cheap/value or business trouble.
                  </p>
                </div>
              );
            })()}

            {/* 2. EPS */}
            {(() => {
              const val = stock.eps;
              const isSafe = val > 0;
              return (
                <div style={styles.ratioItem}>
                  <div style={styles.ratioHeader}>
                    <span style={styles.ratioName}>2. EPS (Earnings Per Share)</span>
                    <span style={{ ...styles.ratioVal, color: isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                      ${val} ({isSafe ? 'Safety' : 'Risky'})
                    </span>
                  </div>
                  <p style={styles.ratioDesc}>
                    Company's profit per share. Higher & rising is good. This is the foundation for P/E calculation.
                  </p>
                </div>
              );
            })()}

            {/* 3. Market Cap */}
            {(() => {
              const val = stock.marketCap;
              const isSafe = val.endsWith('T') || parseInt(val) >= 150;
              return (
                <div style={styles.ratioItem}>
                  <div style={styles.ratioHeader}>
                    <span style={styles.ratioName}>3. Market Capitalization</span>
                    <span style={{ ...styles.ratioVal, color: isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                      ${val} ({isSafe ? 'Safety' : 'Risky'})
                    </span>
                  </div>
                  <p style={styles.ratioDesc}>
                    Total company value (Price × Shares). Large-cap = stable, safer; Small-cap = risky, higher growth.
                  </p>
                </div>
              );
            })()}

            {/* 4. Dividend Yield */}
            {(() => {
              const val = stock.divYield;
              const isSafe = val >= 1.5;
              return (
                <div style={styles.ratioItem}>
                  <div style={styles.ratioHeader}>
                    <span style={styles.ratioName}>4. Dividend Yield</span>
                    <span style={{ ...styles.ratioVal, color: isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                      {val}% ({isSafe ? 'Safety' : 'Risky'})
                    </span>
                  </div>
                  <p style={styles.ratioDesc}>
                    Annual dividend ÷ share price. Higher = more regular income; common in mature, stable companies.
                  </p>
                </div>
              );
            })()}

            {/* 5. ROE */}
            {(() => {
              const val = stock.roe;
              const isSafe = val >= 15.0;
              return (
                <div style={styles.ratioItem}>
                  <div style={styles.ratioHeader}>
                    <span style={styles.ratioName}>5. ROE (Return on Equity)</span>
                    <span style={{ ...styles.ratioVal, color: isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                      {val}% ({isSafe ? 'Safety' : 'Risky'})
                    </span>
                  </div>
                  <p style={styles.ratioDesc}>
                    Profit generated from shareholders' money. Higher = efficient management. 15%+ considered good.
                  </p>
                </div>
              );
            })()}

            {/* 6. Debt-to-Equity */}
            {(() => {
              const val = stock.debtToEquity;
              const isSafe = val <= 0.8;
              return (
                <div style={styles.ratioItem}>
                  <div style={styles.ratioHeader}>
                    <span style={styles.ratioName}>6. Debt-to-Equity Ratio</span>
                    <span style={{ ...styles.ratioVal, color: isSafe ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                      {val} ({isSafe ? 'Safety' : 'Risky'})
                    </span>
                  </div>
                  <p style={styles.ratioDesc}>
                    Company's debt vs. own funds. Low = financially safer; High = riskier, interest burden.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Card Footer Indicator */}
          <div style={styles.cardFooter}>
            <RefreshCw size={12} style={styles.flipIcon} />
            <span>Tap Card to Return to Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cardContainer: {
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    userSelect: 'none',
  },
  cardInner: {
    width: '100%',
    height: '100%',
  },
  cardFront: {
    padding: '20px 24px 16px 24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-premium)',
    borderRadius: '24px',
    border: '1px solid var(--bg-card-border)',
  },
  cardBack: {
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(22, 26, 37, 0.95), rgba(15, 23, 42, 0.95))',
    boxShadow: 'var(--shadow-premium)',
    borderRadius: '24px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  cardHeader: {
    marginBottom: '10px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    width: '100%',
  },
  logo: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.95rem',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
  },
  companyMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    flex: 1,
    overflow: 'hidden',
  },
  companyName: {
    fontSize: '1.05rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  ticker: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-display)',
  },
  sectorBadge: {
    fontSize: '0.62rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    padding: '1px 6px',
    borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priceLabel: {
    fontSize: '0.58rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  priceValue: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  section: {
    marginBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '0.6rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
  },
  vibeText: {
    fontSize: '0.85rem',
    lineHeight: '1.4',
    color: '#e2e8f0',
  },
  perfGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '8px',
  },
  perfItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  perfLabel: {
    fontSize: '0.58rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  perfValue: {
    fontSize: '0.82rem',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  vitalCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '8px 10px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  vitalLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-secondary)',
  },
  vitalValue: {
    fontSize: '0.8rem',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  consensusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  vitalBadge: {
    padding: '2px 6px',
    borderRadius: '30px',
    fontSize: '0.68rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
  },
  gossipCard: {
    background: 'rgba(245, 158, 11, 0.04)',
    border: '1px solid rgba(245, 158, 11, 0.08)',
    padding: '10px 12px',
    borderRadius: '12px',
  },
  gossipText: {
    fontSize: '0.78rem',
    lineHeight: '1.4',
    color: '#ffedd5',
    fontStyle: 'italic',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '8px',
    marginTop: '2px',
  },
  flipIcon: {
    animation: 'spin 4s linear infinite',
  },
  ratiosContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
    margin: '4px 0',
    paddingRight: '4px',
  },
  ratioItem: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  ratioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratioName: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#fff',
  },
  ratioVal: {
    fontSize: '0.72rem',
    fontWeight: '800',
  },
  ratioDesc: {
    fontSize: '0.62rem',
    lineHeight: '1.35',
    color: 'var(--text-secondary)',
  }
};
