const {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ticketSchema = require("../../schemas/ticketConfig");
const TicketCreated = require("../../schemas/ticketCreates");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: {
    name: "attend_ticket",
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

    const member = await guild.members.fetch(user.id);
    const ticketConfig = await ticketSchema.findOne({ guildID: guild.id });

    if (!ticketConfig.staffRoles.includes(member.roles.highest.id)) {
      return interaction.reply({
        content: "No tienes permisos para atender este ticket.",
        ephemeral: true,
      });
    }

    // Si el mismo usuario staff intenta atender el ticket de nuevo, se libera
    if (ticket.staffID === user.id) {
      ticket.staffID = null;
      await ticket.save();

      const releasedEmbed = new EmbedBuilder()
        .setTitle("Ticket Relevado")
        .setDescription(
          "Este ticket ha sido relevado. Ahora cualquier miembro del staff puede atenderlo."
        )
        .setColor(emb.allow);

      await channel.send({ embeds: [releasedEmbed] });

      // Restaurar permisos de todos los roles de staff
      for (const roleID of ticketConfig.staffRoles) {
        await channel.permissionOverwrites.edit(roleID, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });
      }

      return interaction.reply({
        content:
          "Has relevado este ticket. Ahora cualquier miembro del staff puede atenderlo.",
        ephemeral: true,
      });
    }

    // Verificar si el ticket ya está siendo atendido por otro miembro del staff
    if (ticket.staffID && ticket.staffID !== user.id) {
      const attendingMember = await guild.members.fetch(ticket.staffID);
      return interaction.reply({
        content: `Este ticket ya está siendo atendido por ${attendingMember.user.tag}.`,
        ephemeral: true,
      });
    }

    // Asignar el ticket al miembro del staff
    ticket.staffID = user.id;
    await ticket.save();

    const attendEmbed = new EmbedBuilder()
      .setDescription(`Desde ahora ${user} se encargará de tu ticket.`)
      .setColor(emb.color);

    await channel.send({ embeds: [attendEmbed] });

    // Actualizar permisos del canal
    await channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    // Quitar permisos de otros roles de staff
    for (const roleID of ticketConfig.staffRoles) {
      if (roleID !== member.roles.highest.id) {
        await channel.permissionOverwrites.edit(roleID, {
          ViewChannel: false,
        });
      }
    }

    interaction.deferUpdate();
  },
};
