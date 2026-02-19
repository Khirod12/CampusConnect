const express = require("express");
const Item = require("../models/item");
const User = require("../models/user");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* ===================================
   GET ALL USERS
=================================== */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching users" });
  }
});

/* ===================================
   MATCH ITEMS
=================================== */
router.post("/match", verifyToken, isAdmin, async (req, res) => {
  try {

    const { lostItemId, foundItemId } = req.body;

    const lostItem = await Item.findById(lostItemId).populate("user");
    const foundItem = await Item.findById(foundItemId).populate("user");

    if (!lostItem || !foundItem)
      return res.status(404).json({ msg: "Items not found" });

    if (lostItem.type !== "lost" || foundItem.type !== "found")
      return res.status(400).json({ msg: "Invalid item types" });

    if (lostItem.status !== "pending" || foundItem.status !== "pending")
      return res.status(400).json({ msg: "Items already processed" });

    // Update status
    lostItem.status = "matched";
    foundItem.status = "matched";

    lostItem.matchedWith = foundItem._id;
    foundItem.matchedWith = lostItem._id;

    await lostItem.save();
    await foundItem.save();

    // Send Email to Lost Owner
    if (lostItem.user?.email) {
      await sendEmail(
        lostItem.user.email,
        "Item Matched - CampusConnect",
        `Hello ${lostItem.user.name},

Good news! 🎉

Your lost item "${lostItem.title}" has been matched.

Please visit the admin office to collect your item.

Thank you,
CampusConnect Team`
      );
    }

    res.json({ msg: "Items matched successfully" });

  } catch (error) {
    console.log("MATCH ERROR:", error);
    res.status(500).json({
      msg: "Server error while matching",
      error: error.message
    });
  }
});

/* ===================================
   COLLECT ITEM (SAFE VERSION)
=================================== */
router.post("/collect/:id", verifyToken, isAdmin, async (req, res) => {
  try {

    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ msg: "Item not found" });

    if (item.status !== "matched")
      return res.status(400).json({ msg: "Item is not in matched state" });

    // Update main item
    item.status = "collected";
    await item.save();

    // Update matched item safely
    if (item.matchedWith) {
      const matchedItem = await Item.findById(item.matchedWith);

      if (matchedItem) {
        matchedItem.status = "collected";
        await matchedItem.save();
      } else {
        console.log("Matched item not found in DB");
      }
    }

    res.json({ msg: "Item collected successfully" });

  } catch (error) {
    console.log("COLLECT ERROR:", error);
    res.status(500).json({
      msg: "Server error while collecting item",
      error: error.message
    });
  }
});

module.exports = router;
