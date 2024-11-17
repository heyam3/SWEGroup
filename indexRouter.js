const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

//database connection
const db = new sqlite3.Database('C:\Users\yasmi\Downloads\Dormify.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

//root route
router.get('/', (req, res) => {
    const user = req.query.user;
    res.send(user + "!");
});


//user route
router.post("/create_user", (req, res) => {
    const { username, email, password } = req.body.user;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required." });
    }

    const sql = `INSERT INTO Customer (user_Name, email, password) VALUES (?, ?, ?)`;
    const params = [username, email, password];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            loggedIn: true,
            status: "User created successfully!",
            userId: this.lastID // Returns the ID of the new user
        });
    });
});

//get all users route
router.get("/users", (_, res) => {
    const sql = `SELECT user_ID, user_Name, email FROM Customer`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


//delete user route
router.delete("/delete", (req,res) => {
   
    const { username, password } = req.body;

    const sql = `DELETE FROM Customer WHERE user_Name = ? AND password = ?`;
    const params = [username, password];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(401).json({ errorStatus: "Credentials did not match" });
            return;
        }
        res.json({ status: "User deleted successfully" });
    });
});

//find user by username route
router.get("/users/:username", (req, res) => {
    const username = req.params.username;

    const sql = `SELECT user_ID, user_Name, email FROM Customer WHERE user_Name = ?`;
    const params = [username];

    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(row);
    });
});




//Retrieve products from the Product table and send them as a response.
router.get('/products', (req, res) => {
    db.all("SELECT * FROM Product", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});





module.exports = router;
