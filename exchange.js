require('dotenv').config();
var binance = require('node-binance-api');
var time = require('time');
// var cs = require('candlestick');
var cs = require('./technicalanalysis');

time.tzset('UTC');
process.env.TZ = 'UTC';

binance.options({
	'APIKEY':process.env.API_KEY,
	'APISECRET':process.env.API_SECRET,
	'recvWindow': 60000
});


var allCandlesticks = [];
// Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
binance.candlesticks("LTCETH", "1m", function(ticks) {
	// console.log("candlesticks()", ticks);
	// let last_tick = ticks[ticks.length - 1];
	// let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
	//console.log("BNBBTC last close: "+close);
  var all = ticks.map(function(tick){
    return {
      ticker: "LTCETH",
      open: Number(tick[1]),
      high: Number(tick[2]),
      low: Number(tick[3]),
      close: Number(tick[4]),
      date: new Date(tick[0])
    };
  });

  // console.log(cs);

  // console.log(all[0], all[1]);
  //
  //
  // console.log(cs.isBullishKicker(all[0], all[1])); // false
  // console.log(cs.isBearishKicker(all[0], all[1])); // true
  //
  console.log({
    size: all.length,
    bullish: cs.bullishKicker(all),
    bearish: cs.bearishKicker(all),
    // bullish: cs.bullishHarami(all),
    // bearish: cs.bearishHarami(all),
    shootingStar: cs.shootingStar(all)
  });
});


binance.websockets.candlesticks(['BNBBTC'], "1m", function(candlesticks) {

	// let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
	// let tick = { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;


  let tick = { symbol: candlesticks.s, open: candlesticks.k.o, high: candlesticks.k.h, low: candlesticks.k.l, close: candlesticks.k.c, timestamp: candlesticks.E  };

  allCandlesticks.push(tick);

  if(allCandlesticks.length>2){
    // console.log({
    //   size: allCandlesticks.length,
    //   bullish: cs.isBullishKicker(allCandlesticks[allCandlesticks.length-2], allCandlesticks[allCandlesticks.length-1]),
    //   bearish: cs.isBearishKicker(allCandlesticks[allCandlesticks.length-2], allCandlesticks[allCandlesticks.length-1]),
    //   shootingStar: cs.shootingStar(allCandlesticks)
    // });
  }


  // console.log(tick);
  // console.log(symbol+" candlestick update");
  // console.log(tick);
  // console.log("open: "+open);
	// console.log("high: "+high);
	// console.log("low: "+low);
	// console.log("close: "+close);
	// console.log("volume: "+volume);
	// console.log("isFinal: "+isFinal);
});


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