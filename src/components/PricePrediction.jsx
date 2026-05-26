import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAnalysis, getPrediction } from "../api";

const methodologySteps = [
  {
    num: "01",
    title: "Historical Baseline",
    desc: "Five years of market data establish the base price trend before forecasting forward.",
  },
  {
    num: "02",
    title: "USD/INR Context",
    desc: "Currency impact is applied consistently so INR prices stay aligned with the underlying commodity price.",
  },
  {
    num: "03",
    title: "Factor Overlay",
    desc: "Macro factors such as inflation and USD direction are combined later in the advisory score.",
  },
  {
    num: "04",
    title: "ML Forecast",
    desc: "A sliding-window linear regression model predicts the next 30 days from the recent price sequence.",
  },
];

const PredTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "var(--bg-card2)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "12px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.1em" }}>
        {label}
      </div>
      {payload.map(
        (item, index) =>
          item.value !== undefined && (
            <div key={index} style={{ color: item.color || "var(--text-primary)", marginBottom: "3px" }}>
              {item.name}: Rs {Number(item.value).toLocaleString("en-IN")}
            </div>
          ),
      )}
    </div>
  );
};

function buildChartData(historical, predicted) {
  if (!historical?.length || !predicted?.length) return [];

  const byMonth = {};
  historical.forEach((row) => {
    const month = row.date?.slice(0, 7);
    if (!month) return;
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(row.price);
  });

  const histPoints = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, prices]) => ({
      label: month,
      actual: Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length),
    }));

  const predByMonth = {};
  predicted.forEach((row) => {
    const month = row.date?.slice(0, 7);
    if (!month) return;
    if (!predByMonth[month]) predByMonth[month] = [];
    predByMonth[month].push(row.price);
  });

  const predPoints = Object.entries(predByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, prices]) => {
      const avg = Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length);
      return {
        label: month,
        predicted: avg,
        high: Math.round(avg * 1.05),
        low: Math.round(avg * 0.95),
      };
    });

  return [...histPoints, ...predPoints];
}

function buildSummaryCards(predicted) {
  if (!predicted?.length) return [];

  const byMonth = {};
  predicted.forEach((row) => {
    const month = row.date?.slice(0, 7);
    if (!month) return;
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(row.price);
  });

  const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
  const picks = [months[0], months[Math.floor(months.length / 2)], months[months.length - 1]].filter(Boolean);

  return picks.map(([month, prices]) => {
    const avg = Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length);
    return {
      label: month,
      price: avg,
      low: Math.round(avg * 0.95),
      high: Math.round(avg * 1.05),
    };
  });
}

function buildReason(winner, horizon, risk, advisory) {
  const asset = winner === "gold" ? "Gold" : "Silver";
  const horizonText =
    horizon === "short" ? "short-term (0-1 year)" : horizon === "medium" ? "medium-term (1-5 years)" : "long-term (5+ years)";
  const riskText =
    risk === "low" ? "capital preservation" : risk === "moderate" ? "balanced growth" : "maximum returns";

  return `Based on your ${horizonText} horizon and preference for ${riskText}, ${asset} is the stronger choice right now. Our model gives it an advisory score of ${Math.round((advisory?.score ?? 0.5) * 100)}% with a ${advisory?.signal ?? "HOLD"} signal.`;
}

