const exchange = require("./exchange");
const ta = require("./technicalanalysis");

const base = "USDT";
const stock = "ETH";

// exchange.scanMarket("USDT", "1h");
exchange.getCandlesticks("LTOUSDT", "1h");
