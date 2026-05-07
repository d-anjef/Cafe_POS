const express = require("express");
const router = express.Router();
const Branch = require("../tenants/branch.model");

// Create Branch
router.post("/", async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Branches by Brand
router.get("/:brandId", async (req, res) => {
  try {
    const branches = await Branch.find({ brandId: req.params.brandId });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
