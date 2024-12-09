const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const bcrypt = require('bcrypt');

const router = express.Router();

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Adjust path as needed
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });



// Middleware for centralized error handling
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

//database connection
const db = new sqlite3.Database('C:/Users/yasmi/Desktop/SWE project 2.0/Dormify.db', (err) => {
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


//create user route
router.post("/create_user", async (req, res) => {
    const { username, email, password } = req.body.user;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required." });
    }

    try{
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO Customer (user_Name, email, password) VALUES (?, ?, ?)`;
        const params = [username, email, hashedPassword];

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
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

//login route
router.post('/login', async (req, res) => {
    const { username, email, password } = req.body.user;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required." });
    }

    const sql = `SELECT password FROM Customer WHERE user_Name = ?`;
    db.get(sql, [username], async (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }

        try {
            // Compare the provided password with the hashed password
            const match = await bcrypt.compare(password, row.password);
            if (match) {
                res.json({ message: 'Login successful' });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
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
   
    const { username, email, password } = req.body;
    console.log("Received data from Postman:", { username, email, password });

    const sql = `DELETE FROM Customer WHERE user_Name = ? AND email = ? AND password = ?`;
    const params = [username, email, password];

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

// Update user by ID
router.put("/users/:userId", (req, res) => {
    const { userId } = req.params;
    const { userName, email, password } = req.body;

    const sql = `
        UPDATE Customer
        SET 
            user_Name = COALESCE(?, user_Name),
            email = COALESCE(?, email),
            password = COALESCE(?, password)
        WHERE user_ID = ?
    `;
    const params = [userName, email, password, userId];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ message: "User not found or no changes made" });
            return;
        }

        res.json({ status: "User updated successfully", changes: this.changes });
    });
});

// Create a product with an image
router.post('/products', upload.single('image'), (req, res) => {
    const { name, price, description, volume, weight } = req.body;
    const imageUrl = req.file ? `/images/${req.file.filename}` : null; // Save the relative file path

    if (!name || !price || !description || !volume || !weight || !imageUrl) {
        return res.status(400).json({ error: 'All fields, including an image, are required' });
    }

    const sql = `
        INSERT INTO Product (name, price, description, volume, weight, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [name, price, description, volume, weight, imageUrl];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Product added successfully', product_ID: this.lastID });
    });
});

//Delete product route
router.delete('/products/:productId', (req, res) => {
    const { productId } = req.params;

    const sql = `DELETE FROM Product WHERE product_ID = ?`;

    db.run(sql, [productId], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ status: "Product deleted successfully" });
    });
});


//Get product by ID
router.get("/products/:productId", (req, res) => {
    const { productId } = req.params;

    const sql = `SELECT * FROM Product WHERE product_ID = ?`;
    const params = [productId];

    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(row);
    });
});

// Update product by ID
router.put("/products/:productId", (req, res) => {
    const { productId } = req.params;
    const { name, price, description, volume, weight } = req.body;

    const sql = `
        UPDATE Product
        SET 
            name = COALESCE(?, name),
            price = COALESCE(?, price),
            description = COALESCE(?, description),
            volume = COALESCE(?, volume),
            weight = COALESCE(?, weight)
        WHERE product_ID = ?
    `;
    const params = [name, price, description, volume, weight, productId];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ message: "Product not found or no changes made" });
            return;
        }

        res.json({ status: "Product updated successfully", changes: this.changes });
    });
});

// View cart for a specific user
router.get("/cart/:userId", (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT 
            Cart.id AS cart_id,
            Product.product_ID,
            Product.name AS product_name,
            Product.price,
            Product.description,
            Product.volume,
            Product.weight
        FROM Cart
        JOIN Product ON Cart.id = Product.product_ID
        WHERE Cart.user_ID = ?
    `;

    const params = [userId];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ message: "Cart is empty or user not found" });
            return;
        }

        res.json(rows);
    });
});

// //add items to cart for a specific user
// router.post('/cart', (req, res) => {
//     const {userId, productId} = req.body;

//     if (!userId || !productId) {
//         return res.status(400).json({ error: "User ID and product ID are required" });
//     }

//     const sql = `
//         INSERT INTO Cart (user_ID, id)
//         VALUES (?, ?)
//     `;
//     const params = [userId, productId];

//     db.run(sql, params, function (err) {
//         if (err) {
//             res.status(400).json({ error: err.message });
//             return;
//         }
//         res.json({
//             status: "Product added to cart successfully",
//             cartItemId: this.lastID,
//         });
//     });
// });

//add item to cart
router.post('/cart/items', (req, res) => {
    const { cartId, productId, quantity } = req.body;

    if (!cartId || !productId || !quantity) {
        res.status(400).json({ error: "All fields (cartId, productId, quantity) are required." });
        return;
    }

    const sql = `INSERT INTO CartItems (cart_id, product_id, quantity) VALUES (?, ?, ?)`;
    const params = [cartId, productId, quantity];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: "Item added to cart successfully",
            cartItemId: this.lastID // Return the ID of the newly added cart item
        });
    });
});