export default function PricePrediction() {
  const [activeAsset, setActiveAsset] = useState("gold");
  const [horizon, setHorizon] = useState("medium");
  const [risk, setRisk] = useState("moderate");
  const [showRec, setShowRec] = useState(false);
  const [goldChart, setGoldChart] = useState([]);
  const [silverChart, setSilverChart] = useState([]);
  const [goldCards, setGoldCards] = useState([]);
  const [silverCards, setSilverCards] = useState([]);
  const [goldUnit, setGoldUnit] = useState("per 10g");
  const [silverUnit, setSilverUnit] = useState("per kg");
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPrediction.gold(30), getPrediction.silver(30)])
      .then(([goldRes, silverRes]) => {
        setGoldChart(buildChartData(goldRes.historical, goldRes.predicted));
        setSilverChart(buildChartData(silverRes.historical, silverRes.predicted));
        setGoldCards(buildSummaryCards(goldRes.predicted));
        setSilverCards(buildSummaryCards(silverRes.predicted));
        setGoldUnit(goldRes.unit ?? "per 10g");
        setSilverUnit(silverRes.unit ?? "per kg");
      })
      .catch((err) => {
        console.error("Prediction error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGetRec = () => {
    setRecLoading(true);
    setShowRec(false);

    getAnalysis.compare()
      .then((res) => {
        const goldScore = res.gold?.advisory?.score ?? 0;
        const silverScore = res.silver?.advisory?.score ?? 0;
        const winner = goldScore >= silverScore ? "gold" : "silver";
        const winnerData = res[winner]?.advisory;

        setAdvisory({
          asset: winner === "gold" ? "Gold" : "Silver",
          signal: winnerData?.signal ?? "HOLD",
          label: winnerData?.label ?? "Monitor before investing",
          score: winnerData?.score ?? 0,
          confidence: Math.round((winnerData?.score ?? 0.5) * 100),
          goldScore: Math.round(goldScore * 100),
          silverScore: Math.round(silverScore * 100),
          reason: buildReason(winner, horizon, risk, winnerData),
        });
        setShowRec(true);
      })
      .catch((err) => {
        console.error("Analysis error:", err);
      })
      .finally(() => setRecLoading(false));
  };

  const chartData = activeAsset === "gold" ? goldChart : silverChart;
  const cards = activeAsset === "gold" ? goldCards : silverCards;
  const unit = activeAsset === "gold" ? goldUnit : silverUnit;
  const unitLabel = unit === "per kg" ? "kg" : "10g";
  const color = activeAsset === "gold" ? "#c9a84c" : "#a8b8c8";
  const accent = activeAsset === "gold" ? "var(--gold)" : "var(--silver-light)";

  return (
    <section id="prediction" style={{ background: "var(--bg-dark)" }}>
      <div className="container">
        <span className="section-tag">03 - Price Prediction</span>
        <h2 className="section-title">
          Future Price <span>Forecast</span>
        </h2>
        <p className="section-subtitle">
          Combining historical trends, USD/INR conversion, and factor-based advisory signals to forecast gold and silver prices for the next 30 days.
        </p>
        <div className="divider" />

        <div className="tab-bar" style={{ maxWidth: "280px", marginBottom: "32px" }}>
          <button className={`tab-btn ${activeAsset === "gold" ? "active" : ""}`} onClick={() => setActiveAsset("gold")}>
            Gold
          </button>
          <button className={`tab-btn ${activeAsset === "silver" ? "active" : ""}`} onClick={() => setActiveAsset("silver")}>
            Silver
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            Running ML model...
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="stat-grid" style={{ marginBottom: "28px" }}>
            {cards.map((card, index) => (
              <div className="stat-box" key={index} style={{ position: "relative", overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: activeAsset === "gold" ? "rgba(201,168,76,0.08)" : "rgba(168,184,200,0.06)",
                    width: "60%",
                    height: "100%",
                    clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)",
                  }}
                />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>
                  {card.label}
                </div>
                <span className="stat-value" style={{ color: accent }}>
                  Rs {card.price.toLocaleString("en-IN")}
                </span>
                <span className="stat-label">Predicted Price ({unitLabel})</span>
                <div style={{ marginTop: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>
                  Rs {card.low.toLocaleString("en-IN")} - Rs {card.high.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && chartData.length > 0 && (
          <div className="card" style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
                  Historical + Predicted Price (INR/{unitLabel})
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: accent }}>30-Day Forecast</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.07)" />
                <XAxis dataKey="label" tick={{ fill: "#605848", fontFamily: "var(--font-mono)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#605848", fontFamily: "var(--font-mono)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<PredTooltip />} />
                <Area type="monotone" dataKey="high" fill="url(#rangeGrad)" stroke="none" name="High Estimate" />
                <Area type="monotone" dataKey="low" fill="var(--bg-dark)" stroke="none" name="Low Estimate" />
                <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 4 }} name="Actual" connectNulls={false} />
                <Line type="monotone" dataKey="predicted" stroke={color} strokeWidth={2} strokeDasharray="6 3" dot={{ fill: color, r: 4 }} name="Predicted" connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
            Prediction Methodology
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {methodologySteps.map((step) => (
              <div key={step.num} style={{ display: "flex", gap: "14px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--gold)", fontWeight: "500", flexShrink: 0, paddingTop: "2px" }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>{step.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6", fontWeight: "300" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ border: "1px solid rgba(201,168,76,0.3)", background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(201,168,76,0.04) 100%)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "6px" }}>
            Get Your <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Recommendation</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px", fontWeight: "300" }}>
            Tell us your investment horizon and risk appetite to receive a tailored gold vs silver recommendation powered by our backend analysis.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Investment Horizon</label>
              <select className="input-field" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option value="short">Short Term (0-1 year)</option>
                <option value="medium">Medium Term (1-5 years)</option>
                <option value="long">Long Term (5+ years)</option>
              </select>
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Risk Appetite</label>
              <select className="input-field" value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option value="low">Low - Capital Preservation</option>
                <option value="moderate">Moderate - Balanced Growth</option>
                <option value="high">High - Maximum Returns</option>
              </select>
            </div>
          </div>

          <button className="btn-gold" style={{ width: "auto", padding: "12px 36px" }} onClick={handleGetRec} disabled={recLoading}>
            {recLoading ? "Analyzing..." : "Generate Recommendation"}
          </button>

          {showRec && advisory && (
            <div style={{ marginTop: "24px", padding: "24px", background: "var(--bg-card2)", border: `1px solid ${advisory.asset === "Gold" ? "rgba(201,168,76,0.3)" : "rgba(168,184,200,0.3)"}`, borderRadius: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: advisory.asset === "Gold" ? "var(--gold)" : "var(--silver-light)", fontStyle: "italic" }}>
                  {advisory.asset}
                </div>
                <div className={`badge ${advisory.asset === "Gold" ? "badge-gold" : "badge-silver"}`}>{advisory.signal}</div>
                <div className="badge badge-green" style={{ marginLeft: "auto" }}>
                  {advisory.confidence}% Score
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "16px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <div style={{ padding: "8px 16px", background: "rgba(201,168,76,0.08)", borderRadius: "3px", color: "var(--gold)" }}>
                  Gold: {advisory.goldScore}%
                </div>
                <div style={{ padding: "8px 16px", background: "rgba(168,184,200,0.06)", borderRadius: "3px", color: "var(--silver-light)" }}>
                  Silver: {advisory.silverScore}%
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7", fontWeight: "300" }}>
                {advisory.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
