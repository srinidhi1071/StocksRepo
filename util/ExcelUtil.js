const fs = require('fs');
const excel = require('exceljs');
const { response } = require('express');
const path = require("path");
const e = require('express');
const date = require('date-and-time');
const html2json = require('html2json').html2json;
var HTMLParser = require('node-html-parser');
const cheerio = require("cheerio");

function writeNSEHistoricDataIntoExcelFile(symbol, jsonRespone) {
    console.log(`Checking if file ${symbol}.xlsx exists`)
    try {
        if (fs.existsSync(path.resolve(__dirname, `../stocks_excel/${symbol}.xlsx`))) {
            console.log(`The file ${symbol}.xlsx exists`);
            upDateExistingWorkbook(symbol, jsonRespone)
                .then(() => {
                    console.log(`Successfully completed maintaining the file ${symbol}.xlsx`);
                })

        } else {
            console.log(`The file ${symbol}.xlsx does not exists, Trying to create file with name ${symbol}.xlsx`)
            let newWorkBook = createNewWorkBook(symbol)
            const workSheet = newWorkBook.getWorksheet("My Sheet")
            console.log(`Created file with name ${symbol}.xlsx`)
            writeArrayDataIntoWorkBook(workSheet, jsonRespone)
            newWorkBook.xlsx.writeFile(`./stocks_excel/${symbol}.xlsx`)
            console.log(`Successfully created new file and stored at "../stocks_excel/${symbol}.xlsx"`)
        }
    } catch (err) {
        console.error(err);
    }
}

function writeArrayDataIntoWorkBook(workSheet, jsonResponeData) {
    console.log(`Writing Data into file`)
    jsonResponeData.forEach(element => {
        workSheet.addRow({
            date: element.CH_TIMESTAMP,
            symbol: element.CH_SYMBOL,
            series: element.CH_SERIES,
            open: element.CH_OPENING_PRICE,
            close: element.CH_CLOSING_PRICE,
            high: element.CH_TRADE_HIGH_PRICE,
            low: element.CH_TRADE_LOW_PRICE,
            prevclose: element.CH_PREVIOUS_CLS_PRICE,
            ltp: element.CH_LAST_TRADED_PRICE,
            vwap: element.VWAP,
            wh: element.CH_52WEEK_HIGH_PRICE,
            wl: element.CH_52WEEK_LOW_PRICE,
            volume: element.CH_TOT_TRADED_QTY,
            value: element.CH_TOT_TRADED_VAL,
            nooftrades: element.CH_TOTAL_TRADES
        });
    });
    console.log(`Successfuly completed writing Data into file`)
}

async function upDateExistingWorkbook(symbol, jsonResponeData) {
    const workBook = new excel.Workbook();
    await workBook.xlsx.readFile(`./stocks_excel/${symbol}.xlsx`)
    let workSheet = workBook.getWorksheet("My Sheet")
    setExcelHeaders(workSheet)
    console.log("Checking file if it is up to date")
    if (checkIfUpdateRequired(workSheet)) {
        console.log("File is not updated")
        let checkforUpdate = checkIfUpdateAvailable(jsonResponeData)
        console.log("Checking NSE India for today's updates")
        if (checkforUpdate.isUpdateAvailable) {
            console.log("Updates are available for today, trying to update the file now.....")
            writeArrayDataIntoWorkBook(workSheet, checkforUpdate.data)
        }
        else {
            console.log(`No Updates are available today in NSE India , Try again later`)
        }
    } else {
        console.log(`File ${symbol}.xlsx is Up To Date`)
    }
    workBook.xlsx.writeFile(`./stocks_excel/${symbol}.xlsx`)
}

function checkIfUpdateAvailable(jsonResponeData) {
    let todaysDate = getTodaysDate()
    let filteredDate = jsonResponeData.filter(record => {
        return record.CH_TIMESTAMP == todaysDate
    })

    let result = {
        isUpdateAvailable: filteredDate.length >= 1,
        data: filteredDate
    }
    return result
}

function checkIfUpdateRequired(workSheet) {
    let todaysDate = getTodaysDate()
    let isUpdateRequired = true;
    let lastEntryDate = date.format(new Date(workSheet.getRow(workSheet.actualRowCount).getCell(1)), 'YYYY-MM-DD')
    if (lastEntryDate == todaysDate) {
        isUpdateRequired = false
    }
    return isUpdateRequired;
}

function getTodaysDate() {
    const now = new Date();
    let todaysDate = date.format(now, 'YYYY-MM-DD');
    return todaysDate;
}

function createNewWorkBook(symbol) {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");
    setExcelHeaders(worksheet)
    return workbook;
}

