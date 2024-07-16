const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra el avatar de un usuario")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuario a ver su avatar")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const { user, guild, options } = interaction;
    const usuario = options.getUser("usuario") || user;

    const userSelectAvatar = usuario.displayAvatarURL({
      extension: "png",
      size: 2048,
    });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Avatar de ${usuario.username}`,
        iconURL: user.displayAvatarURL(),
        url: userSelectAvatar,
      })
      .setColor(client.color)
      .setImage(userSelectAvatar);

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Ver en navegador")
            .setURL(userSelectAvatar)
        ),
      ],
    });
  },
};
