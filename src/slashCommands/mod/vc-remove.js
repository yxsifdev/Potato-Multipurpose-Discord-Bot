const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc-remove")
    .setDescription("Eliminar a alguien de un canal de soporte")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("El usuario a eliminar")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("El canal de soporte")
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  async execute(interaction, client) {
    const user = interaction.options.getUser("usuario");
    const channel = interaction.options.getChannel("canal");

    if (channel.type !== ChannelType.GuildVoice) {
      return await interaction.reply(
        "El canal especificado no es un canal de voz."
      );
    }

    await channel.permissionOverwrites.edit(user.id, {
      ViewChannel: false,
      Connect: false,
    });

    await interaction.reply(
      `${user.username} ha sido eliminado del canal de soporte ${channel.name}`
    );
  },
};