//remove item from cart route
router.delete('/cart/:cartItemId', (req, res) => {
    const { cartItemId } = req.params; // The unique ID for the cart item to remove

    const sql = `DELETE FROM CartItems WHERE id = ?`;
    const params = [cartItemId];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ message: "Cart item not found" });
            return;
        }

        res.json({ message: "Cart item removed successfully" });
    });
});

// Create order route
router.post('/orders', (req, res) => {
    const { userId, items } = req.body; // `items` is an array of objects: { productId, quantity }

    if (!userId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "User ID and items are required." });
    }

    // Retrieve product prices and calculate total amount
    const productIds = items.map(item => item.productId);
    const sql = `SELECT product_ID, price FROM Product WHERE product_ID IN (${productIds.map(() => '?').join(', ')})`;

    db.all(sql, productIds, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        const productPrices = rows.reduce((acc, row) => {
            acc[row.product_ID] = row.price;
            return acc;
        }, {});

        let totalAmount = 0;

        // Calculate total amount based on items
        items.forEach(item => {
            if (!productPrices[item.productId]) {
                return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
            }
            totalAmount += productPrices[item.productId] * item.quantity;
        });

        // Insert order into Order table
        const insertOrderSql = `INSERT INTO Orders (amount, date) VALUES (?, ?)`;
        const orderDate = new Date().toISOString();

        db.run(insertOrderSql, [totalAmount, orderDate], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Respond with the created order ID
            const orderId = this.lastID;
            res.json({
                message: "Order created successfully",
                order: {
                    orderId,
                    amount: totalAmount,
                    date: orderDate
                }
            });
        });
    });
});

// Get all orders for a specific user
router.get('/users/:userId/orders', (req, res) => {
    const { userId } = req.params;

    // SQL query to get orders for the user
    const sql = `
        SELECT 
            order_ID, 
            amount, 
            date 
        FROM Orders 
        WHERE user_ID = ?`;

    const params = [userId];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ message: "No orders found for this user" });
            return;
        }

        res.json(rows);
    });
});

// Get all categories route
router.get('/categories', (req, res) => {
    const sql = `SELECT cat_ID, name, picture, description FROM Category`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ message: "No categories found" });
            return;
        }

        res.json(rows);
    });
});

// Get products by category route
router.get('/products/category/:categoryId', (req, res) => {
    const { categoryId } = req.params;  // categoryId from the URL

    const sql = `
        SELECT Product.product_ID, Product.name, Product.price, Product.description, 
               Product.volume, Product.weight
        FROM Product
        JOIN Category ON Product.cat_ID = Category.cat_ID
        WHERE Category.cat_ID = ?
    `;
    
    const params = [categoryId];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ message: "No products found for this category" });
            return;
        }

        res.json(rows);
    });
});

// Search products route
router.get('/products/search', (req, res) => {
    const { query, minPrice, maxPrice } = req.query; // Capture query, minPrice, and maxPrice from the URL query parameters

    let sql = `
        SELECT product_ID, name, price, description, volume, weight
        FROM Product
        WHERE 1 = 1
    `;
    
    let params = [];

    // Add conditions based on query parameters
    if (query) {
        sql += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`); // search for the query in both name and description
    }

    if (minPrice) {
        sql += ` AND price >= ?`;
        params.push(minPrice); // add condition for min price
    }

    if (maxPrice) {
        sql += ` AND price <= ?`;
        params.push(maxPrice); // add condition for max price
    }

    // Execute the query
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ message: "No products found matching your criteria" });
            return;
        }

        res.json(rows);
    });
});


/****  IMAGES  *****/

// Update product image URL
router.put('/products/:id/image', (req, res) => {
    const { id } = req.params; // Capture product ID from the URL
    const { image_url } = req.body; // Get the new image URL from the request body

    if (!image_url) {
        return res.status(400).json({ error: "Image URL is required" });
    }

    const sql = `UPDATE Product SET image_url = ? WHERE product_ID = ?`;
    const params = [image_url, id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product image updated successfully" });
    });
});

//get all products
router.get('/products', (req, res) => {
    const sql = `SELECT product_ID, name, price, description, volume, weight, image_url FROM Product`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json(rows);
    });
});

//get product by ID
router.get('/products/:id', (req, res) => {
    const { id } = req.params;

    const sql = `SELECT product_ID, name, price, description, volume, weight, image_url FROM Product WHERE product_ID = ?`;

    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(row);
    });
});




module.exports = router;
