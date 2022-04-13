const DynamoDB = require('../db/docdb')
const { config } = require('../config/config')
const date = require('date-and-time');
const configNode = require('../util/ConfigNode')
var promiseRetry = require('promise-retry');


function processStocksData(historicData, swa, derivOne, derivTwo) {
    return new Promise((resolve, reject) => {
        let stocksData = {}
        stocksData.timeStamp = new Date().toISOString()
        stocksData.date = historicData.CH_TIMESTAMP
        stocksData.series = historicData.CH_SERIES
        stocksData.symbol = historicData.CH_SYMBOL
        stocksData.open = historicData.CH_OPENING_PRICE
        stocksData.high = historicData.CH_TRADE_HIGH_PRICE
        stocksData.low = historicData.CH_TRADE_LOW_PRICE
        stocksData.prevClose = historicData.CH_PREVIOUS_CLS_PRICE
        stocksData.ltp = historicData.CH_LAST_TRADED_PRICE
        stocksData.close = historicData.CH_CLOSING_PRICE
        stocksData.vwap = historicData.VWAP
        stocksData.wh52 = historicData.CH_52WEEK_HIGH_PRICE
        stocksData.wl52 = historicData.CH_52WEEK_LOW_PRICE
        stocksData.volume = historicData.CH_TOT_TRADED_QTY
        stocksData.value = historicData.CH_TOT_TRADED_VAL
        stocksData.noOfTrades = historicData.CH_TOTAL_TRADES
        stocksData.delQty = getNumber(swa.deliverableQty)
        stocksData.delQtyToTrdQty = getNumber(swa.tradedQty)

        stocksData.expiryDt1 = derivOne.FH_EXPIRY_DT
        stocksData.optionType1 = derivOne.FH_OPTION_TYPE
        stocksData.strikePrice1 = Number(derivOne.FH_STRIKE_PRICE)
        stocksData.openPrice1 = Number(derivOne.FH_OPENING_PRICE)
        stocksData.highPrice1 = Number(derivOne.FH_TRADE_HIGH_PRICE)
        stocksData.lowPrice1 = Number(derivOne.FH_TRADE_LOW_PRICE)
        stocksData.closePrice1 = Number(derivOne.FH_CLOSING_PRICE)
        stocksData.lastPrice1 = Number(derivOne.FH_LAST_TRADED_PRICE)
        stocksData.settlePrice1 = Number(derivOne.FH_SETTLE_PRICE)
        stocksData.volume1 = Number(derivOne.FH_TOT_TRADED_QTY)
        stocksData.value1 = Number(derivOne.FH_TOT_TRADED_VAL)
        stocksData.premValue1 = Number(derivOne.CALCULATED_PREMIUM_VAL)
        stocksData.openInterest1 = Number(derivOne.FH_OPEN_INT)
        stocksData.changeInOI1 = Number(derivOne.FH_CHANGE_IN_OI)

        stocksData.expiryDt2 = derivTwo.FH_EXPIRY_DT
        stocksData.optionType2 = derivTwo.FH_OPTION_TYPE
        stocksData.strikePrice2 = Number(derivTwo.FH_STRIKE_PRICE)
        stocksData.openPrice2 = Number(derivTwo.FH_OPENING_PRICE)
        stocksData.highPrice2 = Number(derivTwo.FH_TRADE_HIGH_PRICE)
        stocksData.lowPrice2 = Number(derivTwo.FH_TRADE_LOW_PRICE)
        stocksData.closePrice2 = Number(derivTwo.FH_CLOSING_PRICE)
        stocksData.lastPrice2 = Number(derivTwo.FH_LAST_TRADED_PRICE)
        stocksData.settlePrice2 = Number(derivTwo.FH_SETTLE_PRICE)
        stocksData.volume2 = Number(derivTwo.FH_TOT_TRADED_QTY)
        stocksData.value2 = Number(derivTwo.FH_TOT_TRADED_VAL)
        stocksData.premValue2 = Number(derivTwo.CALCULATED_PREMIUM_VAL)
        stocksData.openInterest2 = Number(derivTwo.FH_OPEN_INT)
        stocksData.changeInOI2 = Number(derivTwo.FH_CHANGE_IN_OI)
        stocksData.deliveryValue = (stocksData.delQty * stocksData.vwap) / 10000000
        calculateStocksData(historicData.CH_SYMBOL, stocksData.deliveryValue)
            .then((response) => {
                stocksData.fiveDayAvgDel = response.fiveDayDelValueAverage
                stocksData.CummOI = stocksData.openInterest1 + stocksData.openInterest2
                stocksData.OI = stocksData.CummOI - response.previousDayCummOI
                stocksData.percentagePrice = response.previousDayClose == 0 ? 0 : (stocksData.close / response.previousDayClose) - 1
                stocksData.percentageDelivery = stocksData.fiveDayAvgDel == 0 ? 0 : stocksData.deliveryValue / stocksData.fiveDayAvgDel
                stocksData.percentageOI = response.previousDayCummOI == 0 ? 0 : (stocksData.CummOI / response.previousDayCummOI) - 1
                stocksData.shortCovering = calculateshortCovering(stocksData.percentagePrice, stocksData.percentageOI, stocksData.OI)
                stocksData.longBuildUp = calculateLongBuildUp(stocksData.percentagePrice, stocksData.percentageOI, stocksData.OI)
                stocksData.shortBuildUp = calculateShortBuildUp(stocksData.percentagePrice, stocksData.percentageOI, stocksData.OI)
                stocksData.longUnwinding = calculateLongunwinding(stocksData.percentagePrice, stocksData.percentageOI, stocksData.OI)
                resolve(stocksData)
            })
            .catch(error => {
                reject(error)
            })
    })
}

