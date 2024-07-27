const { EmbedBuilder } = require("discord.js");
const TicketCreated = require("../../schemas/ticketCreates");
const ticketSchema = require("../../schemas/ticketConfig");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: {
    name: "reopen_ticket",
  },
  async execute(interaction, client) {
    const { guild, user, channel, customId } = interaction;

    if (customId !== "reopen_ticket") return;

    const ticket = await TicketCreated.findOne({
      guildID: guild.id,
      channelID: channel.id,
      status: "closed",
    });

    if (!ticket) {
      return interaction.reply({
        content: "Este ticket ya está abierto o no existe.",
        ephemeral: true,
      });
    }

    ticket.status = "open";
    await ticket.save();

    const reopenEmbed = new EmbedBuilder()
      .setDescription(`Ticket reabierto por: ${user}`)
      .setColor(emb.allow);

    await channel.send({ embeds: [reopenEmbed] });

    interaction.deferUpdate();
  },
};
