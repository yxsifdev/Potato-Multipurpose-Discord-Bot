const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const suggestionSchema = require("../../schemas/suggestions");

module.exports = {
  data: {
    name: "downvoteBtn",
  },
  async execute(interaction, client) {
    const { guildId, message, user } = interaction;

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

    const voter = suggestion.votes.find((v) => v.voterId === user.id);

    if (voter) {
      if (voter.vote === "downvote") {
        suggestion.downVotes--;
        suggestion.votes = suggestion.votes.filter(
          (v) => v.voterId !== user.id
        );
      } else if (voter.vote === "upvote") {
        suggestion.upVotes--;
        suggestion.downVotes++;
        voter.vote = "downvote";
      }
    } else {
      suggestion.downVotes++;
      suggestion.votes.push({ voterId: user.id, vote: "downvote" });
    }

    const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setCustomId("upvoteBtn")
        .setLabel(`${suggestion.upVotes}`)
        .setEmoji("👍"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId("downvoteBtn")
        .setLabel(`${suggestion.downVotes}`)
        .setEmoji("👎"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId("viewVotesBtn")
        .setLabel(`Lista de votos`)
        .setEmoji("📄")
    );

    const totalVotes = suggestion.upVotes + suggestion.downVotes;
    let porcentaje = 0;
    if (totalVotes !== 0) {
      porcentaje = (suggestion.upVotes / totalVotes) * 100;
    }

    const porcentajeStr = `${porcentaje.toFixed(2)}%`;
    if (message.embeds[0] && message.embeds[0].fields[0]) {
      message.embeds[0].fields[0].value = porcentajeStr;
    }

    await interaction.update({
      embeds: [message.embeds[0]],
      components: [btns],
    });
    await dataSug.save().catch((error) => console.error(error));
  },
};
