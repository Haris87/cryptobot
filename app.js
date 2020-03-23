const exchange = require("./exchange");
const ta = require("./technicalanalysis");

const base = "USDT";
const stock = "ETH";

const params = {
  tradePair: stock + base,
  interval: "1h",
  tradingFee: 0.01,
  multiplier: 0.001
};

exchange
  .getCandlesticks(params.tradePair, params.interval)
  .then(ticks => {
    console.log(
      ticks.splice(ticks.length - 4, ticks.length - 1).map(t => {
        return { open: t.open, close: t.close, time: t.date };
      })
    );

    ticks.splice(ticks.length - 1, 1);

    console.log(ta.discoverPatterns(ticks));
  })
  .catch(err => console.log(err));
