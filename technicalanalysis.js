/*
 * Copyright (C) 2016-Present Trendz.
 * MIT Licence.
 */

/**
 Make sure objects below comprise the following fields:
 {
    open: Number,
    high: Number,
    low: Number,
    close: Number
 }*/

function bodyLen(candlestick) {
  return Math.abs(candlestick.open - candlestick.close);
}

function wickLen(candlestick) {
  return candlestick.high - Math.max(candlestick.open, candlestick.close);
}

function tailLen(candlestick) {
  return Math.min(candlestick.open, candlestick.close) - candlestick.low;
}

function isBullish(candlestick) {
  return candlestick.open < candlestick.close;
}

function isBearish(candlestick) {
  return candlestick.open > candlestick.close;
}

function isHammerLike(candlestick) {
  return (
    tailLen(candlestick) > bodyLen(candlestick) * 2 &&
    wickLen(candlestick) < bodyLen(candlestick)
  );
}

function isInvertedHammerLike(candlestick) {
  return (
    wickLen(candlestick) > bodyLen(candlestick) * 2 &&
    tailLen(candlestick) < bodyLen(candlestick)
  );
}

function isEngulfed(shortest, longest) {
  return bodyLen(shortest) < bodyLen(longest);
}

function isGap(lowest, upmost) {
  return (
    Math.max(lowest.open, lowest.close) < Math.min(upmost.open, upmost.close)
  );
}

function isGapUp(previous, current) {
  return isGap(previous, current);
}

function isGapDown(previous, current) {
  return isGap(current, previous);
}

// Dynamic array search for callback arguments.
function findPattern(dataArray, callback) {
  const upperBound = dataArray.length - callback.length + 1;
  const matches = [];

  for (let i = 0; i < upperBound; i++) {
    const args = [];

    // Read the leftmost j values at position i in array.
    // The j values are callback arguments.
    for (let j = 0; j < callback.length; j++) {
      args.push(dataArray[i + j]);
    }

    // Destructure args and find matches.
    if (callback(...args)) {
      matches.push(args[1]);
    }
  }

  return matches;
}

// Boolean pattern detection.
// @public

function isHammer(candlestick) {
  return isBullish(candlestick) && isHammerLike(candlestick);
}

function isInvertedHammer(candlestick) {
  return isBearish(candlestick) && isInvertedHammerLike(candlestick);
}

function isHangingMan(previous, current) {
  return (
    isBullish(previous) &&
    isBearish(current) &&
    isGapUp(previous, current) &&
    isHammerLike(current)
  );
}

function isShootingStar(previous, current) {
  return (
    isBullish(previous) &&
    isBearish(current) &&
    isGapUp(previous, current) &&
    isInvertedHammerLike(current)
  );
}

function isBullishEngulfing(previous, current) {
  return (
    isBearish(previous) && isBullish(current) && isEngulfed(previous, current)
  );
}

function isBearishEngulfing(previous, current) {
  return (
    isBullish(previous) && isBearish(current) && isEngulfed(previous, current)
  );
}

function isBullishHarami(previous, current) {
  return (
    isBearish(previous) && isBullish(current) && isEngulfed(current, previous)
  );
}

function isBearishHarami(previous, current) {
  return (
    isBullish(previous) && isBearish(current) && isEngulfed(current, previous)
  );
}

function isBullishKicker(previous, current) {
  return (
    isBearish(previous) && isBullish(current) && isGapUp(previous, current)
  );
}

function isBearishKicker(previous, current) {
  return (
    isBullish(previous) && isBearish(current) && isGapDown(previous, current)
  );
}

/** MINE */
function approximateEqual(a, b) {
  const left = parseFloat(Math.abs(a - b).toPrecision(4)) * 1;
  const right = parseFloat((a * 0.001).toPrecision(4)) * 1;
  return left <= right;
}

function isDoji(current) {
  const isOpenEqualsClose = approximateEqual(current.open, current.close);
  const isHighEqualsOpen =
    isOpenEqualsClose && approximateEqual(current.open, current.high);
  const isLowEqualsClose =
    isOpenEqualsClose && approximateEqual(current.close, current.low);
  return isOpenEqualsClose && isHighEqualsOpen == isLowEqualsClose;
}

function isThreeWhiteSoldiers(third, previous, current) {
  return (
    isBullish(third) &&
    isBullish(previous) &&
    isBullish(current) &&
    !isDoji(third) &&
    !isDoji(previous) &&
    !isDoji(current)
  );
}

function isThreeBlackCrows(third, previous, current) {
  return (
    isBearish(third) &&
    isBearish(previous) &&
    isBearish(current) &&
    !isDoji(third) &&
    !isDoji(previous) &&
    !isDoji(current)
  );
}

