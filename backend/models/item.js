const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({

  title: { type: String, required: true },

  description: { type: String, required: true },

  type: {
    type: String,
    enum: ["lost", "found"],
    required: true
  },

  location: { type: String, required: true },

  image: {
    type: String,
    default: ""
  },

 status: {
  type: String,
  enum: ["pending", "matched", "collected"],
  default: "pending"
}
,

  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    default: null
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

/* 🔥 IMPORTANT FIX FOR OVERWRITE ERROR */
module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
