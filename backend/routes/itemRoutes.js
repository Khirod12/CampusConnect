const express = require("express");
const Item = require("../models/item");   // ⚠ Capital I check karo
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

/* =============================
   MULTER CONFIGURATION
============================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =============================
   ADD ITEM (WITH IMAGE)
============================= */

router.post("/", verifyToken, upload.single("image"), async (req, res) => {

  try {
    const { title, description, type, location } = req.body;

    const newItem = await Item.create({
      title,
      description,
      type,
      location,
      user: req.user.id,
      image: req.file ? req.file.filename : ""
    });

    res.status(201).json(newItem);

  } catch (err) {
    res.status(500).json({ msg: "Error adding item", error: err.message });
  }
});

/* =============================
   GET ALL ITEMS
============================= */

router.get("/", async (req, res) => {

  try {
    const items = await Item.find()
      .populate("user", "name email role");

    res.json(items);

  } catch (err) {
    res.status(500).json({ msg: "Error fetching items" });
  }
});

/* =============================
   DELETE ITEM
============================= */

router.delete("/:id", verifyToken, async (req, res) => {

  try {
    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ msg: "Item not found" });

    if (
      item.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await item.deleteOne();

    res.json({ msg: "Item deleted successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Error deleting item" });
  }
});

module.exports = router;
