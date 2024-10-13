const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this points to your User model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// @route   POST /register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body; // Include email

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newUser = new User({ username, password: hashedPassword, email }); // Include email
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// @route   POST /login
// @desc    Login a user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});


module.exports = router;
