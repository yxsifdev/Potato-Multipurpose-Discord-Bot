const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  channelID: {
    type: String,
    required: true,
  },
  messageID: {
    type: String,
    required: true,
  },
  staffRoles: {
    type: [String],
    default: [],
  },
  categoryID: {
    type: String,
    required: true,
  },
  logsChannelID: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("ticketconf", ticketSchema);
