// server/src/users/auth.routes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./user.model");
const Brand = require("../tenants/brand.model"); // Added import
const Branch = require("../tenants/branch.model"); // Added import

const router = express.Router();

// Register User with Automatic Brand/Branch Assignment
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2. ROOT FIX: Automatically find the first Brand and its first Branch
    const defaultBrand = await Brand.findOne().sort({ createdAt: 1 });
    const defaultBranch = await Branch.findOne({ 
      brandId: defaultBrand?._id 
    }).sort({ createdAt: 1 });

    // 3. Hash Password
    const hashed = await bcrypt.hash(password, 10);

    // 4. Create User with IDs
    const user = await User.create({ 
      name,
      email,
      password: hashed,
      role: "user", // Default role for new registrations
      brandId: defaultBrand ? defaultBrand._id : null,
      branchId: defaultBranch ? defaultBranch._id : null
    });

    // 5. Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET || "cafesecret",
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, branchId: user.branchId, brandId: user.brandId },
      process.env.JWT_SECRET || "cafesecret",
      { expiresIn: "1d" }
    );

    // Ensure we send back the user object containing branchId and brandId
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;