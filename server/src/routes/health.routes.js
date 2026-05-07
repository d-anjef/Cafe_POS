const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "Garden & Cafe API is running 🚀" });
});

module.exports = router;