function setExcelHeaders(worksheet) {
    worksheet.columns = [
        {
            header: 'Date', key: 'date', width: 15, style: {
                font: { bold: true }
            }
        },
        { header: 'Symbol', key: 'symbol', width: 10 },
        { header: 'Series', key: 'series', width: 10 },
        { header: 'Open', key: 'open', width: 10 },
        { header: 'High', key: 'high', width: 10 },
        { header: 'Low', key: 'low', width: 10 },
        { header: 'Prev.Close', key: 'prevclose', width: 10 },
        { header: 'LTP', key: 'ltp', width: 10 },
        { header: 'VWAP', key: 'vwap', width: 10 },
        { header: 'Close', key: 'close', width: 10 },
        { header: '52W H', key: 'wh', width: 10 },
        { header: '52W L', key: 'wl', width: 10 },
        { header: 'Volume', key: 'volume', width: 10 },
        { header: 'Value', key: 'value', width: 15 },
        { header: 'No of Trades', key: 'nooftrades', width: 12 },
        { header: 'Deliverable Qty', key: 'deliverableQty', width: 15 },
        { header: '% Dly Qt to Traded Qty', key: 'qtoTradeQty', width: 15 },
        { header: "Space", key: 'space', width: 10 },
        { header: 'Date_1', key: 'date1', width: 15 },
        { header: 'Expiry Date 1', key: 'expiry_date_1', width: 15 },
        { header: 'Option Type 1', key: 'optionType1', width: 15 },
        { header: 'Strike Price 1', key: 'strikePrice1', width: 15 },
        { header: 'Open Price 1', key: 'openPrice1', width: 15 },
        { header: 'High Price 1', key: 'highPrice1', width: 15 },
        { header: 'Low Price 1', key: 'lowPrice1', width: 15 },
        { header: 'Close Price 1', key: 'closePrice1', width: 15 },
        { header: 'Last Price 1', key: 'lastPrice1', width: 15 },
        { header: 'Settle Price 1', key: 'settlePrice1', width: 15 },
        { header: 'Volumn 1', key: 'volumn1', width: 15 },
        { header: 'Value 1', key: 'value1', width: 15 },
        { header: 'Premium Value 1', key: 'premiumValue1', width: 15 },
        { header: 'Open Interest 1', key: 'openInterest1', width: 15 },
        { header: 'Change in OI 1', key: 'changeInOI1', width: 15 },
        { header: "Space", key: 'space', width: 10 },
        { header: 'Date 2', key: 'date2', width: 15 },
        { header: 'Expiry Date 2', key: 'expiry_date_2', width: 15 },
        { header: 'Option Type 2', key: 'optionType2', width: 15 },
        { header: 'Strike Price 2', key: 'strikePrice2', width: 15 },
        { header: 'Open Price 2', key: 'openPrice2', width: 15 },
        { header: 'High Price 2', key: 'highPrice2', width: 15 },
        { header: 'Low Price 2', key: 'lowPrice2', width: 15 },
        { header: 'Close Price 2', key: 'closePrice2', width: 15 },
        { header: 'Last Price 2', key: 'lastPrice2', width: 15 },
        { header: 'Settle Price 2', key: 'settlePrice2', width: 15 },
        { header: 'Volumn 2', key: 'volumn2', width: 15 },
        { header: 'Value 2', key: 'value2', width: 15 },
        { header: 'Premium Value 2', key: 'premiumValue2', width: 15 },
        { header: 'Open Interest 2', key: 'openInterest2', width: 15 },
        { header: 'Change in OI 2', key: 'changeInOI2', width: 15 },
        { header: 'Date ', key: 'dateFinal', width: 15 },
        { header: 'Price ', key: 'price', width: 15 },
        { header: 'Delivery Value ', key: 'deliveryValue', width: 15 },
        { header: '5 Day Avg Del ', key: 'fiveAverageDel', width: 15 },
        { header: 'Cumm Open Interest ', key: 'cummOpenInterest', width: 15 },
        { header: 'OI ', key: 'oi', width: 15 },
        { header: 'Space', key: 'space', width: 15 },
        { header: '% Price ', key: 'perPrice', width: 15 },
        { header: '% Delivery ', key: 'perDel', width: 15 },
        { header: '% OI ', key: 'perOi', width: 15 },
        { header: 'Space', key: 'space', width: 15 },
        { header: 'Short Covering ', key: 'sc', width: 15 },
        { header: 'Long Build Up', key: 'lbu', width: 15 },
        { header: 'Short Build Up', key: 'sbu', width: 15 },
        { header: 'Long unwinding', key: 'luw', width: 15 },
        { header: 'Space', key: 'space', width: 15 },
        { header: 'F_VWAP', key: 'fvwap', width: 15 },
        { header: 'F_HIGH', key: 'fhigh', width: 15 },
        { header: 'F_LOW', key: 'flow', width: 15 },
        { header: 'F_CLOSE', key: 'fclose', width: 15 }
    ];

    formatHeaders(worksheet)

}

