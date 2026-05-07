const express = require("express");
const router = express.Router();
const tableController = require("../tables/table.controller");

// --- ADMIN / SETUP ROUTES ---
// Get all tables for a branch
router.get("/", tableController.getTables); 

// Create a new table
router.post("/", tableController.createTable);

// Delete a table
router.delete("/:id", tableController.deleteTable);

// --- CUSTOMER / LIVE SESSION ROUTES ---
// Customer selects/occupies a table
router.post("/occupy", tableController.occupyTable);

// Release/Clear a table session
router.post("/release", tableController.releaseTable);


router.patch("/:id/position", tableController.updateTablePosition);
router.patch("/:id/status", tableController.updateTableStatus);


router.post("/send-bill", tableController.sendBillToUser);

module.exports = router;