const express = require('express')
const app = express()
// const config = require("./config/config.json")
const nseIndia = require("./product/nseIndia")
const stocksUtil = require("./util/StocksUtil")
const path = require('path');
const cron = require("node-cron");
const cors = require("cors")
const DynamoDB = require('./db/docdb')
app.use(cors())

app.use(express.static(path.resolve(__dirname, '../stocksmanagerui/build')));

async function getTodaysStockDetails(symbol) {

    try {
        let isUpdateRequired = await stocksUtil.checkTodaysUpdateIsRequired(symbol);
        if (isUpdateRequired) {
            let todaysHistoricDataAPIResp = await nseIndia.getTodaysHistoricData(symbol);
            let todaysHistoricData = todaysHistoricDataAPIResp.data[0]
            if (todaysHistoricData != undefined) {
                let todaysSecurityWiseArchives = await nseIndia.getSecurityWiseArchives(symbol);
                if (todaysSecurityWiseArchives.symbol != undefined) {
                    let todaysDerivarivesInformation = await nseIndia.getDerivativesInformation(symbol);
                    if (todaysDerivarivesInformation.responseOne != undefined && todaysDerivarivesInformation.responseTwo != undefined) {
                        let processedStocksData = await stocksUtil.processStocksData(todaysHistoricData, todaysSecurityWiseArchives, todaysDerivarivesInformation.responseOne, todaysDerivarivesInformation.responseTwo)
                        await stocksUtil.insertStocksDataIntoDB(processedStocksData)
                    }
                    else {
                        console.log("Something went wrong with getDerivativesInformation.UPDATING DATA STOPPED")
                    }
                }
                else {
                    console.log("Something went wrong with todaysSecurityWiseArchives.UPDATING DATA STOPPED")
                }
            }
            else {
                console.log("Update Not Available")
            }
        }
        else {
            console.error("Update Not required")
        }
    }
    catch (error) {
        console.error(`getTodaysStockDetails failed ${JSON.stringify(error)}`)
    }
}



let stocksTickerName = ["AARTIIND",
    "ABBOTINDIA",
     "ABFRL", "ACC", "ADANIENT", "ADANIPORTS", "ALKEM", "AMARAJABAT", "AMBUJACEM", "APLLTD", "APOLLOHOSP", "APOLLOTYRE",
    "ASHOKLEY", "ASIANPAINT", "ASTRAL", "AUBANK", "AUROPHARMA", "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BALKRISIND", "BANDHANBNK", "BANKBARODA",
    "BATAINDIA", "BEL", "BERGEPAINT", "BHARATFORG", "BHARTIARTL", "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA", "CADILAHC", "CANBK", "CANFINHOME",
    "CHOLAFIN", "CIPLA", "COALINDIA", "COFORGE", "COLPAL", "CONCOR", "COROMANDEL", "CROMPTON", "CUB", "CUMMINSIND", "DABUR", "DALBHARAT",
    "DEEPAKNTR","DELTACORP",
    "DIVISLAB","DIXON",
    "DLF","DRREDDY",
    "EICHERMOT","ESCORTS","EXIDEIND","FEDERALBNK","GAIL",
    "GLENMARK","GMRINFRA","GODREJCP","GODREJPROP",
    "GRANULES","GRASIM","GUJGASLTD","HAL",
    "HAVELLS","HCLTECH","HDFC","HDFCAMC",
    "HDFCBANK","HDFCLIFE","HEROMOTOCO",
    "HINDALCO","HINDPETRO","HINDUNILVR","IBULHSGFIN","ICICIBANK",
    "ICICIGI","ICICIPRULI","IDEA","IDFCFIRSTB",
    "IEX","IGL","INDHOTEL","INDIACEM",
    "INDIAMART","INDIGO","INDUSINDBK",
    "INDUSTOWER","INFY","IOC","IPCALAB","IRCTC","ITC",
    "JINDALSTEL","JKCEMENT",
    "JSWSTEEL","JUBLFOOD",
    "KOTAKBANK","L%26TFH",
    "LALPATHLAB","LICHSGFIN",
    "LT","LTI","LTTS","LUPIN",
    "M%26M","M%26MFIN",
    "MANAPPURAM","MARICO","MARUTI","MCDOWELL-N",
    "MCX","METROPOLIS","MFSL",
    "MGL","MINDTREE","MOTHERSUMI","MPHASIS",
    "MRF","MUTHOOTFIN",
    "NAM-INDIA","NATIONALUM",
    "NAUKRI","NAVINFLUOR",
    "NESTLEIND","NMDC",
    "NTPC","OBEROIRLTY",
    "OFSS","ONGC",
    "PAGEIND","PEL",
    "PERSISTENT","PETRONET",
    "PFC","PFIZER","PIDILITIND","PIIND","PNB","POLYCAB","POWERGRID",
    "PVR","RAMCOCEM","RBLBANK","RECLTD","RELIANCE","SAIL","SBILIFE","SBIN","SHREECEM","SIEMENS","SRF","SRTRANSFIN",
    "STAR","SUNPHARMA","SUNTV","SYNGENE","TATACHEM","TATACONSUM","TATAMOTORS","TATAPOWER","TATASTEEL","TCS",
    "TECHM","TITAN","TORNTPHARM","TORNTPOWER","TRENT","TVSMOTOR","UBL","ULTRACEMCO","UPL",
    "VEDL",
    "VOLTAS",
    "WIPRO",
    "ZEEL"
]

async function updateAllStocks() {
    for (let i = 0; i < stocksTickerName.length; i++) {
        console.log(`Started Updating Stock for ${stocksTickerName[i]}`)
        await getTodaysStockDetails(stocksTickerName[i])
        console.log(`Updating Completed for ${stocksTickerName[i]}`)
    }
}

// cron.schedule("30 21-22/1 * * *", function () {
//     console.log(`Updating Stocks through CORN job at ${new Date()}`);
//     updateAllStocks()
// });

updateAllStocks()

app.get("/api/getStockData", (req, resp) => {
    let ticker = req.query.ticker
    stocksUtil.getStockDataByTicker(ticker)
        .then(data => {
            resp.status(200).json(data)
        })
        .catch(error => {
            resp.status(400).json({ "errorMessage": error })
        })
})


// app.listen(8080, () => console.log("Listening on port 8080..."))
