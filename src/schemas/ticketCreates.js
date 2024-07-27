const mongoose = require("mongoose");

const ticketCreatedSchema = new mongoose.Schema({
  ticketID: {
    type: String,
    required: true,
    unique: true,
  },
  guildID: {
    type: String,
    required: true,
  },
  channelID: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  staffID: {
    type: String,
    required: false,
  },
  closeReason: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("ticketCreated", ticketCreatedSchema);
