const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const emj = require("../botconfig/emojis.json");
const emb = require("../botconfig/embed.json");
const suggestionSchema = require("../schemas/suggestions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sugsystem")
    .setDescription("Sistema de sugerencias")
    .addSubcommand((s) =>
      s
        .setName("configurar")
        .setDescription("Configura el sistema de sugerencias.")
        .addChannelOption((o) =>
          o
            .setName("canal")
            .setDescription("Establece el canal de sugerencias.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("manage")
        .setDescription("Administra las sugerencias enviadas.")
        .addStringOption((o) =>
          o
            .setName("id")
            .setDescription("Ingresa el ID del mensaje de sugerencia.")
            .setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("action")
            .setDescription("Realiza una acción")
            .addChoices(
              { name: "Aprobar", value: "aprobar" },
              { name: "Denegar", value: "denegar" },
              { name: "Eliminar", value: "eliminar" }
            )
            .setRequired(true)
        )
    ),
  owner: false,
  memberPermissions: [PermissionFlagsBits.ManageGuild],
  botPermissions: [],
  async execute(interaction, client) {
    const { options, guildId, guild, user } = interaction;
    let schema;

    const resEmbed = new EmbedBuilder();

    switch (options.getSubcommand()) {
      case "configurar":
        const channel = options.getChannel("canal");
        schema = await suggestionSchema.findOne({ guildId: guildId });
        if (!schema) {
          await suggestionSchema.create({
            guildId: guildId,
            sugSystem: { channel: channel.id, suggestion: [] },
          });

          resEmbed
            .setDescription(
              `${emj.check} Sistema de sugerencias establecido en <#${channel.id}>.`
            )
            .setColor(emb.allow);
          await interaction.reply({ embeds: [resEmbed], ephemeral: true });
        } else {
          if (schema.sugSystem.channel === channel.id) {
            resEmbed
              .setDescription(
                `${emj.deny} El sistema de sugerencias ya está establecido en <#${channel.id}>.`
              )
              .setColor(emb.deny);

            return await interaction.reply({
              embeds: [resEmbed],
              ephemeral: true,
            });
          }

          schema.sugSystem.channel = channel.id;
          await schema.save().catch((error) => console.error(error));

          resEmbed
            .setDescription(
              `${emj.check} Sistema de sugerencias establecido en <#${channel.id}>.`
            )
            .setColor(emb.allow);
          await interaction.reply({ embeds: [resEmbed], ephemeral: true });
        }
        break;
      case "manage":
        const messageId = options.getString("id");
        const action = options.getString("action");
        schema = await suggestionSchema.findOne({ guildId: guildId });
        if (!schema) {
          resEmbed
            .setDescription(
              `${emj.deny} No se ha configurado el sistema de sugerencias.`
            )
            .setColor(emb.deny);

          return await interaction.reply({
            embeds: [resEmbed],
            ephemeral: true,
          });
        }

        const suggestion = schema.sugSystem.suggestion.find(
          (s) => s.messageId === messageId
        );
        if (!suggestion) {
          resEmbed
            .setDescription(
              `${emj.deny} No se ha encontrado ninguna sugerencia con el ID ${messageId}.`
            )
            .setColor(emb.deny);

          return await interaction.reply({
            embeds: [resEmbed],
            ephemeral: true,
          });
        } else {
          const message = await guild.channels.cache
            .get(schema.sugSystem.channel)
            .messages.fetch(messageId);

          switch (action) {
            case "aprobar":
              await message.edit({
                content: `\`🟢\` Sugerencia aprobada por <@${user.id}>`,
              });

              await interaction.reply({
                content: `${emj.check} La sugerencia ha sido aprobada.`,
                ephemeral: true,
              });
              break;
            case "denegar":
              await message.edit({
                content: `\`🔴\` Sugerencia denegada por <@${user.id}>`,
              });

              await interaction.reply({
                content: `${emj.check} La sugerencia ha sido denegada.`,
                ephemeral: true,
              });
              break;
            case "eliminar":
              await message.delete();

              if (message.hasThread) {
                await message.thread.delete();
              }

              await interaction.reply({
                content: `${emj.check} La sugerencia ha sido eliminada.`,
                ephemeral: true,
              });
              break;
          }
        }
        break;
      default:
        break;
    }
  },
};
