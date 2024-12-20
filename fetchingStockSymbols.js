const fs = require('fs');
require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
const API_URL = `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${apiKey}`;
const OUTPUT_FILE = './stockSymbols.json';

async function fetchStockData() {
  try {
    const response = await axios.get(API_URL);

    // console.log(response.data);

    
    const data = response.data;

    const bundledStocks = data.split("\n");

    console.log(bundledStocks);

    const separatedStocks = [];

    for (let i = 0; i < bundledStocks.length; i++) {
        const [symbol, name, exchange, type, listingDate, ...rest] = bundledStocks[i].split(",");
        separatedStocks.push({
            symbol, name, exchange, type, listingDate
        })
    }
    

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(separatedStocks, null, 2));
    console.log(`Stock data saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchStockData();
