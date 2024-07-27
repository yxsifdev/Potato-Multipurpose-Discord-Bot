const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const suggestionSchema = require("../../schemas/suggestions");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: {
    name: "viewVotesBtn",
  },
  async execute(interaction, client) {
    const { guildId, message } = interaction;

    const dataSug = await suggestionSchema.findOne({ guildId: guildId });
    if (!dataSug)
      return interaction.reply({
        content: "No se encontró la configuración del servidor.",
        ephemeral: true,
      });

    const suggestion = dataSug.sugSystem.suggestion.find(
      (s) => s.messageId === message.id
    );
    if (!suggestion)
      return interaction.reply({
        content: "No se encontró la sugerencia.",
        ephemeral: true,
      });

    const upvoters = suggestion.votes
      .filter((v) => v.vote === "upvote")
      .map((v) => `<@${v.voterId}>`)
      .join(", ");

    const downvoters = suggestion.votes
      .filter((v) => v.vote === "downvote")
      .map((v) => `<@${v.voterId}>`)
      .join(", ");

    const votesEmbed = new EmbedBuilder()
      .setTitle("Usuarios que han votado")
      .setColor(emb.color)
      .addFields(
        { name: "Upvotes", value: upvoters || "Ninguno", inline: false },
        { name: "Downvotes", value: downvoters || "Ninguno", inline: false }
      );

    await interaction.reply({
      embeds: [votesEmbed],
      ephemeral: true,
    });
  },
};
