const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    
    // NEW: Defines the nature of the order
    orderType: { 
      type: String, 
      enum: ["delivery", "pickup", "dine-in"], 
      default: "dine-in",
      required: true 
    },
    
    // NEW: Links to the specific table if orderType is dine-in
    tableId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Table",
      default: null 
    },

    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        price: Number,
        quantity: Number,
      }
    ],
    totalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in-progress", "ready", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { 
      type: String, 
      enum: ['COD', 'ESEWA', 'KHALTI', 'STRIPE'], 
      default: 'COD' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['unpaid', 'paid', 'pending'], 
      default: 'unpaid' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);