const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const emj = require("../../../botconfig/emojis.json");
const emb = require("../../../botconfig/embed.json");

module.exports = {
  data: {
    name: "calculate_age",
  },
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId("age_modal")
      .setTitle("Calcula tu Edad");

    const birthdateInput = new TextInputBuilder()
      .setCustomId("birthdate")
      .setLabel("Fecha de Nacimiento (ej: YYYY-MM-DD)")
      .setStyle("Short")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(birthdateInput)
    );

    await interaction.showModal(modal);
  },
};