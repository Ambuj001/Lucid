'use client';
import { useState } from 'react';

interface CreditCardProps {
  card: {
    id: string;
    name: string;
    issuer: string;
    network: string;
    annual_fee: number;
    nickname?: string;
    card_category?: string;
    card_network?: string;
    card_limit?: number;
    available_balance?: number;
  };
  onEdit: (card: any) => void;
  onDelete: (cardId: string) => void;
}

interface CardTheme {
  bg: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  chipColor: string;
  logoText: string;
  logoSub: string;
  networkIcon: string;
  glare: string;
  border: string;
}

function getCardTheme(issuer: string, id: string): CardTheme {
  const issuerLower = issuer.toLowerCase();
  const idLower = id.toLowerCase();

  if (idLower.includes('hdfc') || issuerLower.includes('hdfc')) {
    if (idLower.includes('regalia')) {
      return {
        bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
        accent: '#e94560',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.6)',
        chipColor: '#d4af37',
        logoText: 'HDFC Bank',
        logoSub: 'Regalia Gold',
        networkIcon: 'mastercard',
        glare: 'rgba(212,175,55,0.15)',
        border: 'rgba(212,175,55,0.3)',
      };
    }
    return {
      bg: 'linear-gradient(135deg, #003087 0%, #0057b8 50%, #1e88e5 100%)',
      accent: '#64b5f6',
      textPrimary: '#fff',
      textSecondary: 'rgba(255,255,255,0.65)',
      chipColor: '#ffd700',
      logoText: 'HDFC Bank',
      logoSub: 'Millennia',
      networkIcon: 'mastercard',
      glare: 'rgba(100,181,246,0.15)',
      border: 'rgba(255,255,255,0.15)',
    };
  }

  if (idLower.includes('sbi') || issuerLower.includes('sbi')) {
    return {
      bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 45%, #388e3c 100%)',
      accent: '#a5d6a7',
      textPrimary: '#fff',
      textSecondary: 'rgba(255,255,255,0.65)',
      chipColor: '#ffd700',
      logoText: 'SBI Card',
      logoSub: 'Cashback',
      networkIcon: 'rupay',
      glare: 'rgba(165,214,167,0.15)',
      border: 'rgba(255,255,255,0.2)',
    };
  }

  if (idLower.includes('axis') || issuerLower.includes('axis')) {
    if (idLower.includes('atlas')) {
      return {
        bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #2a2a2a 100%)',
        accent: '#b71c1c',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.55)',
        chipColor: '#c0c0c0',
        logoText: 'Axis Bank',
        logoSub: 'Atlas',
        networkIcon: 'visa',
        glare: 'rgba(183,28,28,0.15)',
        border: 'rgba(183,28,28,0.4)',
      };
    }
    return {
      bg: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #ab47bc 100%)',
      accent: '#e1bee7',
      textPrimary: '#fff',
      textSecondary: 'rgba(255,255,255,0.65)',
      chipColor: '#ffd700',
      logoText: 'Axis Bank',
      logoSub: 'Ace',
      networkIcon: 'visa',
      glare: 'rgba(225,190,231,0.15)',
      border: 'rgba(255,255,255,0.2)',
    };
  }

  if (idLower.includes('icici') || issuerLower.includes('icici')) {
    if (idLower.includes('amazon')) {
      return {
        bg: 'linear-gradient(135deg, #232f3e 0%, #1a242f 50%, #0d1b2a 100%)',
        accent: '#ff9900',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.6)',
        chipColor: '#ff9900',
        logoText: 'ICICI Bank',
        logoSub: 'Amazon Pay',
        networkIcon: 'visa',
        glare: 'rgba(255,153,0,0.15)',
        border: 'rgba(255,153,0,0.3)',
      };
    }
    return {
      bg: 'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)',
      accent: '#ffcdd2',
      textPrimary: '#fff',
      textSecondary: 'rgba(255,255,255,0.65)',
      chipColor: '#ffd700',
      logoText: 'ICICI Bank',
      logoSub: 'Business',
      networkIcon: 'amex',
      glare: 'rgba(255,205,210,0.12)',
      border: 'rgba(255,255,255,0.2)',
    };
  }

  if (idLower.includes('idfc') || issuerLower.includes('idfc')) {
    return {
      bg: 'linear-gradient(135deg, #004d7a 0%, #008793 50%, #00bf72 100%)',
      accent: '#b2ebf2',
      textPrimary: '#fff',
      textSecondary: 'rgba(255,255,255,0.65)',
      chipColor: '#ffd700',
      logoText: 'IDFC FIRST',
      logoSub: 'Millennia',
      networkIcon: 'visa',
      glare: 'rgba(178,235,242,0.15)',
      border: 'rgba(255,255,255,0.2)',
    };
  }

  if (idLower.includes('tata') || issuerLower.includes('tata')) {
    return {
      bg: 'linear-gradient(135deg, #263238 0%, #37474f 50%, #455a64 100%)',
      accent: '#80cbc4',
      textPrimary: '#fff',
      textSecondary: 'rgba(255,255,255,0.6)',
      chipColor: '#ffd700',
      logoText: 'HDFC Bank',
      logoSub: 'Tata Neu Infinity',
      networkIcon: 'mastercard',
      glare: 'rgba(128,203,196,0.15)',
      border: 'rgba(255,255,255,0.15)',
    };
  }

  // Default
  return {
    bg: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
    accent: '#c5cae9',
    textPrimary: '#fff',
    textSecondary: 'rgba(255,255,255,0.6)',
    chipColor: '#ffd700',
    logoText: issuer,
    logoSub: '',
    networkIcon: 'visa',
    glare: 'rgba(197,202,233,0.12)',
    border: 'rgba(255,255,255,0.15)',
  };
}

