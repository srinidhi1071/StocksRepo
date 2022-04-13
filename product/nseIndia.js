const { response } = require("express")
const axiosNode = require("../util/AxiosNode")
const excelUtil = require("../util/ExcelUtil")
const configNode = require('../util/ConfigNode')
const date = require('date-and-time');
const cheerio = require("cheerio");



function getTodaysHistoricData(symbol) {
    let config = {
        method: 'get',
        url: `https://www.nseindia.com/api/historical/cm/equity?symbol=${symbol}&series=[%22EQ%22]&from=${getTodaysDate()}&to=${getTodaysDate()}`,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'referer': 'https://www.nseindia.com/get-quotes/equity?symbol=TCS',
        }
    }
    let baseCallConfig = {
        method: 'get',
        url: 'https://www.nseindia.com/get-quotes/equity?symbol=' + symbol,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        }
    }
    return new Promise((resolve, reject) => {
        try {
            axiosNode.axiosCall(baseCallConfig)
                .then((resp) => {
                    let respCookies = resp.headers['set-cookie']
                    config.headers.Cookie = respCookies
                    axiosNode.axiosCall(config)
                        .then(response => {
                            console.log(`getTodaysHistoricData successfully executed`)
                            resolve(response.data)
                        })
                        .catch(error => {
                            if (error) {
                                console.error(`Error in getTodaysHistoricData execution ${JSON.stringify(err)}`)
                                reject(error)

                            }
                            else {
                                reject({ "error": "Error in axios call" })
                            }
                        })
                })
                .catch((err) => {
                    if (err) {
                        console.error(`Error in getTodaysHistoricData execution ${JSON.stringify(err)}`)
                        reject(err)

                    }
                    else {
                        reject({ "error": "Error in axios call" })
                    }
                })
        }
        catch (error) {
            reject({ statusCode: 500, body: error })
        }
    })
}

function getSecurityWiseArchives(symbol) {
    let baseConfig = {
        method: 'get',
        url: 'https://www1.nseindia.com/marketinfo/sym_map/symbolCount.jsp?symbol=' + symbol,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'referer': 'https://www1.nseindia.com/products/content/equities/equities/eq_security.htm',
        }
    }
    return new Promise((resolve, reject) => {
        try {
            getSWAData(baseConfig, symbol)
                .then(response => {
                    let jsonRespone = convertHTMLintoJSON(response)
                    console.log(`getSecurityWiseArchives successfully executed`)
                    resolve(jsonRespone)
                })
                .catch(error => {
                    console.error(`Error in getSecurityWiseArchives execution ${error}`)
                    reject(error)
                })
        }
        catch (error) {
            console.log("Error in updateSecurityWiseArchives")
            reject(error)
        }
    })

}

function getSWAData(baseConfig, symbol) {
    return new Promise((resolve, reject) => {
        try {
            axiosNode.axiosCall(baseConfig)
                .then((resp) => {
                    let respCookies = resp.headers['set-cookie']
                    let innerConfig = {
                        method: 'get',
                        url: `https://www1.nseindia.com/products/dynaContent/common/productsSymbolMapping.jsp?symbol=${symbol}&segmentLink=3&symbolCount=${resp.data}&series=EQ&dateRange=+&fromDate=${getTodaysDate()}&toDate=${getTodaysDate()}&dataType=PRICEVOLUMEDELIVERABLE`,
                        headers: {
                            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                            'Referer': 'https://www1.nseindia.com/products/content/equities/equities/eq_security.htm'
                        }
                    }
                    innerConfig.headers.Cookie = respCookies
                    axiosNode.axiosCall(innerConfig)
                        .then(response => {
                            console.log(`getSWAData successfully executed`)
                            resolve(response.data)
                        })
                        .catch(error => {
                            console.error(`Error in getSWAData execution ${error}`)
                            reject(error)
                        })
                })
                .catch((err) => {
                    if (err) {
                        console.error(`Error in getSWAData execution ${err}`)
                        reject(err)

                    }
                    else {
                        reject({ "error": "Error in axios call" })
                    }
                })
        }
        catch (error) {
            reject({ statusCode: 500, body: error })
        }
    })
}


