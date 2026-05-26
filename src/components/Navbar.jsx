
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Analysis', href: '#past-data' },
  { label: 'Factors', href: '#factors' },
  { label: 'Prediction', href: '#prediction' },
  { label: 'SIP Calc', href: '#sip' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.4s ease',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <a href="#hero" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
            borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: '600',
            fontSize: '16px',
            color: '#0a0a0f',
          }}>A</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: '300',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
          }}>AURUM</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--gold)',
            letterSpacing: '0.2em',
            marginLeft: '4px',
            opacity: 0.7,
          }}>ADVISOR</span>
        </a>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Live Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--gold)',
          letterSpacing: '0.1em',
        }}>
          <span style={{
            width: '6px', height: '6px',
            background: 'var(--green)',
            borderRadius: '50%',
            boxShadow: '0 0 6px var(--green)',
            animation: 'pulse 2s infinite',
          }} />
          LIVE DATA
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </nav>
  );
}
