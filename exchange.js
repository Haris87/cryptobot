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
var movingAvg = 0;

// initialization
var previousTrade = 'SELL';
var previousColor = 'Y';
var lastbuy = 0;
var tradingFee = 0.001;

var wallet = {
  'ETH': 1,
  'NEO': 0
};

var params = {
  tradePair: "NEOETH",
  interval: "15m",
  multiplier: 0.001
}

function buy(price, time){
  previousTrade = 'BUY';
  lastbuy = price;
  wallet['NEO'] = wallet['ETH'] / price;
  wallet['NEO'] -= wallet['NEO'] * tradingFee; //remove trade fee from holdings
  wallet['ETH'] = 0;
  console.log("\x1b[35m%s\t%s\x1b[0m", "BUY", price, time, wallet);
}

function sell(price, time){
  previousTrade = 'SELL';
  wallet['ETH'] = wallet['NEO'] * price;
  wallet['ETH'] -= wallet['ETH'] * tradingFee; //remove trade fee from holdings
  wallet['NEO'] = 0;
  console.log("\x1b[36m%s\t%s\x1b[0m", "SELL", price, time, wallet);
}

function trade(ticks, multiplier){
  var margin, movingAvg, price, color;
  for (var i = 1; i < ticks.length; i++) {
    price = ticks[i].close;
    movingAvg = movingAverage(ticks.slice(0, i));
    margin = movingAvg * multiplier;


    color = getColor(price, movingAvg, margin);
    // console.log("Margin\t", color, movingAvg, margin, [movingAvg-margin, movingAvg+margin]);
    //console.debug(color, ticks[i].date+"\tPRICE: "+price+"\tAVG:"+movingAvg);

    // decide trade
    if(previousColor == 'R' && (color == 'Y' || color == 'G') && previousTrade == 'SELL'){
      //buy
      buy(price, ticks[i].date);
    }

    if(previousColor == 'G' && (color == 'Y' || color == 'R') && previousTrade == 'BUY'){
      //sell
      if(price - lastbuy > 0){
        sell(price, ticks[i].date);
      }
    }

    previousColor = color;

  }


  console.log('EARNED\t', wallet);
}

function movingAverage(array){
  var sum = 0;
  // console.log(array);
  for( var i = 0; i < array.length; i++ ){
      sum += array[i].close;
  }
  return sum/array.length;
}


function getColor(price, movingAvg, margin){
  if(price > movingAvg + margin){
    // console.log('green', price);
    color='G';
  } else if(price < movingAvg - margin) {
    // console.log('red', price);
    color='R';
  } else {
    // console.log('yellow', price);
    color='Y';
  }
  return color;
}


console.debug = function(color, text){
  if(color == 'R'){
    console.log("\x1b[31m%s\x1b[0m", text);
  }

  if(color == 'G'){
    console.log("\x1b[32m%s\x1b[0m", text);
  }

  if(color == 'Y'){
    console.log("\x1b[33m%s\x1b[0m", text);
  }

}

// Get data
// Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
binance.candlesticks(params.tradePair, params.interval, function(ticksArray) {

	// let last_tick = ticks[ticks.length - 1];
	// let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

  var ticks = ticksArray.map(function(tick){
    return {
      ticker: params.tradePair,
      open: Number(tick[1]),
      high: Number(tick[2]),
      low: Number(tick[3]),
      close: Number(tick[4]),
      date: new Date(tick[0])
    };
  });

  trade(ticks, params.multiplier);

  // console.log({
  //   size: ticks.length,
  //   bullishKicker: cs.bullishKicker(ticks).length,
  //   bearishKicker: cs.bearishKicker(ticks).length,
  //   bullishHarami: cs.bullishHarami(ticks).length,
  //   bearishHarami: cs.bearishHarami(ticks).length,
  //   bullishEngulfing: cs.bullishEngulfing(ticks).length,
  //   bearishEngulfing: cs.bearishEngulfing(ticks).length,
  //   hammer: cs.hammer(ticks).length,
  //   invertedHammer: cs.invertedHammer(ticks).length,
  //   hangingMan: cs.hangingMan(ticks).length,
  //   shootingStar: cs.shootingStar(ticks)
  // });
});


// binance.websockets.candlesticks(['BNBBTC'], "1m", function(candlesticks) {
//
// 	// let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
// 	// let tick = { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
//
//   let tick = { symbol: candlesticks.s, open: candlesticks.k.o, high: candlesticks.k.h, low: candlesticks.k.l, close: candlesticks.k.c, timestamp: candlesticks.E  };
//
//   allCandlesticks.push(tick);
//   console.log('price\t', tick.close);
//   trade(allCandlesticks, 0.001);
//
// });


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
