const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize SQLite database
const db = new sqlite3.Database('Dormify.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Serve static files (e.g., CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch all products from the database
app.get('/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Route to serve the content page (HTML)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'content.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:5000`);
});
