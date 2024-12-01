// routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { createToken, authenticateToken } = require('../auth');
const { authMiddleware } = require('../auth'); // Adjust path based on your directory structure

// @route   POST /register
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        const token = createToken(newUser); // Create JWT token
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// @route   POST /login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = createToken(user); // Create JWT token
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// @route   GET /budgets
router.get('/', authenticateToken, async (req, res) => { // Changed the route to be more RESTful
    const userId = req.user.id; // Extract userId from the token
    try {
        const budgets = await Budget.find({ userId });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets' });
    }
});

// @route   POST /budgets/add
router.post('/add', authenticateToken, async (req, res) => {
    const { name, amount, type } = req.body;
    const userId = req.user.id; // Extract userId from the token

    const newBudget = new Budget({
        userId,
        name,
        amount,
        type,
    });

    try {
        await newBudget.save();
        res.status(201).json({ message: 'Budget added successfully' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message }); // Handle validation errors
        }
        res.status(500).json({ message: 'Error adding budget', error: error.message });
    }
});

// @route   GET /verify-user
router.get('/verify-user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.sendStatus(404); // Not found

        res.status(200).json({ message: 'User exists' }); // User exists
    } catch (error) {
        res.status(500).json({ message: 'Error verifying user' });
    }
});

// @route   POST /recover-password
router.post('/recover-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email not found' });

        // Generate a random token or temporary password
        const tempPassword = Math.random().toString(36).slice(-8); // Simple random string
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Update the user's password in the database (optional, based on your security policy)
        user.password = hashedPassword;
        await user.save();

        // Configure nodemailer to send email
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Recovery',
            text: `Your temporary password is: ${tempPassword}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send recovery email', error });
            }
            res.status(200).json({ message: 'Recovery email sent successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during password recovery', error: error.message });
    }
});

// Route to set the limit for a user
router.post("/setLimit", authenticateToken, async (req, res) => {
    const { limit } = req.body;
    if (!limit || isNaN(limit) || limit <= 0) {
        return res.status(400).json({ message: "Invalid limit value. Must be a positive number." });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.limit = limit;
        await user.save();

        res.status(200).json({ message: "Limit set successfully", limit });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

  
// Route to get the current limit for a user
router.get("/getLimit", authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ limit: user.limit });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;

// Posodobi budget
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, amount: req.body.amount, type: req.body.type },
            { new: true }
        );
        if (!updatedBudget) {
            return res.status(404).json({ message: "Budget not found" });
        }
        res.json(updatedBudget);
    } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ message: "Error updating budget" });
    }
});

// Izbriši budget
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
        if (!deletedBudget) {
            return res.status(404).json({ message: "Budget not found" });
        }
        res.json({ message: "Budget deleted successfully" });
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ message: "Error deleting budget" });
    }
});

module.exports = router;

