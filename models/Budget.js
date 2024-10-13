const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to the User model
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { 
        type: String,
        enum: ['necessity', 'luxury', 'bills', 'profit'], // Choice type
        required: true 
    },
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
