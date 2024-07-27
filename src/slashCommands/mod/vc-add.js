const {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc-add")
    .setDescription("Agregar a un usuario al canal de soporte de otro usuario")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("El usuario a agregar")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("El canal de soporte")
        .setRequired(true)
    ),
  category: "mod",
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
      ViewChannel: true,
      Connect: true,
    });

    await interaction.reply(
      `${user.username} ha sido agregado al canal de soporte ${channel.name}`
    );
  },
};
