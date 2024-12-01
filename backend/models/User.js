const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    limit: { type: Number, default: null }, // Add limit field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
