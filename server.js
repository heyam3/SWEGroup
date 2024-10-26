const express = require('express'); // Import Express
const app = express();              // Create an Express app
const PORT = process.env.PORT || 3000; // Set the port (default: 3000)

// Middleware to parse JSON data
app.use(express.json());

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
