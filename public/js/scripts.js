function renderPage() {
    var index = $('#index').find(":selected").text();
    var expiryDate = $('#expiryDate').find(":selected").text();
    fetchOptionChainIndicies(index, expiryDate);
}

function fetchOptionChainIndicies(symbol, expiryDate) {
    $.getJSON('/api/options/' + symbol + '?expiryDate=' + expiryDate, (res, textStatus, jqXHR) => {
        if (res.status) {
            console.log(`Error: ${res.message}, code: ${res.status}`);
            $('#error').append(`Error : ${res.message}`);
            return;
        }
        clearData();
        renderStandardInfo(res, symbol);
        renderTable(res);
        populateExpirateOptions(res.expiryDates);
    });
}

function populateExpirateOptions(expiryDates) {
    $expiryDateSelect = $('#expiryDate');
    expiryDates.forEach((date, index) => {
        $expiryDateSelect.append(`<option value="${date}" ${index == 0 ? 'selected' : ''}>${date}</option>`);
    });
}

function renderStandardInfo(res, symbol) {
    $('#nifty').append(`${symbol} <span class="text-info"> ${res.underlyingValue}</span>`);
    $('#timestamp').append(`Timestamp :  <span class="text-warning"> ${res.timestamp}</span>`);
}

function clearData() {
    $('#error').empty();
    $('#nifty').empty();
    $('#timestamp').empty();
    $('tbody.call-option').empty();
    $('tbody.put-option').empty();
}

function renderTable(res) {
    if (!res || !res.data) return;
    const data = res.data;

    for (var i = 0; i < data.length; i++) {
        $('tbody.call-option').append(constructRow(data[i], 'CE'));
        $('tbody.put-option').append(constructRow(data[i], 'PE'));
    }
    $('tbody.call-option').append(addTotalRow(res.totalOI, res.totalCIOI, 'CE'));
    $('tbody.put-option').append(addTotalRow(res.totalOI, res.totalCIOI, 'PE'));

    $('#' + 'PE-' + findHighestNumber(data, 'PE')).addClass("table-active");
    $('#' + 'CE-' + findHighestNumber(data, 'CE')).addClass("table-active");
}

function constructRow(obj, key) {
    var $tr = $(`<tr id="${key}-${obj.strikePrice}"></tr>`);
    $tr.append('<td class="text-info">' + obj[key].strikePrice + '</td>');
    $tr.append('<td>' + formatPrice(obj[key].lastPrice) + '</td>');
    $tr.append('<td>' + (obj[key].openInterest).toLocaleString('en-IN') + '</td>');
    $tr.append('<td class="' + getAmountClass(obj[key].changeinOpenInterest) + '">' + (obj[key].changeinOpenInterest).toLocaleString('en-IN') + '</td>');

    return $tr;
}

function formatPrice(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function addTotalRow(openInt, changeInOI, key) {
    var $tr = $(`<tr id="${key}-total"></tr>`).addClass('table-active');
    $tr.append('<td>Total </td>');
    $tr.append('<td></td>');
    $tr.append('<td class="text-warning" >' + (openInt[key]).toLocaleString('en-IN') + '</td>');
    $tr.append(`<td class="${getAmountClass(changeInOI[key])}"> ${(changeInOI[key]).toLocaleString('en-IN')} </td>`);

    return $tr;
}

function getAmountClass(value) {
    return value < 0 ? 'text-danger' : 'text-success';
}

function findHighestNumber(arr, key) {
    let maxNum = 0;
    let strikePrice = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key].openInterest > maxNum) {
            maxNum = arr[i][key].openInterest;
            strikePrice = arr[i].strikePrice;
        }
    }
    return strikePrice;
}

function refresh() {
    console.log('Refreshing page data..');
    renderPage();
}

$(document).ready(() => {
    renderPage();

    setInterval(() => refresh(), 3 * 60000);
});