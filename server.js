const express = require('express');
const axios = require('axios');
const db = require('./database');
const cors = require('cors');



require('dotenv').config();



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
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${apiKey}`;
    console.log("Calling API");
    try {
        const response = await axios.get(apiUrl);
        const timeSeries = response.data['Time Series (1min)'];
        const latestTime = Object.keys(timeSeries)[0];
        const latestPrice = parseFloat(timeSeries[latestTime]['1. open']);
        console.log(latestPrice);
        res.json({ price: latestPrice, symbol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




app.get('/api/stock-time-series/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    console.log("getting time series data");
    console.log("Calling API");
    try {
      const response = await axios.get(apiUrl);
      console.log(response.data);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
