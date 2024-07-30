const mongoose = require("mongoose");

const ecoSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  lastDaily: { type: Date },
  lastWork: { type: Date },
});

module.exports = mongoose.model("economy", ecoSchema);