function calculateStocksData(symbol, todaysDeliveryValue) {
    return new Promise((resolve, reject) => {
        try {

            let dynamoDB = new DynamoDB(config.databaseConfig.accessKeyId, config.databaseConfig.secretAccessKey, config.databaseConfig.endpoint)
            var params = {
                TableName: config.databaseConfig.tableName,
                FilterExpression: "#symb = :sym",
                ExpressionAttributeNames: {
                    "#symb": "symbol",
                },
                ExpressionAttributeValues: {
                    ":sym": symbol
                }
            }

            promiseRetry(function (retry, number) {
                console.log('attempt number for findAll', number);

                return dynamoDB.findAll(params)
                    .catch(function (err) {
                        console.log("err in findAll", err)
                        if (err.code) {
                            retry(err);
                        }

                        throw err;
                    });
            })
                .then(function (resp) {
                    let calculatedStocksData = {}
                    let sortedResponse = sortDbResponseByDate(resp)
                    calculatedStocksData.fiveDayDelValueAverage = getFiveDayAverageOfDeliveryValue(sortedResponse, todaysDeliveryValue)
                    calculatedStocksData.previousDayCummOI = getPreviousDayCummOI(sortedResponse)
                    calculatedStocksData.previousDayClose = getPreviousDayClose(sortedResponse)
                    resolve(calculatedStocksData)
                }, function (err) {
                    reject(err)
                });
        }
        catch (error) {
            reject(error)
        }
    })
}

function getFiveDayAverageOfDeliveryValue(sortedResponse, todaysDeliveryValue) {
    if (sortedResponse.length > 0) {
        let sum = 0
        let count = sortedResponse.length >= 5 ? 5 : sortedResponse.length
        for (let rowCount = 0; rowCount < count - 1; rowCount++) {
            if (sortedResponse[rowCount].deliveryValue != undefined) {
                sum = sum + sortedResponse[rowCount].deliveryValue
            }
            else {
                sum = sum + 0
            }
        }
        sum = sum + todaysDeliveryValue
        let average = sum / count
        return average
    } else {
        return 0
    }
}

