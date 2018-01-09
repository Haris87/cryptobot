require('dotenv').config();
var binance = require('node-binance-api');
var time = require('time');
// var cs = require('candlestick');
var cs = require('./technicalanalysis');

time.tzset('UTC');
process.env.TZ = 'UTC';

binance.options({
  'APIKEY': process.env.API_KEY,
  'APISECRET': process.env.API_SECRET,
  'recvWindow': 60000
});

function buy(price, time, wallet, savings, stock) {
  wallet[stock] = wallet[savings] / price;
  wallet[stock] -= wallet[stock] * tradingFee; //remove trade fee from holdings
  wallet[savings] = 0;
  console.log("\x1b[35m%s\t%s\x1b[0m", "BUY", price, time, wallet);
	return wallet;
}

function sell(price, time, wallet, savings, stock) {
  wallet[savings] = wallet[stock] * price;
  wallet[savings] -= wallet[savings] * tradingFee; //remove trade fee from holdings
  wallet[stock] = 0;
  console.log("\x1b[36m%s\t%s\x1b[0m", "SELL", price, time, wallet);
	return wallet;
}

function getTrendColor(price, average, margin) {
  if (price > average + margin) {
    // console.log('green', price);
    color = 'G';
  } else if (price < average - margin) {
    // console.log('red', price);
    color = 'R';
  } else {
    // console.log('yellow', price);
    color = 'Y';
  }
  return color;
}

function getTicksAverage(ticks) {
  var array = ticks.map(function(t) {
    return t.close
  });
  var sum = 0;
  // console.log(array);
  for (var i = 0; i < array.length; i++) {
    sum += array[i].close;
  }
  return sum / array.length;
}

function getCandlesticks(tradePair, interval, callback) {
  // Get data
  // Periods: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
  binance.candlesticks(tradePair, interval, function(ticksArray) {

    // let last_tick = ticks[ticks.length - 1];
    // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

    var ticks = ticksArray.map(function(tick) {
      return {
        ticker: params.tradePair,
        open: Number(tick[1]),
        high: Number(tick[2]),
        low: Number(tick[3]),
        close: Number(tick[4]),
        date: new Date(tick[0])
      };
    });

    callback(ticks);

  });

};

function getCandlesticksRealTime(tradePair, interval, callback) {
  binance.websockets.candlesticks([tradePair], interval, function(candlesticks) {

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

    callback(tick);
  });
};

module.exports = {
	buy: buy,
	sell: sell,
	getTrendColor: getTrendColor,
	getTicksAverage: getTicksAverage,
	getCandlesticksRealTime: getCandlesticksRealTime,
	getCandlesticks: getCandlesticks
};


function trade(ticks, multiplier) {
  var margin, movingAvg, price, color;
  for (var i = 1; i < ticks.length; i++) {
    price = ticks[i].close;
    var time = ticks[i].date;
    movingAvg = movingAverage(ticks.slice(0, i));
    margin = movingAvg * multiplier;


    color = getTrendColor(price, movingAvg, margin);
    // console.log("Margin\t", color, movingAvg, margin, [movingAvg-margin, movingAvg+margin]);
    //console.debug(color, ticks[i].date+"\tPRICE: "+price+"\tAVG:"+movingAvg);

    // decide trade
    if (previousColor == 'R' && (color == 'Y' || color == 'G') && previousTrade == 'SELL') {
      //buy
      buy(price, time);
      lastBuy = price;
    }

    if (previousColor == 'G' && (color == 'Y' || color == 'R') && previousTrade == 'BUY') {
      //sell
      var isSellProfitable = price + price * params.tradingFee - lastBuy > 0;
      if (isSellProfitable) {
        sell(price, time);
        checkProfitability = false;
      } else {
        // check next candlesticks for sell profitability
        checkProfitability = true;
      }
    }

    // check next candlesticks for sell profitability
    if (checkProfitability) {
      var isSellProfitable = price + price * params.tradingFee - lastBuy > 0;
      if (isSellProfitable) {
        console.log('FOUND PROFITABLE SELL!');
        sell(price, time);
        checkProfitability = false;
      }
    }

    previousColor = color;

    // for testing only, delete in live
    // if(i == ticks.length-1 && previousTrade == 'BUY'){
    //   console.log('LAST SELL');
    //   sell(price, time);
    // }

  }


  //console.log('EARNED\t', wallet);

	console.debug = function(color, text) {
	  if (color == 'R') {
	    console.log("\x1b[31m%s\x1b[0m", text);
	  }

	  if (color == 'G') {
	    console.log("\x1b[32m%s\x1b[0m", text);
	  }

	  if (color == 'Y') {
	    console.log("\x1b[33m%s\x1b[0m", text);
	  }

	}

}

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
