const { Schema, model } = require("mongoose");

const userLogSchema = new Schema({
    guildId: { type: String, required: true },
    caseCounter: { type: Number, default: "" },
    warnings: [
        {
            userId: { type: String, required: true },
            moderatorId: { type: String, required: true },
            action: { type: String, enum: ['Warn', 'Mute', 'Kick', 'Ban'], required: true },
            reason: { type: String, required: true },
            case: { type: Number, required: true },
            date: { type: Date, default: Date.now },
        }
    ],
});

module.exports = model("userlogs", userLogSchema);