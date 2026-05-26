

export const goldPriceHistory = [
  { year: '2015', price: 1160, change: -10.4 },
  { year: '2016', price: 1251, change: 7.8 },
  { year: '2017', price: 1305, change: 13.1 },
  { year: '2018', price: 1268, change: -2.1 },
  { year: '2019', price: 1478, change: 18.3 },
  { year: '2020', price: 1887, change: 25.1 },
  { year: '2021', price: 1800, change: -3.5 },
  { year: '2022', price: 1800, change: 0.4 },
  { year: '2023', price: 1943, change: 13.1 },
  { year: '2024', price: 2330, change: 14.3 },
];

export const silverPriceHistory = [
  { year: '2015', price: 15.7,  change: -11.5 },
  { year: '2016', price: 17.1,  change: 15.4 },
  { year: '2017', price: 17.2,  change: 6.8 },
  { year: '2018', price: 15.7,  change: -8.5 },
  { year: '2019', price: 16.2,  change: 15.3 },
  { year: '2020', price: 20.5,  change: 47.9 },
  { year: '2021', price: 25.1,  change: -12.2 },
  { year: '2022', price: 21.7,  change: -11.9 },
  { year: '2023', price: 23.4,  change: 0.2 },
  { year: '2024', price: 27.9,  change: 21.3 },
];

export const usdIndexHistory = [
  { year: '2015', value: 98.7 },
  { year: '2016', value: 102.2 },
  { year: '2017', value: 92.1 },
  { year: '2018', value: 96.5 },
  { year: '2019', value: 96.9 },
  { year: '2020', value: 89.9 },
  { year: '2021', value: 95.7 },
  { year: '2022', value: 104.7 },
  { year: '2023', value: 101.3 },
  { year: '2024', value: 104.1 },
];

export const inflationHistory = [
  { year: '2015', rate: 0.1 },
  { year: '2016', rate: 2.1 },
  { year: '2017', rate: 2.1 },
  { year: '2018', rate: 2.4 },
  { year: '2019', rate: 2.3 },
  { year: '2020', rate: 1.2 },
  { year: '2021', rate: 4.7 },
  { year: '2022', rate: 8.0 },
  { year: '2023', rate: 4.1 },
  { year: '2024', rate: 2.9 },
];


export const combinedFactors = goldPriceHistory.map((g, i) => ({
  year: g.year,
  gold: g.price,
  silver: silverPriceHistory[i].price * 10, 
  usd: usdIndexHistory[i].value * 10,
  inflation: inflationHistory[i].rate * 100,
}));


export const goldPredictions = [
  { year: '2024', price: 2330, type: 'actual' },
  { year: '2025', price: 2580, type: 'predicted', low: 2400, high: 2760 },
  { year: '2026', price: 2810, type: 'predicted', low: 2560, high: 3060 },
  { year: '2027', price: 3050, type: 'predicted', low: 2700, high: 3400 },
];

export const silverPredictions = [
  { year: '2024', price: 27.9, type: 'actual' },
  { year: '2025', price: 33.2, type: 'predicted', low: 29.5, high: 37.0 },
  { year: '2026', price: 38.5, type: 'predicted', low: 33.0, high: 44.0 },
  { year: '2027', price: 44.8, type: 'predicted', low: 38.0, high: 52.0 },
];


export function getRecommendation(horizon, riskLevel) {
  if (horizon === 'short') {
    if (riskLevel === 'low') return { asset: 'Gold', confidence: 72, reason: 'Gold offers stability over short horizons with lower volatility. Current USD weakness supports gold prices.' };
    return { asset: 'Silver', confidence: 65, reason: 'Silver has higher upside potential short-term due to industrial demand recovery, but carries more risk.' };
  }
  if (horizon === 'medium') {
    return { asset: 'Gold', confidence: 78, reason: 'Gold historically outperforms in 3–5 year windows during inflationary cycles. USD softening is expected.' };
  }
  
  return { asset: 'Silver', confidence: 82, reason: 'Silver\'s dual role as monetary metal and industrial input (solar, EV) gives it superior long-term growth potential.' };
}
