const {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const TicketCreated = require("../../schemas/ticketCreates");
const ticketSchema = require("../../schemas/ticketConfig");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: {
    name: "close_ticket",
  },
  async execute(interaction, client) {
    const { guild, user, channel, customId } = interaction;

    const ticket = await TicketCreated.findOne({
      guildID: guild.id,
      channelID: channel.id,
      status: "open",
    });

    if (!ticket) {
      return interaction.reply({
        content: "Este ticket ya está cerrado o no existe.",
        ephemeral: true,
      });
    }

    ticket.status = "closed";
    ticket.staffID = user.id;
    await ticket.save();

    const closedEmbed = new EmbedBuilder()
      .setTitle("Solicitud Cerrada")
      .setDescription(`Solicitud hecha por: ${user.username}`)
      .setColor(emb.allow);

    const controlEmbed = new EmbedBuilder()
      .setTitle("Control del Ticket")
      .setDescription("Seleccione una opción para este ticket")
      .setColor(emb.color);

    const saveButton = new ButtonBuilder()
      .setCustomId("save_ticket")
      .setLabel("Guardar")
      .setEmoji("📄")
      .setStyle(ButtonStyle.Secondary);

    const reopenButton = new ButtonBuilder()
      .setCustomId("reopen_ticket")
      .setLabel("Abrir")
      .setEmoji("🔓")
      .setStyle(ButtonStyle.Primary);

    const deleteButton = new ButtonBuilder()
      .setCustomId("delete_ticket")
      .setLabel("Eliminar")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger);

    const controlRow = new ActionRowBuilder().addComponents(
      saveButton,
      reopenButton,
      deleteButton
    );

    await channel.send({ embeds: [closedEmbed] });
    await channel.send({ embeds: [controlEmbed], components: [controlRow] });

    interaction.deferUpdate();
  },
};
