var exchange = require('./exchange');

var wallet = {
  'ETH': 100,
  'NEO': 0
};

var params = {
  tradePair: "NEOETH",
  interval: "1m",
  tradingFee: 0.01,
  multiplier: 0.001
}

exchange.getCandlesticks(params.tradePair, params.interval, function(ticks){
  console.log(ticks);
})

exchange.getCandlesticksRealTime(params.tradePair, params.interval, function(tick){
  console.log(tick);
})
