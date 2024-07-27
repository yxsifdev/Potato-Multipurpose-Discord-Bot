const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sugerencia")
    .setDescription("Envía tu sugerencia al servidor"),
  owner: false,
  botPermissions: [],
  memberPermissions: [],
  async execute(interaction, client) {
    const { user } = interaction;

    const modal = new ModalBuilder()
      .setTitle("Mi sugerencia")
      .setCustomId("send-suggest");

    const suggestTxt = new TextInputBuilder()
      .setCustomId("sugerenciaTxt")
      .setPlaceholder("Escribe tu sugerencia aquí")
      .setLabel("¿Cual es tu sugerencia?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const suggestTitle = new TextInputBuilder()
      .setCustomId("sugerenciaTitle")
      .setPlaceholder("Título")
      .setLabel("¿Cual es el título de tu sugerencia?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(suggestTitle);
    const row2 = new ActionRowBuilder().addComponents(suggestTxt);
    modal.addComponents(row, row2);
    await interaction.showModal(modal);
  },
};
