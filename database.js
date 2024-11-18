const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./stocks.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      shares INTEGER NOT NULL,
      purchase_price REAL NOT NULL,
      date TEXT NOT NULL
    )
  `);
});

module.exports = db;