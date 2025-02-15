const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


router.get("/", async (req, res) => {  
    try {
        const users = await User.find().select("name phone role");  // Fetch all users from the database
        res.status(200).json(users); // Send the users as a JSON response
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    } 
});

router.post("/register", async (req, res) => {
    try {
        const { name, phone, password, role } = req.body;

        // Check if the phone number is already registered
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: "This user is already registered!" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ name, phone, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" } // Token valid for 7 days
        );

        // Return user details and token (excluding password)
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;