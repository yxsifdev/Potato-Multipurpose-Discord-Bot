const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc-channel")
    .setDescription("Muestra el canal de voz y los usuarios en él")
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("El canal de voz a buscar")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  category: "mod",
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel("canal");

    const resEmbed = new EmbedBuilder().setColor(emb.color);

    if (channel.type === ChannelType.GuildVoice) {
      const users = channel.members.map((member) => member.user.id).join(", ");
      const userCount = channel.members.size;
      const maxUsers = channel.userLimit;

      resEmbed
        .setTitle(`${channel} [\`${userCount}/${maxUsers ? maxUsers : "∞"}\`]`)
        .setDescription(
          users ? `> <@${users}> (${users})` : "> No se encontraron usuarios"
        )
        .setFooter({
          text: `ID: ${channel.id}`,
        });

      await interaction.reply({ embeds: [resEmbed] });
    } else {
      await interaction.reply("El canal especificado no es un canal de voz.");
    }
  },
};
