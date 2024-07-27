const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc-user")
    .setDescription("Ver en que canal de voz se encuentra el usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("El usuario a buscar")
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const user = interaction.options.getUser("usuario");
    const member = interaction.guild.members.cache.get(user.id);

    const resEmbed = new EmbedBuilder().setColor(emb.color);

    if (member && member.voice.channel) {
      const channel = member.voice.channel;
      const userCount = channel.members.size;
      const maxUsers = channel.userLimit;

      resEmbed
        .setAuthor({
          name: `${user.tag}`,
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(
          `> ${channel} | \`${userCount}/${maxUsers ? maxUsers : "∞"}\``
        )
        .setFooter({ text: `${channel.name} (${channel.id})` });
      await interaction.reply({ embeds: [resEmbed] });
    } else {
      resEmbed.setDescription(
        `${user} no se encuentra conectado en un canal de voz.`
      );
      await interaction.reply({ embeds: [resEmbed] });
    }
  },
};
