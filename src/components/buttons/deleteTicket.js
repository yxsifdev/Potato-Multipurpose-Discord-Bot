const { EmbedBuilder, discordSort } = require("discord.js");
const TicketCreated = require("../../schemas/ticketCreates");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: {
    name: "delete_ticket",
  },
  async execute(interaction, client) {
    const { guild, user, channel, customId } = interaction;

    if (customId !== "delete_ticket") return;

    const ticket = await TicketCreated.findOne({
      guildID: guild.id,
      channelID: channel.id,
    });

    if (!ticket) {
      return interaction.reply({
        content: "Este ticket no existe.",
        ephemeral: true,
      });
    }

    await ticket.deleteOne();

    const deleteEmbed = new EmbedBuilder()
      .setDescription(`Ticket eliminado por: ${user.username}`)
      .setColor(emb.deny);

    await channel.send({ embeds: [deleteEmbed] });
    setTimeout(async () => {
      await channel.delete();
    }, 3000);

    interaction.reply({
      content: "El ticket será eliminado en unos segundos.",
      ephemeral: true,
    });
  },
};