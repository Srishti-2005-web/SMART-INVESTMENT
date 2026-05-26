

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: '300',
          letterSpacing: '0.1em',
        }}>
          AURUM <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Advisor</span>
        </div>

        <div style={{
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {['Historical Analysis', 'Factor Analysis', 'Price Prediction', 'SIP Calculator'].map(link => (
            <span key={link} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'default',
            }}>{link}</span>
          ))}
        </div>

        <div style={{ width: '48px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          maxWidth: '480px',
          lineHeight: '1.7',
          letterSpacing: '0.02em',
        }}>
          ⚠ For educational purposes only. This application does not provide financial advice. 
          Always consult a SEBI-registered investment advisor before investing.
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.15em',
          opacity: 0.5,
        }}>
          © 2025 AURUM ADVISOR — 6TH SEM MINI PROJECT
        </div>
      </div>
    </footer>
  );
}
