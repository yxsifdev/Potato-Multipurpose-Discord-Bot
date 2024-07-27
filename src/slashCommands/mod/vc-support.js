const {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc-support")
    .setDescription("Crear un canal de soporte para un usuario específico")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("El usuario para el que se creará el canal de soporte")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("categoría")
        .setDescription("La categoría a la que pertenecerá el canal de soporte")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  async execute(interaction, client) {
    const user = interaction.options.getUser("usuario");
    const category = interaction.options.getChannel("categoría");
    const guild = interaction.guild;

    const resEmbed = new EmbedBuilder().setColor(emb.color);

    try {
      // Crear el canal de voz
      const supportVoiceChannel = await guild.channels.create({
        name: `support-${user.username}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.Connect,
            ],
          },
        ],
      });

      await supportVoiceChannel.setUserLimit(5);

      await interaction.reply({
        content: `${emj.check} Canal de soporte creado para ${user} (${user.id}): ${supportVoiceChannel}`,
        ephemeral: true,
      });

      await supportVoiceChannel.send({
        content: `${user}`,
        embeds: [
          resEmbed.setDescription(
            `${emj.check} Canal de soporte creado para ${user.username}`
          ),
        ],
      });
    } catch (error) {
      console.error("Error al crear el canal de soporte:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "Hubo un error al crear el canal de soporte.",
          ephemeral: true,
        });
      }
    }
  },
};
