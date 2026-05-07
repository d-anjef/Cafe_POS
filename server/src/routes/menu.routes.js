const express = require("express");
const router = express.Router();
const MenuCategory = require("../models/MenuCategory");
const MenuItem = require("../models/MenuItem");

// ==========================================
// MENU CATEGORIES
// ==========================================

/**
 * @route   POST /api/menu/categories
 * @desc    Create a new menu category (Admin/Manager use)
 */
router.post("/categories", async (req, res) => {
  try {
    const category = await MenuCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   GET /api/menu/categories/:branchId
 * @desc    Get all categories for a specific branch
 */
router.get("/categories/:branchId", async (req, res) => {
  try {
    const categories = await MenuCategory.find({ branchId: req.params.branchId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// MENU ITEMS
// ==========================================

/**
 * @route   POST /api/menu/items
 * @desc    Create a new menu item
 */
router.post("/items", async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   GET /api/menu/branch/:branchId
 * @desc    Fetch all menu items for a specific branch (Main Menu Page)
 */
router.get("/branch/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params;
    
    // We use .populate('categoryId') to get the category details 
    // instead of just the ID, which helps with frontend filtering.
    const items = await MenuItem.find({ 
      branchId, 
      isAvailable: true 
    }).populate("categoryId", "name");

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/menu/items/:categoryId
 * @desc    Get items by category filter
 */
router.get("/items/:categoryId", async (req, res) => {
  try {
    const items = await MenuItem.find({ categoryId: req.params.categoryId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/menu
 * @desc    Fetch items using query param ?branchId=...
 */
router.get("/", async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) return res.status(400).json({ error: "branchId required" });
    
    const items = await MenuItem.find({ branchId, isAvailable: true })
                                .populate("categoryId", "name");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;