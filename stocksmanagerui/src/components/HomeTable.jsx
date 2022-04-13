import { React, useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));



function HomeTable() {
    const [tickerData, setTickerData] = useState([]);
    const [ticker, setTicker] = useState("AARTIIND");
    const [open, setOpen] = useState(true);

    useEffect(() => {
        setOpen(true)
        fetch(`/api/getStockData?ticker=${ticker}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw response.json()
            })
            .then(apiData => {
                console.log(apiData)
                setTickerData(apiData)
                setOpen(false)
            })
            .catch(error => {
                console.log("Error fetching data from server : ", error)
                setOpen(false)
            })

    }, [ticker])

    const handleDropDownChange = (event) => {
        setTicker(event.target.value);
    };

    const nextButtonOnClick = (event) => {
        let nextIndex = stocksTickerNameList.indexOf(ticker) + 1
        if (nextIndex < stocksTickerNameList.length) {
            setTicker(stocksTickerNameList[nextIndex]);
        }
    }

    const nextButtonOnPrev = (event) => {
        let nextIndex = stocksTickerNameList.indexOf(ticker) - 1
        if (nextIndex >= 0) {
            setTicker(stocksTickerNameList[nextIndex]);
        }
    }

    const convertToPercentage = (number) => {
        return number * 100
    }

    const isMonthLastThursday = (date) => {

        let todayDate = new Date(date);
        let todayYear = todayDate.getFullYear()
        let todayMonth = todayDate.getMonth()
        var to_Date = new Date(todayYear, todayMonth + 1, 1, 12);
        let weekday = to_Date.getDay();
        let dayDiff = weekday > 4 ? weekday - 4 : weekday + 3;
        to_Date.setDate(to_Date.getDate() - dayDiff);
        if (todayDate.getDate() == to_Date.getDate()) {
            return true
        } else {
            return false
        }
    }

    let stocksTickerNameList = ["AARTIIND", "ABBOTINDIA", "ABFRL", "ACC", "ADANIENT", "ADANIPORTS", "ALKEM", "AMARAJABAT", "AMBUJACEM", "APLLTD", "APOLLOHOSP", "APOLLOTYRE",
        "ASHOKLEY", "ASIANPAINT", "ASTRAL", "AUBANK", "AUROPHARMA", "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BALKRISIND", "BANDHANBNK", "BANKBARODA",
        "BATAINDIA", "BEL", "BERGEPAINT", "BHARATFORG", "BHARTIARTL", "BHEL", "BIOCON", "BOSCHLTD", "BPCL", "BRITANNIA", "CADILAHC", "CANBK", "CANFINHOME",
        "CHOLAFIN", "CIPLA", "COALINDIA", "COFORGE", "COLPAL", "CONCOR", "COROMANDEL", "CROMPTON", "CUB", "CUMMINSIND", "DABUR", "DALBHARAT",
        "DEEPAKNTR", "DELTACORP", "DIVISLAB", "DIXON", "DLF", "DRREDDY", "EICHERMOT", "ESCORTS", "EXIDEIND", "FEDERALBNK", "GAIL",
        "GLENMARK", "GMRINFRA", "GODREJCP", "GODREJPROP", "GRANULES", "GRASIM", "GUJGASLTD", "HAL", "HAVELLS", "HCLTECH", "HDFC", "HDFCAMC", "HDFCBANK", "HDFCLIFE",
        "HEROMOTOCO", "HINDALCO", "HINDPETRO", "HINDUNILVR", "IBULHSGFIN", "ICICIBANK", "ICICIGI", "ICICIPRULI", "IDEA", "IDFCFIRSTB", "IEX", "IGL",
        "INDHOTEL", "INDIACEM", "INDIAMART", "INDIGO", "INDUSINDBK", "INDUSTOWER", "INFY", "IOC", "IPCALAB", "IRCTC", "ITC", "JINDALSTEL", "JKCEMENT",
        "JSWSTEEL", "JUBLFOOD", "KOTAKBANK", "L&TFH", "LALPATHLAB", "LICHSGFIN", "LT", "LTI", "LTTS", "LUPIN", "M&M", "M&MFIN", "MANAPPURAM", "MARICO",
        "MARUTI", "MCDOWELL-N", "MCX", "METROPOLIS", "MFSL", "MGL", "MINDTREE", "MOTHERSUMI", "MPHASIS", "MRF", "MUTHOOTFIN", "NAM-INDIA", "NATIONALUM",
        "NAUKRI", "NAVINFLUOR", "NESTLEIND", "NMDC", "NTPC", "OBEROIRLTY", "OFSS", "ONGC", "PAGEIND", "PEL", "PERSISTENT", "PETRONET", "PFC",
        "PFIZER",
        "PIDILITIND",
        "PIIND",
        "PNB",
        "POLYCAB",
        "POWERGRID",
        "PVR",
        "RAMCOCEM",
        "RBLBANK",
        "RECLTD",
        "RELIANCE",
        "SAIL",
        "SBILIFE",
        "SBIN",
        "SHREECEM",
        "SIEMENS",
        "SRF",
        "SRTRANSFIN",
        "STAR",
        "SUNPHARMA",
        "SUNTV",
        "SYNGENE",
        "TATACHEM",
        "TATACONSUM",
        "TATAMOTORS",
        "TATAPOWER",
        "TATASTEEL",
        "TCS",
        "TECHM",
        "TITAN",
        "TORNTPHARM",
        "TORNTPOWER",
        "TRENT",
        "TVSMOTOR",
        "UBL",
        "ULTRACEMCO",
        "UPL",
        "VEDL",
        "VOLTAS",
        "WIPRO",
        "ZEEL",
    ]


    return (
        <Container maxWidth="xl">
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h1>Stocks Monitor Dashboard</h1>
                    </Grid>
                    <Grid item xs={4}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" onClick={nextButtonOnPrev}>Previous</Button>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel id="demo-simple-select-helper-label">Ticker</InputLabel>
                                <Select
                                    labelId="demo-simple-select-helper-label"
                                    id="demo-simple-select-helper"
                                    value={ticker}
                                    label="Ticker"
                                    onChange={handleDropDownChange}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {stocksTickerNameList.map(tickerName => (<MenuItem value={tickerName}>{tickerName}</MenuItem>))}

                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={nextButtonOnClick}>Next</Button>
                        </Stack>
                    </Grid>
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={open}
                    > <CircularProgress color="inherit" />
                    </Backdrop>
                    <Grid item xs={12}>
                        <TableContainer component={Paper} >
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Date</StyledTableCell>
                                        {/* <StyledTableCell>Symbol</StyledTableCell> */}
                                        <StyledTableCell>Price</StyledTableCell>
                                        <StyledTableCell>Delivery Value</StyledTableCell>
                                        <StyledTableCell>5 Day Avg Del</StyledTableCell>
                                        <StyledTableCell>Cumm OI</StyledTableCell>
                                        <StyledTableCell>OI</StyledTableCell>
                                        <StyledTableCell>% Price</StyledTableCell>
                                        <StyledTableCell>% Delivery</StyledTableCell>
                                        <StyledTableCell>% OI</StyledTableCell>
                                        <StyledTableCell>Short Covering</StyledTableCell>
                                        <StyledTableCell>Long Build Up</StyledTableCell>
                                        <StyledTableCell>Short Build Up</StyledTableCell>
                                        <StyledTableCell>Long Unwinding</StyledTableCell>
                                        <StyledTableCell>VWAP</StyledTableCell>
                                        <StyledTableCell>High</StyledTableCell>
                                        <StyledTableCell>Low</StyledTableCell>
                                        <StyledTableCell>Close</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tickerData.map((row) => (
                                        <StyledTableRow style={{ backgroundColor: isMonthLastThursday(row.date) ? "#0f81d9" : "" }} key={row.name}>
                                            <TableCell component="th" scope="row">
                                                {row.date}
                                            </TableCell>
                                            {/* <TableCell>{row.symbol}</TableCell> */}
                                            <TableCell>{row.close}</TableCell>
                                            <TableCell>{row.deliveryValue.toFixed(2)}</TableCell>
                                            <TableCell>{row.fiveDayAvgDel.toFixed(2)}</TableCell>
                                            <TableCell>{row.CummOI}</TableCell>
                                            <TableCell>{row.OI}</TableCell>
                                            <TableCell style={{ backgroundColor: (row.percentagePrice * 100).toFixed(2) >= 2 ? "#5fd970" : (row.percentagePrice * 100).toFixed(2) <= -2 ? "#fc6a6a" : "" }}>{(row.percentagePrice * 100).toFixed(2)}%</TableCell>
                                            <TableCell style={{ backgroundColor: (row.percentageDelivery * 100).toFixed(2) >= 120 ? "#5fd970" : "" }}>{(row.percentageDelivery * 100).toFixed(2)}%</TableCell>
                                            <TableCell style={{ backgroundColor: (row.percentageOI * 100).toFixed(2) >= 2 ? "#5fd970" : (row.percentageOI * 100).toFixed(2) <= -2 ? "#fc6a6a" : "" }}>{(row.percentageOI * 100).toFixed(2)}%</TableCell>
                                            <TableCell>{row.shortCovering.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.longBuildUp.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.shortBuildUp.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.longUnwinding.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.vwap.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.high.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.low.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{row.close.toLocaleString('en-IN')}</TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Box>
        </Container >
    );
}

export default HomeTable;