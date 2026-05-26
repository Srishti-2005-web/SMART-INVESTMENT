import { useEffect, useState } from "react";
import { getFactors, getPrices } from "../api";

export default function Hero() {
  const [liveStats, setLiveStats] = useState([
    { label: "Gold / 10g", value: "...", change: "...", up: true },
    { label: "Silver / kg", value: "...", change: "...", up: true },
    { label: "USD/INR", value: "...", change: "...", up: false },
    { label: "Inflation (CPI)", value: "...", change: "...", up: false },
  ]);

  useEffect(() => {
    getPrices.summary()
      .then((summary) => {
        const gold = summary?.gold ?? {};
        const silver = summary?.silver ?? {};

        setLiveStats((prev) => {
          const updated = [...prev];
          updated[0] = {
            label: "Gold / 10g",
            value: `Rs ${Number(gold.current_price ?? 0).toLocaleString("en-IN")}`,
            change: `${(gold["1y_change_pct"] ?? 0) > 0 ? "+" : ""}${gold["1y_change_pct"] ?? 0}%`,
            up: (gold["1y_change_pct"] ?? 0) >= 0,
          };
          updated[1] = {
            label: "Silver / kg",
            value: `Rs ${Number(silver.current_price ?? 0).toLocaleString("en-IN")}`,
            change: `${(silver["1y_change_pct"] ?? 0) > 0 ? "+" : ""}${silver["1y_change_pct"] ?? 0}%`,
            up: (silver["1y_change_pct"] ?? 0) >= 0,
          };
          return updated;
        });
      })
      .catch((err) => {
        console.error("Summary error:", err);
      });

    getFactors.gold()
      .then((factors) => {
        const usd = factors?.factors?.[0];
        const inf = factors?.factors?.[1];

        setLiveStats((prev) => {
          const updated = [...prev];
          updated[2] = {
            label: "USD/INR",
            value: `Rs ${usd?.trend?.current ?? "84.0"}`,
            change: `${(usd?.trend?.["30d_change_pct"] ?? 0) > 0 ? "+" : ""}${usd?.trend?.["30d_change_pct"] ?? 0}%`,
            up: (usd?.trend?.["30d_change_pct"] ?? 0) >= 0,
          };
          updated[3] = {
            label: "Inflation (CPI)",
            value: `${inf?.trend?.current ?? "-"}`,
            change: (inf?.trend?.["30d_change_pct"] ?? 0) > 0 ? "Rising" : "Stable",
            up: false,
          };
          return updated;
        });
      })
      .catch((err) => {
        console.error("Factors error:", err);
      });
  }, []);

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px 60px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "0",
          right: "0",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "24px",
          opacity: 0,
          animation: "fadeUp 0.6s 0.1s ease forwards",
          border: "1px solid rgba(201,168,76,0.25)",
          padding: "6px 18px",
          borderRadius: "2px",
        }}
      >
        Smart Investment Advisor - Gold and Silver
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: "300",
          lineHeight: "1.05",
          letterSpacing: "-0.01em",
          color: "var(--text-primary)",
          marginBottom: "8px",
          opacity: 0,
          animation: "fadeUp 0.6s 0.25s ease forwards",
        }}
      >
        Where Should
      </h1>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          fontWeight: "300",
          fontStyle: "italic",
          lineHeight: "1.05",
          background: "linear-gradient(135deg, var(--gold-light), var(--gold), #8b6914)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "32px",
          opacity: 0,
          animation: "fadeUp 0.6s 0.4s ease forwards",
        }}
      >
        You Invest?
      </h1>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          fontWeight: "300",
          color: "var(--text-secondary)",
          maxWidth: "520px",
          lineHeight: "1.8",
          marginBottom: "48px",
          opacity: 0,
          animation: "fadeUp 0.6s 0.55s ease forwards",
        }}
      >
        AI-powered analysis of gold and silver markets using historical data, USD/INR trends, and inflation indicators to predict future prices and guide your investment decisions.
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "80px",
          opacity: 0,
          animation: "fadeUp 0.6s 0.7s ease forwards",
        }}
      >
        <a
          href="#past-data"
          style={{
            background: "linear-gradient(135deg, var(--gold), #b8942a)",
            color: "var(--bg-deep)",
            textDecoration: "none",
            padding: "14px 36px",
            borderRadius: "4px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: "500",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Start Analysis
        </a>
        <a
          href="#sip"
          style={{
            background: "transparent",
            color: "var(--gold)",
            textDecoration: "none",
            padding: "14px 36px",
            borderRadius: "4px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            border: "1px solid rgba(201,168,76,0.35)",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
        >
          SIP Calculator
        </a>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
          opacity: 0,
          animation: "fadeUp 0.6s 0.85s ease forwards",
          maxWidth: "700px",
          width: "100%",
        }}
      >
        {liveStats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRight: i < liveStats.length - 1 ? "1px solid var(--border)" : "none",
              background: "var(--bg-card)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: "500",
                color: i < 2 ? "var(--gold)" : "var(--silver-light)",
                marginBottom: "4px",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: stat.up ? "var(--green)" : "var(--red)",
              }}
            >
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "var(--text-muted)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: 0,
          animation: "fadeUp 0.6s 1.1s ease forwards",
        }}
      >
        SCROLL
        <div
          style={{
            width: "1px",
            height: "32px",
            background: "linear-gradient(180deg, var(--gold), transparent)",
            animation: "scrollPulse 2s infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
}
