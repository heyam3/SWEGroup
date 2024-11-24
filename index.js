const express = require("express");
const app = express();
const indexRouter = require('./routers/indexRouter');

app.use(express.json());
app.use(indexRouter);

//database connection setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:\Users\yasmi\Downloads\Dormify.db', (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

app.listen(5000, () => {
    console.log("server started on port 5000");
});