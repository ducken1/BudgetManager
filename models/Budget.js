const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    type: String, // npr. 'Necessity', 'Luxury', 'Bills', 'Profit'
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Budget', budgetSchema);
