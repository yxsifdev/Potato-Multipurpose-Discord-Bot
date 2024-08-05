const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require("discord.js");
const emj = require("../../../botconfig/emojis.json");
const emb = require("../../../botconfig/embed.json");

module.exports = {
  data: {
    name: "compare_dates",
  },
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId("dates_modal")
      .setTitle("Ingresa las Fechas a Comparar");

    const date1Input = new TextInputBuilder()
      .setCustomId("date1")
      .setLabel("Primera Fecha (ej: YYYY-MM-DD)")
      .setStyle("Short")
      .setRequired(true);

    const date2Input = new TextInputBuilder()
      .setCustomId("date2")
      .setLabel("Segunda Fecha (opcional)")
      .setStyle("Short")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(date1Input),
      new ActionRowBuilder().addComponents(date2Input)
    );

    await interaction.showModal(modal);
  },
};
