const { Schema, model } = require("mongoose");

const guildSchema = new Schema({
    guildId: { type: String, required: true },
});

module.exports = model("guilds", guildSchema);