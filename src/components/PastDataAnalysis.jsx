import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getPrices } from '../api';

// ── Tooltips ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card2)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '12px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value || 0).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

const ChangeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0]?.value || 0);
  return (
    <div style={{
      background: 'var(--bg-card2)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '12px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ color: val >= 0 ? 'var(--green)' : 'var(--red)' }}>
        YoY Change: {val > 0 ? '+' : ''}{val}%
      </div>
    </div>
  );
};

// ── Convert daily records → yearly averages ───────────────────────────────────
function buildYearlyData(records) {
  if (!records || records.length === 0) return [];

  const byYear = {};

  records.forEach(r => {
    const year = r.date?.slice(0, 4);
    const price = Number(r.close);

    if (!year || isNaN(price)) return;

    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(price);
  });

  const years = Object.keys(byYear).sort();

  return years.map((year, i) => {
    const prices = byYear[year];

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      year,
      price: Math.round(avg),
      change:
        i === 0
          ? 0
          : parseFloat(
              (
                ((avg - (byYear[years[i - 1]].reduce((a, b) => a + b, 0) / byYear[years[i - 1]].length))
                / (byYear[years[i - 1]].reduce((a, b) => a + b, 0) / byYear[years[i - 1]].length))
                * 100
              ).toFixed(1)
            ),
    };
  });
}

// ── Compute stat cards ───────────────────────────────────────────────────────
function computeStats(yearlyData, metal) {
  if (!yearlyData || yearlyData.length === 0) return [];

  const prices = yearlyData.map(d => d.price);
  const changes = yearlyData.map(d => d.change);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const minYear = yearlyData.find(d => d.price === minPrice)?.year;
  const maxYear = yearlyData.find(d => d.price === maxPrice)?.year;

  const bestChange = Math.max(...changes);

  const n = yearlyData.length - 1;
  const cagr = n > 0
    ? ((Math.pow(prices[prices.length - 1] / prices[0], 1 / n) - 1) * 100).toFixed(1)
    : 0;

  const accent = metal === 'gold' ? 'var(--gold)' : 'var(--silver-light)';

  return [
    {
      label: `Lowest (${minYear})`,
      value: `₹${minPrice.toLocaleString('en-IN')}`,
      color: 'var(--red)',
    },
    {
      label: `Highest (${maxYear})`,
      value: `₹${maxPrice.toLocaleString('en-IN')}`,
      color: 'var(--green)',
    },
    {
      label: '5yr CAGR',
      value: `${cagr}%`,
      color: accent,
    },
    {
      label: 'Best Year',
      value: `+${bestChange}%`,
      color: accent,
    },
  ];
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PastDataAnalysis() {
  const [activeTab, setActiveTab] = useState('gold');
  const [goldData, setGoldData] = useState([]);
  const [silverData, setSilverData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getPrices.gold(5),
      getPrices.silver(5),
    ])
    .then(([goldRes, silverRes]) => {
      const goldYearly = buildYearlyData(goldRes?.data || []);
      const silverYearly = buildYearlyData(silverRes?.data || []);

      setGoldData(goldYearly);
      setSilverData(silverYearly);
      setLoading(false);
    })
    .catch(err => {
      setError(`Failed to load: ${err.message}`);
      setLoading(false);
    });
  }, []);

  const data = activeTab === 'gold' ? goldData : silverData;
  const color = activeTab === 'gold' ? 'var(--gold)' : 'var(--silver-light)';
  const strokeColor = activeTab === 'gold' ? '#c9a84c' : '#a8b8c8';
  const stats = computeStats(data, activeTab);

  return (
    <section id="past-data" style={{ background: 'var(--bg-dark)' }}>
      <div className="container">

        <span className="section-tag">01 — Historical Analysis</span>
        <h2 className="section-title">Past Price <span>Performance</span></h2>
        <p className="section-subtitle">
          5 years of gold and silver price data revealing long-term trends,
          volatility patterns, and year-over-year returns.
        </p>
        <div className="divider" />

        {/* Tabs */}
        <div className="tab-bar" style={{ maxWidth: '320px' }}>
          <button
            className={`tab-btn ${activeTab === 'gold' ? 'active' : ''}`}
            onClick={() => setActiveTab('gold')}
          >⬡ Gold</button>
          <button
            className={`tab-btn ${activeTab === 'silver' ? 'active' : ''}`}
            onClick={() => setActiveTab('silver')}
          >◈ Silver</button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>}
        {!loading && error && <div style={{ color: 'red' }}>{error}</div>}

        {!loading && !error && data.length > 0 && (
          <>
            <div className="stat-grid">
              {stats.map(s => (
                <div className="stat-box" key={s.label}>
                  <span className="stat-value" style={{ color: s.color }}>
                    {s.value}
                  </span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* 🔥 ONLY FIX HERE */}
            <div className="card">
              <div>
                Price History (INR/{activeTab === 'gold' ? '10g' : 'kg'})
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area dataKey="price" stroke={strokeColor} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<ChangeTooltip />} />
                  <Bar dataKey="change" fill={strokeColor} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
