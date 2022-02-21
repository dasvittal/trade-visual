const express = require('express');
const router = express.Router();
const nse = require('../consumer/nse');


router.get('/', (req, res) => {
    res.send('Hello');
});

router.get('/:symbol', (req, res) => {
    const { symbol } = req.params;
    const { expiryDate } = req.query;
    console.log('Option request for symbol: ', symbol);
    nse.fetchOptionIndecies(symbol, expiryDate, res);
});


module.exports = router;
