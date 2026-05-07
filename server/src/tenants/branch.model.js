//server/src/tenants/branch.model.js
const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    name: String,
    address: String,
    city: String,
    phone: String,
    openingHours: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
