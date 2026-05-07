// server/src/users/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: false,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false,
    },
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      // Standardized enum including "user" for your customer routes in App.jsx
      enum: [
        "SUPER_ADMIN", 
        "BRAND_ADMIN", 
        "MANAGER", 
        "WAITER", 
        "KITCHEN", 
        "DELIVERY", 
        "user"
      ],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);