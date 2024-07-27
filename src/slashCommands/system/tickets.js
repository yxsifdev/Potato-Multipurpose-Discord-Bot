const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const ticketSchema = require("../../schemas/ticketConfig");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Configura el sistema de tickets del servidor")
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription(
          "El canal donde se enviará el mensaje de creación de tickets"
        )
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((option) =>
      option
        .setName("categoria")
        .setDescription("La categoría donde se crearán los tickets")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addRoleOption((option) =>
      option
        .setName("rolmod")
        .setDescription("El rol de moderador para los tickets")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("mensaje")
        .setDescription(
          "Contenido del mensaje de creación de tickets | %% = Salto de linea"
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("logschannel")
        .setDescription("El canal de logs para los tickets")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    ),
  owner: false,
  memberPermissions: [PermissionsBitField.Flags.Administrator],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "No tienes permisos para usar este comando.",
        ephemeral: true,
      });
    }

    const guildID = interaction.guild.id;
    const channel = interaction.options.getChannel("canal");
    const desc = interaction.options.getString("mensaje");
    const channelID = channel.id;
    const categoryID = interaction.options.getChannel("categoria").id;
    const roleID = interaction.options.getRole("rolmod").id;
    const logsChannelID = interaction.options.getChannel("logschannel")?.id;

    let ticketConfig = await ticketSchema.findOne({ guildID });

    if (!ticketConfig) {
      ticketConfig = new ticketSchema({
        guildID,
        channelID,
        categoryID,
        staffRoles: [roleID],
        logsChannelID: logsChannelID || null,
        messageID: "placeholder", // Asegúrate de actualizar esto según sea necesario
      });
    } else {
      ticketConfig.channelID = channelID;
      ticketConfig.categoryID = categoryID;
      ticketConfig.staffRoles = [roleID];
      ticketConfig.logsChannelID = logsChannelID || null;
    }

    await ticketConfig.save();

    if (ticketConfig.messageID !== "placeholder") {
      try {
        const oldMessage = await channel.messages.fetch(ticketConfig.messageID);
        if (oldMessage) {
          await oldMessage.delete();
        }
      } catch (error) {
        console.error(
          "No se pudo eliminar el mensaje anterior de creación de tickets:",
          error
        );
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Ayuda y soporte")
      .setDescription(desc.replace(/%%/g, "\n"))
      .setThumbnail(interaction.guild.iconURL())
      .setColor(emb.color);

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Abrir ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    const message = await channel.send({ embeds: [embed], components: [row] });

    ticketConfig.messageID = message.id;
    await ticketConfig.save();

    interaction.reply({
      content: "Sistema de tickets configurado correctamente.",
      ephemeral: true,
    });
  },
};