function writeSecurityWiseArchivesIntoExcelFile(symbol, htmlResponse) {
    let jsonRespone = convertHTMLintoJSON(htmlResponse)
    console.log(`Checking if file ${symbol}.xlsx exists`)
    try {
        if (fs.existsSync(path.resolve(__dirname, `../stocks_excel/${symbol}.xlsx`))) {
            console.log(`The file ${symbol}.xlsx exists, Adding Today's Security Wise Archives`);
            writeSWADataintoExcel(symbol, jsonRespone)
        } else {
            console.log(`The file ${symbol}.xlsx does not exists, Will not update Security Wise Achives Data for ${symbol}`)

        }
    } catch (err) {
        console.error(err);
    }
}

async function writeSWADataintoExcel(symbol, jsonData) {
    const workBook = new excel.Workbook();
    await workBook.xlsx.readFile(`./stocks_excel/${symbol}.xlsx`)
    let workSheet = workBook.getWorksheet("My Sheet")
    setExcelHeaders(workSheet)
    for (var i = 1; i <= workSheet.actualRowCount; i++) {
        let curDate = date.format((new Date(workSheet.getRow(i).getCell(1).value)), "YYYY-MM-DD")
        if (curDate == jsonData.date) {
            workSheet.getRow(i).getCell(16).value = jsonData.deliverableQty
            workSheet.getRow(i).getCell(17).value = jsonData.tradedQty
        }
    }
    workBook.xlsx.writeFile(`./stocks_excel/${symbol}.xlsx`)
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

function writeDerivativesIntoExcelFile(symbol, jsonRespone) {
    console.log(`Checking if file ${symbol}.xlsx exists`)
    try {
        if (fs.existsSync(path.resolve(__dirname, `../stocks_excel/${symbol}.xlsx`))) {
            console.log(`The file ${symbol}.xlsx exists, Adding Today's Derivatives All Historic Data`);
            writeDerivativesDataintoExcel(symbol, jsonRespone)
        } else {
            console.log(`The file ${symbol}.xlsx does not exists, Will not update Security Wise Achives Data for ${symbol}`)

        }
    } catch (err) {
        console.error(err);
    }
}

async function writeDerivativesDataintoExcel(symbol, jsonData) {
    let respOne = jsonData.responseOne[0]
    let respTwo = jsonData.responseTwo[0]
    let dateOne = date.format(new Date(respOne.FH_TIMESTAMP), "YYYY-MM-DD")
    let dateTwo = date.format(new Date(respTwo.FH_TIMESTAMP), "YYYY-MM-DD")
    const workBook = new excel.Workbook();
    await workBook.xlsx.readFile(`./stocks_excel/${symbol}.xlsx`)
    let workSheet = workBook.getWorksheet("My Sheet")
    setExcelHeaders(workSheet)
    for (var i = 1; i <= workSheet.actualRowCount; i++) {
        let curDate = date.format((new Date(workSheet.getRow(i).getCell(1).value)), "YYYY-MM-DD")
        if (curDate == dateOne) {
            workSheet.getRow(i).getCell(19).value = respOne.FH_TIMESTAMP
            workSheet.getRow(i).getCell(20).value = respOne.FH_EXPIRY_DT
            workSheet.getRow(i).getCell(21).value = respOne.FH_OPTION_TYPE
            workSheet.getRow(i).getCell(22).value = respOne.FH_STRIKE_PRICE
            workSheet.getRow(i).getCell(23).value = respOne.FH_OPENING_PRICE
            workSheet.getRow(i).getCell(24).value = respOne.FH_TRADE_HIGH_PRICE
            workSheet.getRow(i).getCell(25).value = respOne.FH_TRADE_LOW_PRICE
            workSheet.getRow(i).getCell(26).value = respOne.FH_CLOSING_PRICE
            workSheet.getRow(i).getCell(27).value = respOne.FH_LAST_TRADED_PRICE
            workSheet.getRow(i).getCell(28).value = respOne.FH_SETTLE_PRICE
            workSheet.getRow(i).getCell(29).value = respOne.FH_TOT_TRADED_QTY
            workSheet.getRow(i).getCell(30).value = respOne.FH_TOT_TRADED_VAL
            workSheet.getRow(i).getCell(31).value = respOne.FH_TOT_TRADED_VAL
            workSheet.getRow(i).getCell(32).value = respOne.FH_OPEN_INT
            workSheet.getRow(i).getCell(33).value = respOne.FH_CHANGE_IN_OI
            workSheet.getRow(i).getCell(35).value = respTwo.FH_TIMESTAMP
            workSheet.getRow(i).getCell(36).value = respTwo.FH_EXPIRY_DT
            workSheet.getRow(i).getCell(37).value = respTwo.FH_OPTION_TYPE
            workSheet.getRow(i).getCell(38).value = respTwo.FH_STRIKE_PRICE
            workSheet.getRow(i).getCell(39).value = respTwo.FH_OPENING_PRICE
            workSheet.getRow(i).getCell(40).value = respTwo.FH_TRADE_HIGH_PRICE
            workSheet.getRow(i).getCell(41).value = respTwo.FH_TRADE_LOW_PRICE
            workSheet.getRow(i).getCell(42).value = respTwo.FH_CLOSING_PRICE
            workSheet.getRow(i).getCell(43).value = respTwo.FH_LAST_TRADED_PRICE
            workSheet.getRow(i).getCell(44).value = respTwo.FH_SETTLE_PRICE
            workSheet.getRow(i).getCell(45).value = respTwo.FH_TOT_TRADED_QTY
            workSheet.getRow(i).getCell(46).value = respTwo.FH_TOT_TRADED_VAL
            workSheet.getRow(i).getCell(47).value = respTwo.FH_TOT_TRADED_VAL
            workSheet.getRow(i).getCell(48).value = respTwo.FH_OPEN_INT
            workSheet.getRow(i).getCell(49).value = respTwo.FH_CHANGE_IN_OI
            workSheet.getRow(i).getCell('dateFinal').value = { formula: `A${i}` };
            workSheet.getRow(i).getCell('price').value = { formula: `J${i}` };
            workSheet.getRow(i).getCell('deliveryValue').value = { formula: `I${i}*P${i}/10000000` };
            workSheet.getRow(i).getCell('fiveAverageDel').value = { formula: `AVERAGE(AZ${i - 5}:AZ${i - 1})` };
            workSheet.getRow(i).getCell('cummOpenInterest').value = { formula: `AF${i}+AV${i}` };
            workSheet.getRow(i).getCell('oi').value = { formula: `BB${i}-BB${i - 1}` };
            workSheet.getRow(i).getCell('perPrice').value = { formula: `AY${i}-AY${i - 1}-1` };
            workSheet.getRow(i).getCell('perDel').value = { formula: `AZ${i}/BA${i}` };
            workSheet.getRow(i).getCell('perOi').value = { formula: `BB${i}-BB${i - 1}-1` };
            workSheet.getRow(i).getCell('sc').value = { formula: `IF(BE${i}>0,IF(BG${i}<0,BC${i},""),"")` };
            workSheet.getRow(i).getCell('lbu').value = { formula: `IF(BE${i}>0,IF(BG${i}>0,BC${i},""),"")` };
            workSheet.getRow(i).getCell('sbu').value = { formula: `IF(BE${i}<0,IF(BG${i}>0,BC${i},""),"")` };
            workSheet.getRow(i).getCell('luw').value = { formula: `IF(BE${i}<0,IF(BG${i}<0,BC${i},""),"")` };
            workSheet.getRow(i).getCell('fvwap').value = { formula: `I${i}` };
            workSheet.getRow(i).getCell('fhigh').value = { formula: `E${i}` };
            workSheet.getRow(i).getCell('flow').value = { formula: `F${i}` };
            workSheet.getRow(i).getCell('fclose').value = { formula: `J${i}` };


        }
    }
    workBook.xlsx.writeFile(`./stocks_excel/${symbol}.xlsx`)
}

function formatHeaders(worksheet) {
    for (var i = 1; i <= 60; i++) {
        worksheet.getRow(1).getCell(i).style = { font: { color: { argb: 'ffffff' } } };
        worksheet.getRow(1).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'bd8853' },
            bgColor: { argb: 'bd8853' }
        };;
    }

    for (var i = 61; i <= worksheet.actualColumnCount; i++) {
        worksheet.getRow(1).getCell(i).style = { font: { bold: true, color: { argb: 'ffffff' } } };
        worksheet.getRow(1).getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '3c32a8' },
            bgColor: { argb: '3c32a8' }
        };;
    }

}

module.exports = {
    writeNSEHistoricDataIntoExcelFile,
    writeSecurityWiseArchivesIntoExcelFile,
    writeDerivativesIntoExcelFile
}