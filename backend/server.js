const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
// The database file will be created in the backend directory
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create the downloads table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        regNo TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// API endpoint to log a download
app.post('/api/log-download', (req, res) => {
    const { regNo } = req.body;
    
    if (!regNo) {
        return res.status(400).json({ error: 'regNo is required' });
    }

    const sql = `INSERT INTO downloads (regNo) VALUES (?)`;
    db.run(sql, [regNo], function(err) {
        if (err) {
            console.error('Error inserting into database:', err.message);
            return res.status(500).json({ error: 'Failed to log download' });
        }
        res.status(201).json({ message: 'Download logged successfully', id: this.lastID });
    });
});

// API endpoint to retrieve all logs (for admin purposes)
app.get('/api/downloads', (req, res) => {
    const sql = `SELECT * FROM downloads ORDER BY timestamp DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching logs:', err.message);
            return res.status(500).json({ error: 'Failed to fetch logs' });
        }
        res.json({
            total_downloads: rows.length,
            data: rows
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
