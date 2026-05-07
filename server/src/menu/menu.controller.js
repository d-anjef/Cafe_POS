// server/src/controllers/menu.controller.js

exports.getMenuByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    // Safety check: If branchId is "undefined" or missing
    if (!branchId || branchId === 'undefined') {
      return res.status(400).json({ error: "A valid Branch ID is required" });
    }

    const items = await MenuItem.find({ branchId, isAvailable: true })
      .populate("categoryId", "name");
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};