function getDerivativesInformation(symbol) {
    let rawDate = configNode.getDate();
    let dateToday = formatDate(rawDate);
    let lastThursday = lastThursdayOfTheMonth(rawDate.getFullYear(), rawDate.getMonth() + 1)
    let lastThursdayNextMonth = lastThursdayOfTheMonth(rawDate.getFullYear(), rawDate.getMonth() + 2)
    if (dateToday > lastThursday) {
        lastThursday = lastThursdayOfTheMonth(rawDate.getFullYear(), rawDate.getMonth() + 2)
        lastThursdayNextMonth = lastThursdayOfTheMonth(rawDate.getFullYear(), rawDate.getMonth() + 3)
    }
    let config1 = {
        method: 'get',
        url: `https://www.nseindia.com/api/historical/fo/derivatives?&from=${dateToday}&to=${dateToday}&expiryDate=${lastThursday}&instrumentType=FUTSTK&symbol=${symbol}`,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'referer': 'https://www.nseindia.com/get-quotes/equity?symbol=' + symbol,
        }
    }

    let config2 = {
        method: 'get',
        url: `https://www.nseindia.com/api/historical/fo/derivatives?&from=${dateToday}&to=${dateToday}&expiryDate=${lastThursdayNextMonth}&instrumentType=FUTSTK&symbol=${symbol}`,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'referer': 'https://www.nseindia.com/get-quotes/equity?symbol=' + symbol,
        }
    }
    return new Promise((resolve, reject) => {
        try {
            getDerivativesData(config1, symbol)
                .then(response => {
                    let derivateResponse = {}
                    derivateResponse.responseOne = response.data[0]
                    getDerivativesData(config2, symbol)
                        .then(response2 => {
                            derivateResponse.responseTwo = response2.data[0]
                            resolve(derivateResponse)
                        })
                        .catch(error => {
                            console.error(`Error in getDerivativesInformation 2 execution ${JSON.stringify(error)}`)
                            reject(error)
                        })
                })
                .catch(error => {
                    console.error(`Error in getDerivativesInformation 1 execution ${JSON.stringify(error)}`)
                    reject(error)
                })
        }
        catch (error) {
            console.log("Error in updateTodaysHistoricData")
        }
    })
}

function getDerivativesData(config, symbol) {
    return new Promise((resolve, reject) => {
        try {
            let baseCallConfig = {
                method: 'get',
                url: 'https://www.nseindia.com/get-quotes/derivatives?symbol=' + symbol,
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                }
            }
            axiosNode.axiosCall(baseCallConfig)
                .then((resp) => {
                    let respCookies = resp.headers['set-cookie']
                    config.headers.Cookie = respCookies
                    axiosNode.axiosCall(config)
                        .then(response => {
                            console.log(`getDerivativesData successfully executed`)
                            resolve(response.data)
                        })
                        .catch(error => {
                            console.error(`Error in getDerivativesData execution ${error}`)
                            reject(error)
                        })
                })
                .catch((err) => {
                    reject(err)
                })
        }
        catch (error) {
            reject({ statusCode: 500, body: error })
        }
    })
}

function formatDate(rawDate) {
    let todaysDate = date.format(rawDate, 'DD-MM-YYYY');
    return todaysDate;
}

function getTodaysDate() {
    const now = configNode.getDate();;
    let todaysDate = date.format(now, 'DD-MM-YYYY');
    return todaysDate;
}

function convertHTMLintoJSON(htmlData) {
    let $ = cheerio.load(htmlData);
    let parsedJson = {
        symbol: $("table tr:nth-child(2) td:nth-child(1)").text(),
        date: date.format(new Date($("table tr:nth-child(2) td:nth-child(3)").text()), 'YYYY-MM-DD'),
        deliverableQty: $("table tr:nth-child(2) td:nth-child(14)").text(),
        tradedQty: $("table tr:nth-child(2) td:nth-child(15)").text()


    }
    return parsedJson
}





function lastThursdayOfTheMonth(year, month) {
    var to_Date = new Date(year, month, 1, 12);
    let weekday = to_Date.getDay();
    let dayDiff = weekday > 4 ? weekday - 4 : weekday + 3;
    to_Date.setDate(to_Date.getDate() - dayDiff);
    return date.format(to_Date, "DD-MMM-YYYY")
    // return to_Date.toDateString();
}

module.exports = {
    getTodaysHistoricData,
    getSecurityWiseArchives,
    getDerivativesInformation
}