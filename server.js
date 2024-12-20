const express = require('express');
const axios = require('axios');
const db = require('./database');
const cors = require('cors');
const fs = require('fs');
const { error } = require('console');



require('dotenv').config();

const isDevMode = process.argv.includes('-dev');
const stockPrices = new Set();
const timeSeries = new Set();

console.log(isDevMode);


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.post('/api/stocks', (req, res) => {
    const { symbol, name, shares, purchase_price, date} = req.body;
    const query = 'INSERT INTO stocks (symbol, name, shares, purchase_price, date) VALUES (?, ?, ?, ?, ?)';
    db.run(query, [symbol, name, shares, purchase_price, date],  (err) => {
        if (err) {
            console.log("error");
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/api/stocks', (req, res) => {
    db.all('SELECT * FROM stocks', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ stocks: rows });
    });
});

app.delete('/api/stocks/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM stocks WHERE id = ?';
    db.run(query, id,  (err) => {
        if (err) {
        return res.status(500).json({ error: err.message });
        }
        res.json({ deletedID: id });
    });
});

// Get stock price data from Alpha Vantage
app.get('/api/stock-price/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const output_file = `./stock-price-data/${symbol}StockPrice.json`;

    try{
        if (isDevMode && stockPrices.has(symbol)) {
            console.log(`getting ${symbol} stock price from cache`);
            const data = fs.readFileSync(output_file, 'utf8');
            res.json(JSON.parse(data));
           
        } else {
            const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
            const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${apiKey}`;
            console.log("Calling API");
            const response = await axios.get(apiUrl);
            const timeSeries = response.data['Time Series (1min)'];
            const latestTime = Object.keys(timeSeries)[0];
            const latestPrice = parseFloat(timeSeries[latestTime]['1. open']);
            console.log(latestPrice);
            const resulting_data = { price: latestPrice, symbol };
            fs.writeFileSync(output_file, JSON.stringify(resulting_data, null, 2));
            res.json(resulting_data);
            stockPrices.add(symbol);
           
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
});

app.get('/api/stocks/listing', async (req, res) => {
    
    console.log("Getting all stock pre-requisite data");
    try {
        const data = fs.readFileSync('./stockSymbols.json', 'utf8');
        res.json({ info: JSON.parse(data)});
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
});




app.get('/api/stock-time-series/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const output_file = `./time-series-data/${symbol}TimeSeries.json`;

    try {
        if (isDevMode && timeSeries.has(symbol)) {
            console.log(`Getting ${symbol} time series data from cache`);
            const data = fs.readFileSync(output_file, 'utf8');
            res.json(JSON.parse(data))
        } else {
            const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
            const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
            console.log("getting time series data");
            console.log("Calling API");
            const response = await axios.get(apiUrl);
            console.log(response.data);
            fs.writeFileSync(output_file, JSON.stringify(response.data, null, 2));
            timeSeries.add(symbol);
            res.json(response.data);
           
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