function NetworkLogo({ network, color = '#fff' }: { network: string; color?: string }) {
  const n = network.toLowerCase();
  if (n === 'mastercard') {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eb001b', opacity: 0.95 }} />
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f79e1b', opacity: 0.95, marginLeft: -10 }} />
      </div>
    );
  }
  if (n === 'rupay') {
    return (
      <span style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: 1, fontFamily: 'monospace' }}>
        Ru<span style={{ color: '#ff9900' }}>Pay</span>
      </span>
    );
  }
  if (n === 'amex' || n === 'american express') {
    return (
      <span style={{ fontSize: 10, fontWeight: 900, color, letterSpacing: 1 }}>AMEX</span>
    );
  }
  // Visa
  return (
    <span style={{ fontSize: 18, fontWeight: 900, fontStyle: 'italic', color, letterSpacing: -1 }}>VISA</span>
  );
}

function EMVChip() {
  return (
    <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
      <rect x="0.5" y="0.5" width="41" height="31" rx="5.5" fill="#D4AF37" stroke="#B8960C"/>
      <line x1="14" y1="0.5" x2="14" y2="31.5" stroke="#B8960C" strokeWidth="0.5"/>
      <line x1="28" y1="0.5" x2="28" y2="31.5" stroke="#B8960C" strokeWidth="0.5"/>
      <line x1="0.5" y1="11" x2="41.5" y2="11" stroke="#B8960C" strokeWidth="0.5"/>
      <line x1="0.5" y1="21" x2="41.5" y2="21" stroke="#B8960C" strokeWidth="0.5"/>
      <rect x="14.5" y="11.5" width="13" height="9" rx="1" fill="#C9A227" stroke="#B8960C" strokeWidth="0.5"/>
    </svg>
  );
}

export default function CreditCard({ card, onEdit, onDelete }: CreditCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const theme = getCardTheme(card.issuer, card.id);

  // Parse nickname for cardholder name and last 4 digits
  let cardholderName = 'CARD HOLDER';
  let last4 = '0000';
  if (card.nickname) {
    const parts = card.nickname.split('|');
    if (parts.length === 2) {
      cardholderName = parts[0].toUpperCase();
      last4 = parts[1];
    } else {
      cardholderName = card.nickname.toUpperCase();
    }
  }

  const networkStr = (card.card_network || card.network || theme.networkIcon).toLowerCase();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const rotateX = hovered ? (mousePos.y - 0.5) * -14 : 0;
  const rotateY = hovered ? (mousePos.x - 0.5) * 14 : 0;

  return (
    <div style={{ perspective: '1000px', width: '100%' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMousePos({ x: 0.5, y: 0.5 }); }}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.586',
          borderRadius: 20,
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          boxShadow: hovered
            ? `0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px ${theme.border}`
            : `0 8px 32px rgba(0,0,0,0.25)`,
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${hovered ? 'scale(1.03)' : 'scale(1)'}`,
          transition: hovered ? 'box-shadow 0.15s, scale 0.15s' : 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
          cursor: 'default',
          overflow: 'hidden',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        {/* Glare overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background: hovered
            ? `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${theme.glare} 0%, transparent 70%)`
            : 'transparent',
          pointerEvents: 'none',
          transition: 'background 0.1s',
          zIndex: 1,
        }} />

        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(255,255,255,0.02) 40px,
            rgba(255,255,255,0.02) 80px
          )`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Top row: bank logo + card type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: theme.textPrimary, letterSpacing: 0.5, lineHeight: 1 }}>
              {theme.logoText}
            </div>
            {theme.logoSub && (
              <div style={{ fontSize: 9, fontWeight: 700, color: theme.accent, letterSpacing: 2, marginTop: 2, textTransform: 'uppercase' }}>
                {theme.logoSub}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: theme.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
              {card.card_category || 'Platinum'}
            </div>
            <NetworkLogo network={networkStr} color={theme.textPrimary} />
          </div>
        </div>

        {/* EMV Chip */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <EMVChip />
        </div>

        {/* Card Number */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: 3,
            fontFamily: 'Courier New, monospace',
          }}>
            •••• &nbsp;•••• &nbsp;•••• &nbsp;{last4}
          </div>
        </div>

        {/* Bottom row: cardholder + expiry */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ fontSize: 7, fontWeight: 700, color: theme.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
              Card Holder
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: theme.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {cardholderName.length > 18 ? cardholderName.slice(0, 18) + '…' : cardholderName}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: theme.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
              Expires
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: theme.textPrimary, letterSpacing: 1, fontFamily: 'monospace' }}>
              12/27
            </div>
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 6,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'all 0.2s',
          zIndex: 10,
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            title="Edit Card Details"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
          >
            ✎
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
            title="Remove Card"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(239,68,68,0.25)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.45)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Card info strip below */}
      <div style={{
        marginTop: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2px',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1d20' }}>{card.name}</div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>Annual Fee: ₹{card.annual_fee.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>Active</div>
          <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1, fontFamily: 'monospace' }}>
            {card.id.replace('in_', '').toUpperCase().slice(0, 12)}
          </div>
        </div>
      </div>
    </div>
  );
}