function getPreviousDayCummOI(sortedResponse) {
    if (sortedResponse.length > 0) {
        if (sortedResponse[0].CummOI != undefined) {
            return sortedResponse[0].CummOI
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }
}

function getPreviousDayClose(sortedResponse) {
    if (sortedResponse.length > 0) {
        if (sortedResponse[0].close != undefined) {
            return sortedResponse[0].close
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }
}

// function to sort the dates according to the descending order
function sortDbResponseByDate(dbResp) {
    dbResp.sort(function (a, b) {
        return Number(new Date(b.date)) - Number(new Date(a.date))
    })
    return dbResp
}

// function to sort the dates according to the descending order
function sortDbResponseByDateAscending(dbResp) {
    dbResp.sort(function (a, b) {
        return Number(Number(new Date(b.date) - new Date(a.date)))
    })
    return dbResp
}

function calculateshortCovering(percentagePrice, percentageOI, OI) {
    if (percentagePrice > 0) {
        if (percentageOI < 0) {
            return OI
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }

}

function calculateLongBuildUp(percentagePrice, percentageOI, OI) {
    if (percentagePrice > 0) {
        if (percentageOI > 0) {
            return OI
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }

}

function calculateShortBuildUp(percentagePrice, percentageOI, OI) {
    if (percentagePrice < 0) {
        if (percentageOI > 0) {
            return OI
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }

}

function calculateLongunwinding(percentagePrice, percentageOI, OI) {
    if (percentagePrice < 0) {
        if (percentageOI < 0) {
            return OI
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }

}

function getNumber(number) {
    return Number(number.replace(/,/g, ""))
}

function checkTodaysUpdateIsRequired(symbol) {
    return new Promise((resolve, reject) => {
        try {

            let dynamoDB = new DynamoDB(config.databaseConfig.accessKeyId, config.databaseConfig.secretAccessKey, config.databaseConfig.endpoint)
            var params = {
                TableName: config.databaseConfig.tableName,
                FilterExpression: "#dt = :todaysDate and #symb = :symbol",
                ExpressionAttributeNames: {
                    "#dt": "date",
                    "#symb": "symbol"
                },
                ExpressionAttributeValues: {
                    ":todaysDate": getTodaysDate(),
                    ":symbol": symbol
                }
            }

            // Simple example
            promiseRetry(function (retry, number) {
                console.log('attempt number for find', number);
                return dynamoDB.find(params)
                    .catch(err => {
                        console.log("Error in find Operation", err)
                        if (err.code) {
                            retry(err);
                        }
                    });
            })
                .then(function (resp) {
                    console.log("resp Count :: ", resp.length)
                    if (resp.length >= 1) {
                        resolve(false)
                    }
                    else {
                        resolve(true)
                    }
                }, function (err) {
                    reject(err)
                });
        }
        catch (error) {
            reject(error)
        }
    })

}

function insertStocksDataIntoDB(processedStocksData) {
    return new Promise((resolve, reject) => {
        try {
            var params = {
                TableName: config.databaseConfig.tableName,
                Item: processedStocksData
            };
            let dynamoDB = new DynamoDB(config.databaseConfig.accessKeyId, config.databaseConfig.secretAccessKey, config.databaseConfig.endpoint)


            promiseRetry(function (retry, number) {
                console.log('attempt number for insertOne', number);

                return dynamoDB.insertOne(params)
                    .catch(function (err) {
                        console.log("err in insertOne", err)
                        if (err.code) {
                            retry(err);
                        }
                        throw err;
                    });
            })
                .then(function (resp) {
                    resolve(resp)
                }, function (err) {
                    reject(err)
                });
        }
        catch (error) {
            reject(error)
        }

    })
}

function getTodaysDate() {
    const now = configNode.getDate();
    let todaysDate = date.format(now, 'YYYY-MM-DD');
    return todaysDate;
}

function getStockDataByTicker(symbol) {
    return new Promise((resolve, reject) => {
        try {

            let dynamoDB = new DynamoDB(config.databaseConfig.accessKeyId, config.databaseConfig.secretAccessKey, config.databaseConfig.endpoint)
            var params = {
                TableName: config.databaseConfig.tableName,
                FilterExpression: "#symb = :sym",
                ExpressionAttributeNames: {
                    "#symb": "symbol",
                },
                ExpressionAttributeValues: {
                    ":sym": symbol
                }
            }

            promiseRetry(function (retry, number) {
                console.log('attempt number for findAll in getStockDataByTicker', number);

                return dynamoDB.findAll(params)
                    .catch(function (err) {
                        console.log("err in findAll", err)
                        if (err.code) {
                            retry(err);
                        }

                        throw err;
                    });
            })
                .then(function (resp) {
                    let calculatedStocksData = {}
                    let sortedResponse = sortDbResponseByDateAscending(resp)
                    resolve(sortedResponse)
                }, function (err) {
                    reject(err)
                });
        }
        catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    processStocksData,
    checkTodaysUpdateIsRequired,
    insertStocksDataIntoDB,
    getStockDataByTicker
}