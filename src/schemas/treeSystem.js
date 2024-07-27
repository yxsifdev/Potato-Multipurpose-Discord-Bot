const { Schema, model } = require("mongoose");

const treeSchema = new Schema({
  treeID: { type: String, unique: true, required: true }, // Identificador único para cada árbol
  guildID: { type: String, required: true },
  messageID: { type: String, required: true },
  channelID: { type: String, required: true },
  size: { type: String, default: "https://imgur.com/gsUfxMs.png" },
  date: { type: Date, default: Date.now },
  height: { type: Number, default: 10 },
  riegos: { type: Number, default: 36 }, //Nivel de riego 0 = 0% - 100 = 100%
  abonado: { type: Number, default: 32 }, //Nivel de abono 0 = 0% - 100 = 100%
  lastCare: { type: Date, default: Date.now },
  riego: [
    {
      author: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
    },
  ],
  abono: [
    {
      author: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
    },
  ],
});

module.exports = model("tree", treeSchema);
