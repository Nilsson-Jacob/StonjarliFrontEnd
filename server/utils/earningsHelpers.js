const finnhub = require("../services/finnhubService");

async function simulateEarningsStrategy(ticker, holdDays = 5) {
  const prices = await finnhub.getHistoricalPrices(ticker);

  if (!prices || prices.length === 0) {
    return { error: "No data available" };
  }

  const earningsDates = prices.filter((_, i) => i % 60 === 0);

  let totalReturn = 0;
  let wins = 0;

  earningsDates.forEach((entry) => {
    const entryIndex = prices.findIndex((d) => d.date === entry.date);
    const exitIndex = entryIndex + holdDays;

    if (exitIndex >= prices.length) return;

    const entryPrice = prices[entryIndex].close;
    const exitPrice = prices[exitIndex].close;
    const percentChange = ((exitPrice - entryPrice) / entryPrice) * 100;

    totalReturn += percentChange;
    if (percentChange > 0) wins++;
  });

  const totalTrades = earningsDates.length;
  return {
    avgReturn: (totalReturn / totalTrades).toFixed(2),
    winRate: ((wins / totalTrades) * 100).toFixed(2),
    totalTrades,
  };
}

module.exports = {
  simulateEarningsStrategy,
};
