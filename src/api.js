/**
 * src/api.js
 * Centralised API client for Smart Investment Advisor frontend.
 * Replace BASE_URL with your deployed backend URL in production.
 */

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").trim();

async function request(path, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const separator = path.includes("?") ? "&" : "?";
  const finalPath = isGet ? `${path}${separator}_t=${Date.now()}` : path;

  const res = await fetch(`${BASE_URL}${finalPath}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Prices (Phase 1) ──────────────────────────────────────────────────────────
export const getPrices = {
  gold:    (years = 5)  => request(`/prices/gold?years=${years}`),
  silver:  (years = 5)  => request(`/prices/silver?years=${years}`),
  summary: ()           => request("/prices/summary"),
};

// ── Prediction (Phase 3 ML) ───────────────────────────────────────────────────
export const getPrediction = {
  gold:   (days = 30) => request(`/predict/gold?days=${days}`),
  silver: (days = 30) => request(`/predict/silver?days=${days}`),
};

// ── Factors (Phase 2) ─────────────────────────────────────────────────────────
export const getFactors = {
  gold:        ()           => request("/factors/gold"),
  silver:      ()           => request("/factors/silver"),
  timeseries:  (factorKey)  => request(`/factors/timeseries/${factorKey}`),
};

// ── Full Analysis + Advisory (Phase 3 Combined) ───────────────────────────────
export const getAnalysis = {
  gold:    () => request("/analysis/gold"),
  silver:  () => request("/analysis/silver"),
  compare: () => request("/analysis/compare"),
};

// ── SIP Calculator ────────────────────────────────────────────────────────────
export const getSIP = {
  defaults: () => request("/sip/defaults"),

  calculate: ({ metal, monthly_amount, duration_months, expected_annual_return_pct }) =>
    request("/sip/calculate", {
      method: "POST",
      body: JSON.stringify({ metal, monthly_amount, duration_months, expected_annual_return_pct }),
    }),

  compare: ({ metal, lumpsum_amount, monthly_sip, duration_months, annual_return_pct }) =>
    request("/sip/compare", {
      method: "POST",
      body: JSON.stringify({ metal, lumpsum_amount, monthly_sip, duration_months, annual_return_pct }),
    }),
};
