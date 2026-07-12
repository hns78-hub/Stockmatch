import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Heart, X, RotateCcw, AlertCircle, Calendar } from 'lucide-react';
import StockCard from './StockCard';

export default function SwipeWorkspace({ 
  stocks, 
  onSwipeRight, 
  onSwipeLeft, 
  onUndo, 
  canUndo, 
  onFinish, 
  currentIndex,
  selectedMonth,
  setSelectedMonth,
  cardConfig
}) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  const matchOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const activeStock = stocks[currentIndex];

  const handleDragEnd = async (event, info) => {
    const sweepThreshold = 120;
    const velocityThreshold = 500;

    if (info.offset.x > sweepThreshold || info.velocity.x > velocityThreshold) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipeRight(activeStock);
    } else if (info.offset.x < -sweepThreshold || info.velocity.x < -velocityThreshold) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipeLeft(activeStock);
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const triggerButtonSwipe = async (direction) => {
    if (!activeStock) return;
    if (direction === 'right') {
      await controls.start({ x: 500, rotate: 15, opacity: 0, transition: { duration: 0.3 } });
      onSwipeRight(activeStock);
    } else {
      await controls.start({ x: -500, rotate: -15, opacity: 0, transition: { duration: 0.3 } });
      onSwipeLeft(activeStock);
    }
  };

  useEffect(() => {
    x.set(0);
    y.set(0);
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  }, [currentIndex, controls, x, y, selectedMonth]);

  const months = [
    { num: 'ALL', label: 'All Stocks' },
    { num: 1, label: 'January' },
    { num: 2, label: 'February' },
    { num: 3, label: 'March' }
  ];

  const renderStackUnderlay = () => {
    const cards = [];
    for (let i = 1; i <= 2; i++) {
      const targetIndex = currentIndex + i;
      if (targetIndex < stocks.length) {
        const targetStock = stocks[targetIndex];
        const scale = 1 - i * 0.04;
        const translateY = i * 12;
        cards.push(
          <div 
            key={targetStock.id} 
            style={{ 
              ...styles.cardWrapper, 
              zIndex: 10 - i,
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity: 0.8 - i * 0.2,
              pointerEvents: 'none'
            }}
          >
            <StockCard stock={targetStock} isTop={false} cardConfig={cardConfig} />
          </div>
        );
      }
    }
    return cards;
  };

  return (
    <div style={styles.container}>
      {/* Month Review Filter Header */}
      <div style={styles.monthFilterBox}>
        <div style={styles.monthHeaderTitle}>
          <Calendar size={14} color="var(--color-purple)" />
          <span>EARNINGS ANNOUNCEMENT MONTH REVIEW</span>
        </div>
        <div style={styles.monthsRow}>
          {months.map((m) => {
            const isActive = selectedMonth === m.num;
            return (
              <button
                key={m.num}
                onClick={() => setSelectedMonth(m.num)}
                style={{
                  ...styles.monthBtn,
                  background: isActive ? 'var(--color-purple)' : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? 'var(--color-purple)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#fff' : 'var(--text-secondary)'
                }}
                className="btn-hover-grow"
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Counter */}
      <div style={styles.progressRow}>
        <span style={styles.progressText}>
          {stocks.length === 0 
            ? 'No profiles found' 
            : `Profile ${currentIndex + 1} of ${stocks.length} (${selectedMonth === 'ALL' ? 'Initial Run' : 'Monthly Filter'})`}
        </span>
        <div style={styles.progressBarContainer}>
          <div 
            style={{ 
              ...styles.progressBarFill, 
              width: stocks.length > 0 ? `${(currentIndex / stocks.length) * 100}%` : '0%' 
            }} 
          />
        </div>
      </div>

      {/* Card Stack Container */}
      <div style={styles.cardArea}>
        {stocks.length === 0 ? (
          <div style={styles.emptyContainer} className="glass-panel">
            <AlertCircle size={44} color="var(--color-gold)" style={{ marginBottom: '14px' }} />
            <h3 style={styles.emptyTitle}>No earnings this month!</h3>
            <p style={styles.emptySubtitle}>No companies in our Nasdaq database have earnings scheduled in this month.</p>
            <button 
              onClick={() => setSelectedMonth('ALL')}
              style={styles.finishButton}
              className="btn-hover-grow glow-purple"
            >
              Reset to All Stocks
            </button>
          </div>
        ) : currentIndex >= stocks.length ? (
          <div style={styles.emptyContainer} className="glass-panel">
            <AlertCircle size={44} color="var(--color-purple)" style={{ marginBottom: '14px' }} />
            <h3 style={styles.emptyTitle}>Deck Cleared!</h3>
            <p style={styles.emptySubtitle}>You have swiped through all stocks in this filter.</p>
            <button 
              onClick={onFinish}
              style={styles.finishButton}
              className="btn-hover-grow glow-gold"
            >
              View Match List Dashboard
            </button>
          </div>
        ) : (
          <>
            {renderStackUnderlay()}

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              style={{
                ...styles.cardWrapper,
                zIndex: 10,
                x,
                y,
                rotate,
                opacity
              }}
              animate={controls}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing' }}
            >
              <StockCard stock={activeStock} isTop={true} cardConfig={cardConfig} />

              <motion.div style={{ ...styles.swipeBadge, ...styles.likeBadge, opacity: matchOpacity }}>
                VIBE WITH
              </motion.div>

              <motion.div style={{ ...styles.swipeBadge, ...styles.passBadge, opacity: passOpacity }}>
                PASS
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {stocks.length > 0 && currentIndex < stocks.length && (
        <div style={styles.tipRow}>
          <span>Drag Left to Pass • Drag Right to Match • Tap to Flip</span>
        </div>
      )}

      {/* Action Controls Bar */}
      <div style={styles.controlsBar}>
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          style={{ 
            ...styles.circleBtn, 
            ...styles.undoBtn, 
            opacity: canUndo ? 1 : 0.4, 
            cursor: canUndo ? 'pointer' : 'not-allowed'
          }}
          className="btn-hover-grow no-flip"
          title="Retrieve last card"
        >
          <RotateCcw size={18} color={canUndo ? 'var(--text-primary)' : 'var(--text-muted)'} />
        </button>

        <button 
          onClick={() => triggerButtonSwipe('left')}
          disabled={stocks.length === 0 || currentIndex >= stocks.length}
          style={{ 
            ...styles.circleBtn, 
            ...styles.passBtn,
            opacity: (stocks.length === 0 || currentIndex >= stocks.length) ? 0.4 : 1
          }}
          className="btn-hover-grow no-flip glow-red"
          title="Pass (Swipe Left)"
        >
          <X size={24} color="var(--color-bearish)" />
        </button>

        <button 
          onClick={() => triggerButtonSwipe('right')}
          disabled={stocks.length === 0 || currentIndex >= stocks.length}
          style={{ 
            ...styles.circleBtn, 
            ...styles.likeBtn,
            opacity: (stocks.length === 0 || currentIndex >= stocks.length) ? 0.4 : 1
          }}
          className="btn-hover-grow no-flip glow-green"
          title="Match (Swipe Right)"
        >
          <Heart size={24} color="var(--color-bullish)" fill="var(--color-bullish)" />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '430px',
    margin: '0 auto',
    padding: '8px 16px',
    height: 'calc(100vh - 65px)',
    justifyContent: 'space-between',
  },
  monthFilterBox: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  monthHeaderTitle: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  monthsRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    width: '100%',
    paddingBottom: '4px',
  },
  monthBtn: {
    padding: '4px 10px',
    fontSize: '0.7rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'var(--transition-smooth)',
  },
  progressRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '6px',
  },
  progressText: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-purple), var(--color-blue))',
    transition: 'width 0.3s ease',
  },
  cardArea: {
    position: 'relative',
    width: '100%',
    height: '480px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '6px',
  },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transformOrigin: 'bottom center',
    touchAction: 'none',
  },
  swipeBadge: {
    position: 'absolute',
    top: '40px',
    padding: '6px 14px',
    border: '3px solid',
    borderRadius: '8px',
    fontSize: '1.4rem',
    fontWeight: '900',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.05em',
    transform: 'rotate(-10deg)',
    pointerEvents: 'none',
  },
  likeBadge: {
    right: '30px',
    borderColor: 'var(--color-bullish)',
    color: 'var(--color-bullish)',
    transform: 'rotate(10deg)',
  },
  passBadge: {
    left: '30px',
    borderColor: 'var(--color-bearish)',
    color: 'var(--color-bearish)',
    transform: 'rotate(-10deg)',
  },
  tipRow: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    width: '100%',
    padding: '8px 0 2px 0',
  },
  circleBtn: {
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  undoBtn: {
    width: '42px',
    height: '42px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  passBtn: {
    width: '58px',
    height: '58px',
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
  },
  likeBtn: {
    width: '58px',
    height: '58px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 24px',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontSize: '1.4rem',
    marginBottom: '8px',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    marginBottom: '24px',
  },
  finishButton: {
    width: '100%',
    padding: '12px 18px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 8px 20px -5px rgba(139, 92, 246, 0.5)',
  }
};
