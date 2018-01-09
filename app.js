var exchange = require('./exchange');

var savings = 'ETH';
var stock = 'NEO';

var wallet = {};
wallet[savings] = 1;
wallet[stock] = 0;

var params = {
  tradePair: stock+savings,
  interval: "1m",
  tradingFee: 0.01,
  multiplier: 0.001
};

var candlesticks = [];

exchange.getCandlesticks(params.tradePair, params.interval, function(ticks){
  console.log(ticks.length);
  candlesticks = ticks;
  trade(candlesticks, 0.001);
})

// exchange.getCandlesticksRealTime(params.tradePair, params.interval, function(tick){
//
//   if(candlesticks.length > 0){
//
//     console.log(exchange.getTicksAverage(candlesticks));
//   }
// });

function trade(ticks, multiplier) {
  var margin, movingAvg, price, color;
  var previousColor = 'Y';
  var checkProfitability = false;
  var previousTrade = 'SELL';

  for (var i = 1; i < ticks.length; i++) {
    price = ticks[i].close;
    var time = ticks[i].date;
    movingAvg = exchange.getTicksAverage(ticks.slice(0, i));
    margin = movingAvg * multiplier;


    color = exchange.getTrendColor(price, movingAvg, margin);
    // console.log("Margin\t", color, movingAvg, margin, [movingAvg-margin, movingAvg+margin]);
    //console.debug(color, ticks[i].date+"\tPRICE: "+price+"\tAVG:"+movingAvg);

    // decide trade
    if (previousColor == 'R' && (color == 'Y' || color == 'G') && previousTrade == 'SELL') {
      //buy
      wallet = exchange.buy(price, time, wallet, savings, stock, params.tradingFee);
      previousTrade = 'BUY';
      lastBuy = price;
    }

    if (previousColor == 'G' && (color == 'Y' || color == 'R') && previousTrade == 'BUY') {
      //sell
      var isSellProfitable = price + price * params.tradingFee - lastBuy > 0;
      if (isSellProfitable) {
        wallet = exchange.sell(price, time, wallet, savings, stock, params.tradingFee);
        previousTrade = 'SELL';
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
        wallet = exchange.sell(price, time, wallet, savings, stock, params.tradingFee);
        previousTrade = 'SELL';
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