function isBullishThreeLineStrike(fourth, third, previous, current) {
  return (
    isThreeWhiteSoldiers(fourth, third, previous) &&
    isBearish(current) &&
    approximateEqual(current.open, previous.close) &&
    approximateEqual(current.close, fourth.open)
  );
}

function isBearishThreeLineStrike(fourth, third, previous, current) {
  return (
    isThreeBlackCrows(fourth, third, previous) &&
    isBullish(current) &&
    approximateEqual(current.open, previous.close) &&
    approximateEqual(current.close, fourth.open)
  );
}

/**
 * Forecast: bearish continuation
 * Trend prior to the pattern: downtrend
 * Opposite pattern: none
 * 68% accuracy
 */
function isTwoBlackGapping(third, previous, current) {
  return (
    isBearish(third) &&
    isBearish(previous) &&
    isBearish(current) &&
    isGapDown(previous, third)
  );
}

function isEveningStar() {
  //TODO
  return false;
}

function isAbandonedBaby() {
  //TODO
  return false;
}

/** END MINE */

// Pattern detection in arrays.
// @public

function hammer(dataArray) {
  return findPattern(dataArray, isHammer);
}

function invertedHammer(dataArray) {
  return findPattern(dataArray, isInvertedHammer);
}

function hangingMan(dataArray) {
  return findPattern(dataArray, isShootingStar);
}

function shootingStar(dataArray) {
  return findPattern(dataArray, isShootingStar);
}

function bullishEngulfing(dataArray) {
  return findPattern(dataArray, isBullishEngulfing);
}

function bearishEngulfing(dataArray) {
  return findPattern(dataArray, isBearishEngulfing);
}

function bullishHarami(dataArray) {
  return findPattern(dataArray, isBullishHarami);
}

function bearishHarami(dataArray) {
  return findPattern(dataArray, isBearishHarami);
}

function bullishKicker(dataArray) {
  return findPattern(dataArray, isBullishKicker);
}

function bearishKicker(dataArray) {
  return findPattern(dataArray, isBearishKicker);
}

const discoverPattern = ticks => {
  const current = ticks[ticks.length - 1];
  const previous = ticks[ticks.length - 2];
  const third = ticks[ticks.length - 3];
  const fourth = ticks[ticks.length - 4];

  isShootingStar(previous, current) ? console.log("shooting star") : null;
  isBearishEngulfing(previous, current)
    ? console.log("bearish engulfing")
    : null;
  isBearishHarami(previous, current) ? console.log("bearish harami") : null;
  isBearishKicker(previous, current) ? console.log("bearish kicker") : null;
  isBullishEngulfing(previous, current)
    ? console.log("bullish engulfing")
    : null;
  isBullishHarami(previous, current) ? console.log("bullish harami") : null;
  isBullishKicker(previous, current) ? console.log("bullish kicker") : null;
  isHammer(current) ? console.log("hammer") : null;
  isHangingMan(previous, current) ? console.log("hanging man") : null;
  isInvertedHammer(current) ? console.log("inverted hammer") : null;
  isThreeBlackCrows(third, previous, current)
    ? console.log("three black crows")
    : null;
  isThreeWhiteSoldiers(third, previous, current)
    ? console.log("three white soldiers")
    : null;
  isBearishThreeLineStrike(fourth, third, previous, current)
    ? console.log("bearish three line strike")
    : null;
  isBullishThreeLineStrike(fourth, third, previous, current)
    ? console.log("bullish three line strike")
    : null;

  isDoji(current) ? console.log("doji") : null;
  isEveningStar() ? console.log("evening star") : null;
  isAbandonedBaby() ? console.log("abandoned baby") : null;
};

module.exports.isHammer = isHammer;
module.exports.isInvertedHammer = isInvertedHammer;
module.exports.isHangingMan = isHangingMan;
module.exports.isShootingStar = isShootingStar;
module.exports.isBullishEngulfing = isBullishEngulfing;
module.exports.isBearishEngulfing = isBearishEngulfing;
module.exports.isBullishHarami = isBullishHarami;
module.exports.isBearishHarami = isBearishHarami;
module.exports.isBullishKicker = isBullishKicker;
module.exports.isBearishKicker = isBearishKicker;
module.exports.hammer = hammer;
module.exports.invertedHammer = invertedHammer;
module.exports.hangingMan = hangingMan;
module.exports.shootingStar = shootingStar;
module.exports.bullishEngulfing = bullishEngulfing;
module.exports.bearishEngulfing = bearishEngulfing;
module.exports.bullishHarami = bullishHarami;
module.exports.bearishHarami = bearishHarami;
module.exports.bullishKicker = bullishKicker;
module.exports.bearishKicker = bearishKicker;
module.exports.discoverPattern = discoverPattern;
