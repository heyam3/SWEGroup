const express = require("express");
const app = express();
const indexRouter = require('./routers/indexRouter');
const path = require('path');
const multer = require('multer');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(indexRouter);

const bcrypt = require('bcrypt');


// Static file serving for images
app.use('/images', express.static(path.join(__dirname, 'images')));

//database connection setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/yasmi/Desktop/SWE project 2.0/Dormify.db', (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'images')); // Save to the 'images' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`); // Creates a unique filename
    }
});
const upload = multer({ storage });


app.listen(5000, () => {
    console.log("server started on port 5000");
});
