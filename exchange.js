require("dotenv").config();
const binance = require("node-binance-api");
const time = require("time");

time.tzset("UTC");
process.env.TZ = "UTC";

binance.options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.API_SECRET,
  recvWindow: 60000
});

const getCandlesticks = (tradePair, interval) => {
  return new Promise((resolve, reject) => {
    // Get data
    // Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
    binance.candlesticks(tradePair, interval, ticksArray => {
      // let last_tick = ticks[ticks.length - 1];
      // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

      var ticks = ticksArray.map(tick => {
        return {
          ticker: tradePair,
          open: Number(tick[1]),
          high: Number(tick[2]),
          low: Number(tick[3]),
          close: Number(tick[4]),
          date: new Date(tick[0])
        };
      });

      resolve(ticks);
    });
  });
};

const getCandlesticksRealTime = (tradePair, interval) => {
  return new Promise((resolve, reject) => {
    binance.websockets.candlesticks([tradePair], interval, candlesticks => {
      // let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
      // let tick = { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;

      var tick = {
        ticker: candlesticks.s,
        open: candlesticks.k.o,
        high: candlesticks.k.h,
        low: candlesticks.k.l,
        close: candlesticks.k.c,
        date: new Date(candlesticks.E)
      };

      resolve(tick);
    });
  });
};

module.exports = {
  getCandlesticksRealTime: getCandlesticksRealTime,
  getCandlesticks: getCandlesticks
};

// Get bid/ask prices
//binance.allBookTickers(function(json) {
//  console.log("allBookTickers",json);
//});

// Getting latest price of a symbol
// binance.prices(function(ticker) {
//
// });

// Getting list of current balances
// binance.balance(function(balances) {
// 	console.log("LTC:", balances.LTC.available);
// 	if ( typeof balances.ETH !== "undefined" ) {
// 		console.log("ETH balance: ", balances.ETH.available);
// 	}
// });

// Getting bid/ask prices for a symbol
//binance.bookTickers(function(ticker) {
//	console.log("bookTickers()", ticker);
//	console.log("Price of BNB: ", ticker.BNBBTC);
//});

// Get market depth for a symbol
//binance.depth("SNMBTC", function(json) {
//	console.log("market depth",json);
//});

// Getting list of open orders
//binance.openOrders("ETHBTC", function(json) {
//	console.log("openOrders()",json);
//});

// Check an order's status
//let orderid = "7610385";
//binance.orderStatus("ETHBTC", orderid, function(json) {
//	console.log("orderStatus()",json);
//});

// Cancel an order
//binance.cancel("ETHBTC", orderid, function(response) {
//	console.log("cancel()",response);
//});

// Trade history
//binance.trades("SNMBTC", function(json) {
//  console.log("trade history",json);
//});

// Get all account orders; active, canceled, or filled.
//binance.allOrders("ETHBTC", function(json) {
//	console.log(json);
//});

//Placing a LIMIT order
//binance.buy(symbol, quantity, price);
//binance.buy("ETHBTC", 1, 0.0679);
//binance.sell("ETHBTC", 1, 0.069);

//Placing a MARKET order
//binance.buy(symbol, quantity, price, type);
//binance.buy("ETHBTC", 1, 0, "MARKET")
//binance.sell(symbol, quantity, 0, "MARKET");

// Maintain Market Depth Cache Locally via WebSocket
// binance.websockets.depthCache(["BNBBTC"], function(symbol, depth) {
// 	let max = 10; // Show 10 closest orders only
// 	let bids = binance.sortBids(depth.bids, max);
// 	let asks = binance.sortAsks(depth.asks, max);
// 	//console.log(symbol+" depth cache update");
// 	//console.log("asks", asks);
// 	//console.log("bids", bids);
// 	//console.log("ask: "+binance.first(asks));
// 	//console.log("bid: "+binance.first(bids));
// });
