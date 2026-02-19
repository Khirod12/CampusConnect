const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/* REGISTER */

router.post("/register", async (req, res) => {

  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ msg: "User already exists" });

  // Allow max 2 admins
  if (role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount >= 2) {
      return res.status(400).json({
        msg: "Only 2 admins allowed."
      });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user"
  });

  res.status(201).json({ msg: "Registered Successfully" });
});


/* LOGIN */

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});


/* DELETE OWN ACCOUNT */

router.delete("/delete", verifyToken, async (req, res) => {

  await User.findByIdAndDelete(req.user.id);

  res.json({ msg: "Account deleted successfully" });
});

module.exports = router;

/* GET LOGGED IN USER */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
/* GET CURRENT USER */

router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) return res.status(404).json({ msg: "User not found" });

  res.json(user);
});
