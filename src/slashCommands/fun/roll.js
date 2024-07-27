const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Lanza un dado con el número de caras especificado")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Número de caras del dado")
        .setRequired(true)
    ),
  owner: false,
  botPermissions: [],
  memberPermissions: [],
  async execute(interaction, client) {
    const numberOfFaces = interaction.options.getInteger("number");
    if (numberOfFaces < 2) {
      return interaction.reply({
        content: "El número de caras debe ser al menos 2.",
        ephemeral: true,
      });
    }

    const rolledNumber = Math.floor(Math.random() * numberOfFaces) + 1;
    interaction.reply({
      content: `🎲 Has lanzado un dado de ${numberOfFaces} caras y ha salido ${rolledNumber}.`,
    });
  },
};
