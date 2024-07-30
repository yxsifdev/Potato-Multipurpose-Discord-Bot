const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logChannelId: { type: String, default: null },
  enabledLogs: {
    memberJoin: { type: Boolean, default: true },
    memberLeave: { type: Boolean, default: true },
    messageDelete: { type: Boolean, default: true },
    messageEdit: { type: Boolean, default: true },
    channelCreate: { type: Boolean, default: true },
    channelDelete: { type: Boolean, default: true },
    roleCreate: { type: Boolean, default: true },
    roleDelete: { type: Boolean, default: true },
    ban: { type: Boolean, default: true },
    unban: { type: Boolean, default: true },
    nicknameChange: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model("logs", logSchema);
