import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function calcSIP(monthly, rate, years) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const futureValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const totalInvested = monthly * months;
  const wealthGained = futureValue - totalInvested;
  return { futureValue, totalInvested, wealthGained };
}

function buildChartData(monthly, rate, years) {
  const data = [];
  for (let y = 1; y <= years; y++) {
    const { futureValue, totalInvested } = calcSIP(monthly, rate, y);
    data.push({
      year: `Y${y}`,
      invested: Math.round(totalInvested),
      value: Math.round(futureValue),
      gain: Math.round(futureValue - totalInvested),
    });
  }
  return data;
}

const presets = [
  { label: 'Gold SIP', rate: 7.2, color: 'gold', desc: 'Based on gold 10-yr CAGR' },
  { label: 'Silver SIP', rate: 5.9, color: 'silver', desc: 'Based on silver 10-yr CAGR' },
  { label: 'Blended', rate: 6.5, color: 'green', desc: '50% gold + 50% silver' },
];

const SIPTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card2)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '12px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: '3px' }}>
          {p.name}: ₹{p.value?.toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(7.2);
  const [years, setYears] = useState(10);
  const [activePreset, setActivePreset] = useState(0);

  const { futureValue, totalInvested, wealthGained } = useMemo(
    () => calcSIP(monthly, rate, years),
    [monthly, rate, years]
  );

  const chartData = useMemo(() => buildChartData(monthly, rate, years), [monthly, rate, years]);

  const applyPreset = (i) => {
    setActivePreset(i);
    setRate(presets[i].rate);
  };

  const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const roiPct = ((wealthGained / totalInvested) * 100).toFixed(1);

  return (
    <section id="sip">
      <div className="container">
        {/* Header */}
        <span className="section-tag">04 — SIP Calculator</span>
        <h2 className="section-title">Systematic Investment <span>Planner</span></h2>
        <p className="section-subtitle">
          Calculate the future value of your monthly gold or silver investments 
          using real historical return rates.
        </p>
        <div className="divider" />

        {/* Preset Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {presets.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              style={{
                padding: '10px 20px',
                border: `1px solid ${activePreset === i
                  ? p.color === 'gold' ? 'var(--gold)' : p.color === 'silver' ? 'var(--silver)' : 'var(--green)'
                  : 'var(--border)'}`,
                borderRadius: '4px',
                background: activePreset === i
                  ? p.color === 'gold' ? 'rgba(201,168,76,0.1)' : p.color === 'silver' ? 'rgba(168,184,200,0.08)' : 'rgba(76,175,125,0.08)'
                  : 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: activePreset === i
                  ? p.color === 'gold' ? 'var(--gold)' : p.color === 'silver' ? 'var(--silver-light)' : 'var(--green)'
                  : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <div>{p.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{p.rate}% p.a. — {p.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Inputs Panel */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Input Parameters
            </div>

            <div className="input-group">
              <label className="input-label">Monthly Investment</label>
              <input
                type="number"
                className="input-field"
                value={monthly}
                min={500}
                step={500}
                onChange={e => setMonthly(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                {[1000, 5000, 10000, 25000].map(v => (
                  <button key={v} onClick={() => setMonthly(v)} style={{
                    padding: '4px 10px',
                    border: `1px solid ${monthly === v ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: '2px',
                    background: monthly === v ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: monthly === v ? 'var(--gold)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                  }}>₹{(v/1000).toFixed(v >= 1000 ? 0 : 1)}K</button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Expected Annual Return: <span style={{ color: 'var(--gold)' }}>{rate}%</span></label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1%</span><span>20%</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Duration: <span style={{ color: 'var(--gold)' }}>{years} years</span></label>
              <input
                type="range"
                min={1}
                max={30}
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1 yr</span><span>30 yrs</span>
              </div>
            </div>

            {/* Results */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>TOTAL INVESTED</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)' }}>{fmt(totalInvested)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>WEALTH GAINED</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--green)' }}>{fmt(wealthGained)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>FUTURE VALUE</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)' }}>{fmt(futureValue)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>TOTAL ROI</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--green)', fontWeight: '500' }}>+{roiPct}%</span>
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Wealth Growth Over Time
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf7d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4caf7d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
                <XAxis dataKey="year" tick={{ fill: '#605848', fontFamily: 'var(--font-mono)', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.ceil(years / 8)} />
                <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: '#605848', fontFamily: 'var(--font-mono)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SIPTooltip />} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', paddingTop: '12px' }} />
                <Area type="monotone" dataKey="value" name="Future Value" stroke="#c9a84c" strokeWidth={2} fill="url(#valueGrad)" />
                <Area type="monotone" dataKey="invested" name="Amount Invested" stroke="#4caf7d" strokeWidth={2} fill="url(#investGrad)" />
              </AreaChart>
            </ResponsiveContainer>

            {/* Key milestones */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Milestone Years
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[5, 10, 15, 20].filter(y => y <= years).map(y => {
                  const { futureValue: fv } = calcSIP(monthly, rate, y);
                  return (
                    <div key={y} style={{
                      padding: '10px 16px',
                      background: 'var(--bg-card2)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      textAlign: 'center',
                      flex: 1,
                      minWidth: '100px',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Yr {y}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gold)', fontWeight: '500' }}>
                        ₹{(fv / 100000).toFixed(1)}L
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
