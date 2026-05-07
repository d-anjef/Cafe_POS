// server/src/users/auth.controller.js
const User = require("./user.model"); //
const Brand = require("../tenants/brand.model"); //
const Branch = require("../tenants/branch.model"); //
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTER: Automatically assigns IDs
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    // Find the first brand and its first branch automatically
    const defaultBrand = await Brand.findOne().sort({ createdAt: 1 });
    const defaultBranch = await Branch.findOne({ brandId: defaultBrand?._id }).sort({ createdAt: 1 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Matches updated enum
      brandId: defaultBrand ? defaultBrand._id : null,
      branchId: defaultBranch ? defaultBranch._id : null
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        brandId: user.brandId
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. LOGIN: Retrieves existing IDs
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include the brand/branch IDs stored in DB
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send the IDs to the frontend so Home.jsx can use them
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        brandId: user.brandId
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
};