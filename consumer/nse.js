const axios = require('axios');
const res = require('express/lib/response');

const NSE_BASE_API = 'https://www.nseindia.com/api';
const STRIKE_RANGE = 300;

const fetchOptionIndecies = async (symbol, expiryDate, res) => {
    try {
        const url = NSE_BASE_API + '/option-chain-indices?symbol=' + symbol;
        const response = await axios.get(url);
        // console.log(response.data);
        var filteredData = parseOptionChainResponse(response.data, expiryDate);
        res.send(prepareResponse( response.data, filteredData));
    } catch (error) {
        console.error('API error: ' + error);
        res.send(error);
    }
};

function prepareResponse(response, filteredData) {
    if (!filteredData) return;
    let calculatedOI = calculateTotalOI(filteredData);
    return {
        'underlyingValue': response.records.underlyingValue,
        'expiryDates' : response.records.expiryDates,
        'timestamp': response.records.timestamp,
        'data': filteredData,
        'totalOI' : calculatedOI.totalOI,
        'totalCIOI' : calculatedOI.totalCIOI
    };
}

function calculateTotalOI(filteredData) {
    let totalOIPE = 0;
    let totalOICE = 0;
    let totalCIOIPE = 0;
    let totalCIOICE = 0;

    filteredData.forEach(data => {
        totalOIPE += data.PE.openInterest;
        totalOICE += data.CE.openInterest;
        totalCIOIPE += data.PE.changeinOpenInterest;
        totalCIOICE += data.CE.changeinOpenInterest;
    });
    return {
        'totalOI' : {
            'PE' : totalOIPE,
            'CE' : totalOICE
        },
        'totalCIOI' : {
            'PE' : totalCIOIPE,
            'CE' : totalCIOICE
        }
    };
}


function parseOptionChainResponse(optionChainResponse, expiryDate) {
    var optionData = [];
    if (!optionChainResponse || !optionChainResponse.records) {
        return;
    }

    expiryDate = expiryDate || optionChainResponse.records.expiryDates[0];
    const currentValue = optionChainResponse.records.underlyingValue;
    const closedStrikePrice = findClosestStrikePrice(currentValue);

    optionData = optionChainResponse.records.data;
    filteredData = optionData.filter( data => 
        Math.abs(closedStrikePrice - data.strikePrice) <= STRIKE_RANGE && data.expiryDate === expiryDate
    );
    return filteredData;
}

function findClosestStrikePrice(currentValue) {
    return currentValue - (Math.floor(currentValue) % 100 - 50);
}



module.exports = {
    fetchOptionIndecies
};