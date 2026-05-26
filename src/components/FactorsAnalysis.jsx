
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import {
  usdIndexHistory,
  inflationHistory,
  goldPriceHistory,
  silverPriceHistory,
} from '../data/mockData';


const correlationData = goldPriceHistory.map((g, i) => ({
  year: g.year,
  gold: g.price,
  silver: silverPriceHistory[i].price,
  usd: usdIndexHistory[i].value,
  inflation: inflationHistory[i].rate,
}));

const CustomTooltip = ({ active, payload, label }) => {
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
      <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: '3px' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const factors = [
  {
    id: 'usd',
    title: 'US Dollar Index',
    icon: '$',
    subtitle: 'Inverse Correlation',
    desc: 'Gold and silver prices move inversely with the USD. When the dollar weakens, precious metals priced in USD become cheaper for foreign buyers, driving up demand and prices.',
    correlation: '-0.74',
    badge: 'badge-gold',
    points: [
      'USD ↑ → Gold/Silver ↓ (historically)',
      'Dollar weakens when inflation rises',
      'USD Index dropped 8% in 2020 → Gold surged 25%',
      'Current USD strength is suppressing prices',
    ],
  },
  {
    id: 'inflation',
    title: 'Inflation (CPI)',
    icon: '%',
    subtitle: 'Positive Correlation',
    desc: 'Precious metals serve as classic inflation hedges. When purchasing power erodes, investors flock to gold and silver as stores of value, driving prices higher.',
    correlation: '+0.68',
    badge: 'badge-silver',
    points: [
      'Inflation ↑ → Real yields ↓ → Gold ↑',
      '2022: CPI hit 8% → Gold held near $1,800',
      'Silver benefits from industrial inflation too',
      'Long-run gold price tracks CPI closely',
    ],
  },
];

const insights = [
  { text: 'Every 10% USD drop has historically led to ~18% gold rally', type: 'gold' },
  { text: 'Inflation above 4% has triggered silver outperformance in 7 of last 8 cycles', type: 'silver' },
  { text: 'Combined USD weakness + high inflation = strongest precious metal bull markets', type: 'green' },
];

export default function FactorsAnalysis() {
  const [activeChart, setActiveChart] = useState('gold-usd');

  return (
    <section id="factors">
      <div className="container">
        {/* Header */}
        <span className="section-tag">02 — Factor Analysis</span>
        <h2 className="section-title">Key Market <span>Drivers</span></h2>
        <p className="section-subtitle">
          Understanding the two most powerful forces shaping gold & silver prices: 
          the US Dollar and inflation.
        </p>
        <div className="divider" />

        {/* Factor Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {factors.map(f => (
            <div className="card" key={f.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px',
                    background: f.id === 'usd' ? 'rgba(201,168,76,0.12)' : 'rgba(168,184,200,0.1)',
                    border: `1px solid ${f.id === 'usd' ? 'rgba(201,168,76,0.3)' : 'rgba(168,184,200,0.3)'}`,
                    borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    color: f.id === 'usd' ? 'var(--gold)' : 'var(--silver-light)',
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: '500', fontSize: '15px', marginBottom: '2px' }}>{f.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{f.subtitle}</div>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: '500',
                  color: f.id === 'usd' ? 'var(--red)' : 'var(--green)',
                }}>{f.correlation}</div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px', fontWeight: '300' }}>
                {f.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {f.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: f.id === 'usd' ? 'var(--gold)' : 'var(--silver-light)', marginTop: '2px', flexShrink: 0 }}>→</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chart tabs */}
        <div className="tab-bar" style={{ maxWidth: '520px', marginBottom: '24px' }}>
          {[
            { key: 'gold-usd', label: 'Gold vs USD' },
            { key: 'silver-usd', label: 'Silver vs USD' },
            { key: 'inflation', label: 'vs Inflation' },
          ].map(t => (
            <button
              key={t.key}
              className={`tab-btn ${activeChart === t.key ? 'active' : ''}`}
              onClick={() => setActiveChart(t.key)}
            >{t.label}</button>
          ))}
        </div>

        {/* Correlation Chart */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            {activeChart === 'gold-usd' && 'Gold Price (USD/oz) vs USD Index — 2015–2024'}
            {activeChart === 'silver-usd' && 'Silver Price (USD/oz) vs USD Index — 2015–2024'}
            {activeChart === 'inflation' && 'Precious Metals vs Inflation Rate (CPI%) — 2015–2024'}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={correlationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
              <XAxis dataKey="year" tick={{ fill: '#605848', fontFamily: 'var(--font-mono)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#605848', fontFamily: 'var(--font-mono)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#605848', fontFamily: 'var(--font-mono)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '11px', paddingTop: '16px' }} />

              {activeChart === 'gold-usd' && <>
                <Line yAxisId="left" type="monotone" dataKey="gold" name="Gold ($/oz)" stroke="#c9a84c" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="usd" name="USD Index" stroke="#e05252" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </>}
              {activeChart === 'silver-usd' && <>
                <Line yAxisId="left" type="monotone" dataKey="silver" name="Silver ($/oz)" stroke="#a8b8c8" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="usd" name="USD Index" stroke="#e05252" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </>}
              {activeChart === 'inflation' && <>
                <Line yAxisId="left" type="monotone" dataKey="gold" name="Gold ($/oz)" stroke="#c9a84c" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="silver" name="Silver ($/oz)" stroke="#a8b8c8" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="inflation" name="CPI Inflation %" stroke="#4caf7d" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </>}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {insights.map((ins, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${ins.type === 'gold' ? 'rgba(201,168,76,0.2)' : ins.type === 'silver' ? 'rgba(168,184,200,0.2)' : 'rgba(76,175,125,0.2)'}`,
              borderRadius: '4px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: ins.type === 'gold' ? 'var(--gold)' : ins.type === 'silver' ? 'var(--silver)' : 'var(--green)',
                flexShrink: 0,
              }} />
              {ins.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
