import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';

export default function MatchModal({ stock, onClose }) {
  if (!stock) return null;

  // Personalized trivia messages for high-profile stocks
  const getCustomMessage = (ticker) => {
    switch (ticker) {
      case 'NVDA':
        return "It's a Match! You and Nvidia both value hyper-growth. You believe graphics chips are the new oil and AI is the ultimate future. Let's stack those GPUs!";
      case 'AAPL':
        return "It's a Match! You and Apple both value premium ecosystem control. You love clean industrial design, hefty profit margins, and a status symbol in your pocket.";
      case 'TSLA':
        return "It's a Match! You and Tesla both value futuristic disruption. You're ready to automate the roads, build robots, and settle Mars before the decade ends.";
      case 'NFLX':
        return "It's a Match! You and Netflix both value consumer eyeballs. You understand the power of locking in subscriptions and securing the global entertainment throne.";
      case 'AMZN':
        return "It's a Match! You and Amazon both value absolute convenience. You appreciate a business that delivers toilet paper in 2 hours and hosts half of the internet on the side.";
      case 'MSFT':
        return "It's a Match! You and Microsoft both value enterprise dominance. You appreciate a trillion-dollar compounder that quietly integrates AI assistant into every workspace.";
      default:
        return `It's a Match! You and ${stock.name} both see massive long-term growth opportunities in the ${stock.sector} sector. Your portfolio is looking brighter!`;
    }
  };

  return (
    <div style={styles.overlay}>
      {/* Background Darkener with blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.backdrop}
        onClick={onClose}
      />

      {/* Main Celebration Content */}
      <motion.div 
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        style={styles.modalCard}
        className="glass-panel pulse-glow"
      >
        {/* Sparkles / Particles in modal */}
        <div style={styles.decorations}>
          <Sparkles size={24} color="var(--color-gold)" style={styles.sparkle1} />
          <Sparkles size={16} color="var(--color-purple)" style={styles.sparkle2} />
          <Sparkles size={20} color="var(--color-blue)" style={styles.sparkle3} />
        </div>

        {/* Heart logo overlay */}
        <div style={styles.matchBadgeRow}>
          <Heart size={44} color="var(--color-bearish)" fill="var(--color-bearish)" style={styles.mainHeart} />
        </div>

        <h1 style={styles.matchTitle}>IT'S A MATCH!</h1>

        {/* Intersecting Logos */}
        <div style={styles.logosContainer}>
          <motion.div 
            initial={{ rotate: -15, x: 20 }}
            animate={{ rotate: -8, x: 10 }}
            style={{ ...styles.companyLogo, background: stock.logoBg }}
          >
            {stock.ticker}
          </motion.div>
          <motion.div 
            initial={{ rotate: 15, x: -20 }}
            animate={{ rotate: 8, x: -10 }}
            style={styles.userLogo}
          >
            YOU
          </motion.div>
        </div>

        {/* Customized Humorous Match Message */}
        <div style={styles.messageContainer}>
          <p style={styles.messageText}>
            {getCustomMessage(stock.ticker)}
          </p>
        </div>

        {/* Stats Snippet */}
        <div style={styles.vitalsPreview}>
          <div style={styles.vitalMini}>
            <span style={styles.labelMini}>Revenue Growth</span>
            <span style={styles.valMini}>{stock.vitals.revenueGrowth}</span>
          </div>
          <div style={styles.vitalMini}>
            <span style={styles.labelMini}>Profit Margin</span>
            <span style={styles.valMini}>{stock.vitals.profitMargin}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={styles.button}
          className="btn-hover-grow glow-gold"
        >
          Keep Swiping
        </button>
      </motion.div>
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
    zIndex: 999,
    padding: '20px',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(5, 5, 8, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  modalCard: {
    maxWidth: '430px',
    width: '100%',
    padding: '36px 28px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    boxShadow: 'var(--shadow-glow-gold)',
    overflow: 'hidden',
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  sparkle1: {
    position: 'absolute',
    top: '25px',
    left: '40px',
    animation: 'floatBadge 3s infinite alternate ease-in-out',
  },
  sparkle2: {
    position: 'absolute',
    top: '60px',
    right: '50px',
    animation: 'floatBadge 4s infinite alternate ease-in-out 0.5s',
  },
  sparkle3: {
    position: 'absolute',
    bottom: '80px',
    left: '50px',
    animation: 'floatBadge 5s infinite alternate ease-in-out 1s',
  },
  matchBadgeRow: {
    marginBottom: '15px',
  },
  mainHeart: {
    animation: 'pulse 1.2s infinite ease-in-out',
  },
  matchTitle: {
    fontSize: '2rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.05em',
    color: 'var(--color-gold)',
    marginBottom: '20px',
    textShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
  },
  logosContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '110px',
    width: '180px',
    marginBottom: '24px',
    position: 'relative',
  },
  companyLogo: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.25rem',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  userLogo: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.25rem',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  messageContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
  },
  messageText: {
    fontSize: '0.88rem',
    lineHeight: '1.6',
    color: '#fff',
  },
  vitalsPreview: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginBottom: '28px',
  },
  vitalMini: {
    flex: 1,
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  labelMini: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  valMini: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--color-bullish)',
  },
  button: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--color-gold), #d97706)',
    color: '#fff',
    fontSize: '0.98rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    boxShadow: '0 8px 24px -6px rgba(245, 158, 11, 0.5)',
  }
};
