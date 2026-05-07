const mongoose = require('mongoose');
// Adjust these paths to match your server/src/models folder exactly
const MenuCategory = require('./src/models/MenuCategory');
const MenuItem = require('./src/models/MenuItem');
const Table = require('./src/models/Table');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cafe-db';

// IDs from your screenshots
const BRAND_ID = "697245a12d604f6f3ccb77c0"; 
const BRANCH_ID = "69725d497fb1faadc77b940c"; // Garden & Cafe - Thamel

const seedEverything = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Clear existing data for this specific branch to avoid clutter
    await MenuCategory.deleteMany({ branchId: BRANCH_ID });
    await MenuItem.deleteMany({ branchId: BRANCH_ID });
    await Table.deleteMany({ branchId: BRANCH_ID });

    // 2. Create Categories (Linked to Brand AND Branch)
    const categories = await MenuCategory.insertMany([
      { 
        brandId: BRAND_ID, 
        branchId: BRANCH_ID, 
        name: "Beverages", 
        description: "Artisan coffee and teas" 
      },
      { 
        brandId: BRAND_ID, 
        branchId: BRANCH_ID, 
        name: "Bakery", 
        description: "Freshly baked in-house" 
      }
    ]);
    console.log("✅ Menu Categories created.");

    // 3. Create Menu Items (Linked to the new Category IDs)
    const menuItems = [
      {
        brandId: BRAND_ID,
        branchId: BRANCH_ID,
        categoryId: categories[0]._id, // Beverages
        name: "Himalayan Pink Salt Latte",
        description: "Signature espresso with local pink salt.",
        price: 450,
        isAvailable: true
      },
      {
        brandId: BRAND_ID, 
        branchId: BRANCH_ID,
        categoryId: categories[1]._id, // Bakery
        name: "Butter Croissant",
        description: "Warm, flaky French-style pastry.",
        price: 320,
        isAvailable: true
      }
    ];

    // 4. Create Tables
    const tables = [
      { branchId: BRANCH_ID, tableNumber: "T1", capacity: 2, status: 'available' },
      { branchId: BRANCH_ID, tableNumber: "T2", capacity: 4, status: 'available' }
    ];

    await MenuItem.insertMany(menuItems);
    await Table.insertMany(tables);

    console.log("✅ SEED SUCCESSFUL: Thamel Branch is now fully operational!");
    process.exit();
  } catch (err) {
    console.error("❌ SEED FAILED:", err);
    process.exit(1);
  }
};

seedEverything();