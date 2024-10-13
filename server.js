const express = require('express');
const cors = require('cors'); // Import cors for handling CORS
const mongoose = require('mongoose');
const budgetRoutes = require('./routes/budgetRoutes'); // Import your routes
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // To handle JSON data

// Use the budget routes for /budgets endpoints
app.use('/budgets', budgetRoutes); // Mount your budget routes here

// Test route
app.get('/', (req, res) => {
    res.send('Welcome to Budget Manager API');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
