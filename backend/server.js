const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const budgetRoutes = require('./routes/budgetRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Poveži se z MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware
app.use(cors()); // Omogoči CORS za vse zahteve
app.use(express.json()); // Omogoča JSON podatke

// Register routes
app.use('/budgets', budgetRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Budget Manager API');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;