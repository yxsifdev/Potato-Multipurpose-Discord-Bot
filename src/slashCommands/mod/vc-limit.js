const {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc-limit")
    .setDescription("Poner límite de usuarios en un canal de voz")
    .addIntegerOption((option) =>
      option
        .setName("limite")
        .setDescription("El límite de usuarios (0 para desactivar el limite)")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("El canal de voz")
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  async execute(interaction, client) {
    const limit = interaction.options.getInteger("limite");
    const channel = interaction.options.getChannel("canal");

    if (channel.type !== ChannelType.GuildVoice) {
      return await interaction.reply({
        content: `${emj.deny} El canal especificado no es un canal de voz.`,
      });
    }

    if (limit >= 99)
      return await interaction.reply({
        content: `${emj.deny} La capacidad máxima es de 99 usuarios en un canal de voz.`,
        ephemeral: true,
      });

    if (limit === 0) {
      await channel.setUserLimit(0);
    } else {
      await channel.setUserLimit(limit || undefined);
    }

    await interaction.reply({
      content: `${emj.check} Límite de usuarios establecido en ${
        limit === 0 ? "`desactivado`" : `\`${limit}\``
      } para el canal ${channel.name}`,
      ephemeral: true,
    });
  },
};
