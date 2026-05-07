const Order = require("../models/Order");
const mongoose = require("mongoose");

exports.getBranchAnalytics = async (req, res) => {
  try {
    const { branchId } = req.params;
    const bId = new mongoose.Types.ObjectId(branchId);

    // Get stats for the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      { 
        $match: { 
          branchId: bId, 
          status: "completed", // Only count paid/finished orders
          createdAt: { $gte: startOfDay } 
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPrice" }
        }
      }
    ]);

    // Get Most Popular Items (All time or today)
    const popularItems = await Order.aggregate([
      { $match: { branchId: bId, status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          count: { $sum: "$items.quantity" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      summary: stats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      popularItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};