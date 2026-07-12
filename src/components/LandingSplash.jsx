import React from 'react';
import { Heart, Sparkles, TrendingUp, Cpu } from 'lucide-react';

export default function LandingSplash({ onStart, onAutoSelect, totalCount }) {
  return (
    <div style={styles.container}>
      {/* Floating Stock Badges in Background */}
      <div style={styles.floatingContainer}>
        <div style={{ ...styles.floatingBadge, ...styles.badge1 }}>NVDA +262%</div>
        <div style={{ ...styles.floatingBadge, ...styles.badge2 }}>AAPL +5%</div>
        <div style={{ ...styles.floatingBadge, ...styles.badge3 }}>TSLA -9%</div>
        <div style={{ ...styles.floatingBadge, ...styles.badge4 }}>AMZN +13%</div>
        <div style={{ ...styles.floatingBadge, ...styles.badge5 }}>NFLX +15%</div>
      </div>

      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <TrendingUp size={36} color="var(--color-purple)" />
            <Heart size={20} color="var(--color-bearish)" style={styles.miniHeart} />
          </div>
          <h1 style={styles.title}>
            Stock<span style={styles.titleGradient}>Match</span>
          </h1>
          <span style={styles.badge}>HACKATHON MVP</span>
        </div>

        <p style={styles.subtitle}>
          Find your perfect market match. Swipe on the Nasdaq 100.
        </p>

        <p style={styles.description}>
          We translate boring, complex 10-Q corporate financial reports into simple, jargon-free "dating profiles." Swipe right if you vibe, left if you pass.
        </p>

        <div style={styles.bulletsContainer}>
          <div style={styles.bulletItem}>
            <div style={{ ...styles.bulletIcon, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-bullish)' }}>✓</div>
            <div style={styles.bulletText}>
              <strong>Vibe Checks:</strong> Plain English bio of how they actually make money.
            </div>
          </div>
          <div style={styles.bulletItem}>
            <div style={{ ...styles.bulletIcon, background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-blue)' }}>✓</div>
            <div style={styles.bulletText}>
              <strong>Vitals:</strong> Fast color-coded revenue, profit margins, and analyst sentiment.
            </div>
          </div>
          <div style={styles.bulletItem}>
            <div style={{ ...styles.bulletIcon, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold)' }}>✓</div>
            <div style={styles.bulletText}>
              <strong>Gossip:</strong> 1-sentence juicy highlight from their latest earnings call.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionsBox}>
          <button 
            onClick={onStart}
            style={styles.button}
            className="btn-hover-grow glow-gold"
          >
            <Sparkles size={18} />
            Start Swiping ({totalCount} Cards)
          </button>

          <button 
            onClick={onAutoSelect}
            style={styles.autoSelectBtn}
            className="btn-hover-grow"
            title="Auto-matches 20 stocks for testing"
          >
            <Cpu size={16} color="var(--color-purple)" />
            <span>AI Auto-Select (Test 20 Matches)</span>
          </button>
        </div>

        <div style={styles.footer}>
          <span>No real money required • Swipe left/right • Build your dream sector mix</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '20px',
    position: 'relative',
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0,
  },
  floatingBadge: {
    position: 'absolute',
    padding: '10px 16px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    background: 'rgba(22, 26, 37, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    color: '#fff',
  },
  badge1: {
    top: '15%',
    left: '10%',
    color: 'var(--color-bullish)',
    borderLeft: '3px solid var(--color-bullish)',
    animation: 'floatBadge 6s infinite alternate ease-in-out',
  },
  badge2: {
    top: '25%',
    right: '8%',
    color: 'var(--color-bullish)',
    borderLeft: '3px solid var(--color-bullish)',
    animation: 'floatBadge 8s infinite alternate ease-in-out 1s',
  },
  badge3: {
    bottom: '20%',
    left: '8%',
    color: 'var(--color-bearish)',
    borderLeft: '3px solid var(--color-bearish)',
    animation: 'floatBadge 7s infinite alternate ease-in-out 0.5s',
  },
  badge4: {
    bottom: '30%',
    right: '12%',
    color: 'var(--color-bullish)',
    borderLeft: '3px solid var(--color-bullish)',
    animation: 'floatBadge 9s infinite alternate ease-in-out 1.5s',
  },
  badge5: {
    top: '48%',
    left: '18%',
    color: 'var(--color-bullish)',
    borderLeft: '3px solid var(--color-bullish)',
    animation: 'floatBadge 10s infinite alternate ease-in-out 2s',
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    padding: '30px 24px',
    textAlign: 'center',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '15px',
    position: 'relative',
  },
  logoContainer: {
    position: 'relative',
    display: 'inline-flex',
    padding: '12px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    marginBottom: '10px',
  },
  miniHeart: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    animation: 'pulse 1.5s infinite',
  },
  title: {
    fontSize: '2.2rem',
    fontFamily: 'var(--font-display)',
    marginBottom: '4px',
    letterSpacing: '-0.03em',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--color-purple)',
    background: 'rgba(139, 92, 246, 0.12)',
    padding: '3px 8px',
    borderRadius: '8px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: '1.15rem',
    fontWeight: '500',
    color: '#fff',
    lineHeight: '1.4',
    marginBottom: '12px',
    fontFamily: 'var(--font-display)',
  },
  description: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  bulletsContainer: {
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255,255,255,0.02)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
  },
  bulletItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  bulletIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    flexShrink: 0,
    marginTop: '2px',
  },
  bulletText: {
    fontSize: '0.82rem',
    lineHeight: '1.4',
    color: 'var(--text-secondary)',
  },
  actionsBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    color: '#fff',
    fontSize: '0.98rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 8px 20px -5px rgba(139, 92, 246, 0.5)',
  },
  autoSelectBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    background: 'rgba(139, 92, 246, 0.05)',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    transition: 'var(--transition-smooth)',
  },
  footer: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  }
};
