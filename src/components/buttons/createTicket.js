const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
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
    name: "create_ticket",
  },
  async execute(interaction, client) {
    const { guild, user, customId } = interaction;

    const ticketConfig = await ticketSchema.findOne({ guildID: guild.id });

    if (!ticketConfig) {
      return interaction.reply({
        content: "El sistema de tickets no está configurado.",
        ephemeral: true,
      });
    }

    const existingTicket = await TicketCreated.findOne({
      guildID: guild.id,
      userID: user.id,
      status: "open",
    });

    if (existingTicket) {
      // Check if the ticket channel still exists
      const channel = guild.channels.cache.get(existingTicket.channelID);
      if (channel) {
        return interaction.reply({
          content: `Ya tienes un ticket abierto: ${channel}`,
          ephemeral: true,
        });
      } else {
        // If the channel doesn't exist, close the ticket in the database
        existingTicket.status = "closed";
        await existingTicket.save();
      }
    }

    const category = guild.channels.cache.get(ticketConfig.categoryID);

    if (!category) {
      return interaction.reply({
        content: "La categoría configurada no existe.",
        ephemeral: true,
      });
    }

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        ...ticketConfig.staffRoles.map((roleID) => ({
          id: roleID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        })),
      ],
    });

    const newTicket = new TicketCreated({
      ticketID: channel.id,
      guildID: guild.id,
      channelID: channel.id,
      userID: user.id,
      status: "open",
    });

    await newTicket.save();

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Ticket de soporte`,
        iconURL: guild.iconURL(),
      })
      .setDescription(
        `Un Staff le atenderá en breves momentos, tenga paciencia, por favor. Le recomendamos ir comentando su problema/duda para una atención más rápida.`
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Soporte de ${guild.name}` })
      .setColor(emb.color);

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Cerrar")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary);
      
      const attendButton = new ButtonBuilder()
      .setCustomId("attend_ticket")
      .setLabel("Atender")
      .setEmoji("📌")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(false);

    const row = new ActionRowBuilder().addComponents(closeButton, attendButton);

    channel.send({
      content: `Bienvenido a tu ticket ${user}\nMención al staff: <@&${ticketConfig.staffRoles}>`,
      embeds: [embed],
      components: [row],
    });

    interaction.reply({
      content: `${emj.check} Tu ticket ha sido creado: ${channel}`,
      ephemeral: true,
    });
  },
};
