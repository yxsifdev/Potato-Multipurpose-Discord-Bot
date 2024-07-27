const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const suggestionSchema = require("../../schemas/suggestions");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: {
    name: "send-suggest",
  },
  async execute(interaction, client) {
    const { user, guildId, guild } = interaction;

    // Defiere la respuesta para evitar errores de tiempo
    await interaction.deferReply({ ephemeral: true });

    const dataSug = await suggestionSchema.findOne({ guildId: guildId });
    if (!dataSug) {
      return interaction.editReply({
        content: `${emj.deny} El servidor no tiene activado este sistema.`,
      });
    }
    if (!guild.channels.cache.get(dataSug.sugSystem.channel)) {
      return interaction.editReply({
        content: `${emj.deny} El servidor no tiene activado este sistema.`,
      });
    }

    const title = interaction.fields.getTextInputValue("sugerenciaTitle");
    const suggest = interaction.fields.getTextInputValue("sugerenciaTxt");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setCustomId("upvoteBtn")
        .setLabel(`0`)
        .setEmoji("👍"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId("downvoteBtn")
        .setLabel(`0`)
        .setEmoji("👎"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId("viewVotesBtn")
        .setLabel(`Lista de votos`)
        .setEmoji("📄")
    );

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL() })
      .setTitle(`Nueva sugerencia de ${user.tag}`)
      .setDescription(`**\`${title}\`**\n\`\`\`${suggest}\`\`\``)
      .setThumbnail(user.displayAvatarURL())
      .addFields({
        name: "Votos a favor (%)",
        value: "0.00%",
        inline: true,
      })
      .setColor(emb.color)
      .setTimestamp()
      .setFooter({ text: `ID: ${interaction.id}` });

    const channel = guild.channels.cache.get(dataSug.sugSystem.channel);
    const msg = await channel.send({ embeds: [embed], components: [row] });

    dataSug.sugSystem.suggestion.push({
      messageId: msg.id,
      authorId: user.id,
      upVotes: 0,
      downVotes: 0,
    });
    await dataSug.save().catch((error) => console.error(error));

    const thread = await msg.startThread({
      name: `Sugerencia de ${user.tag}`,
      reason: `${user}`,
    });

    await thread.members.add(user.id);
    await interaction.editReply({
      content: `${emj.check} Tu sugerencia se ha enviado a <#${channel.id}>`,
    });
  },
};