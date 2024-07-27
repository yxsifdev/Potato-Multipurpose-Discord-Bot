const { v4: uuidv4 } = require("uuid");
const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const treeSchema = require("../../schemas/treeSystem");
const { createProgressBar } = require("../../functions/progressBar");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tree")
    .setDescription("Planta un árbol en tu servidor y cuídenlo.")
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("El canal donde se plantará el árbol")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),
  owner: false,
  memberPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageMessages,
  ],
  async execute(interaction, client) {
    const { guild, options } = interaction;
    const channel = options.getChannel("canal");

    try {
      // Verificar si ya existe un árbol en este servidor
      let existingTree = await treeSchema.findOne({ guildID: guild.id });
      if (existingTree) {
        return interaction.reply({
          content: `${emj.deny} Ya existe un árbol en este servidor. Está plantado en el canal <#${existingTree.channelID}>.`,
          ephemeral: true,
        });
      }

      // Crear nuevo árbol
      let treeData = new treeSchema({
        treeID: uuidv4(),
        guildID: guild.id,
        channelID: channel.id,
        lastCare: new Date(),
      });

      const treeEmbed = new EmbedBuilder()
        .setTitle("🌱 Árbol plantado")
        .setColor("Green")
        .setImage(treeData.size)
        .setDescription(
          "¡Hola! Soy el árbol de este servidor. Tendrán que cuidarme."
        )
        .addFields(
          {
            name: "Regado",
            value: createProgressBar(treeData.riegos),
            inline: true,
          },
          {
            name: "Abonado",
            value: createProgressBar(treeData.abonado),
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: emb.footertext,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("water_tree")
          .setLabel("Regar")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("💧"),
        new ButtonBuilder()
          .setCustomId("fertilize_tree")
          .setLabel("Abonar")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🧪"),
        new ButtonBuilder()
          .setCustomId("tree_stats")
          .setLabel("Estadísticas")
          .setStyle(ButtonStyle.Success)
          .setEmoji("📊")
      );

      const message = await channel.send({
        content: `**Abono:** ${treeData.abonado.toFixed(
          2
        )}%\n**Riego:** ${treeData.riegos.toFixed(
          2
        )}%\n**Altura:** ${treeData.height.toFixed(2)} mm`,
        embeds: [treeEmbed],
        components: [actionRow],
      });

      treeData.messageID = message.id;
      await treeData.save();

      await interaction.reply({
        content: `${emj.check} El árbol se ha plantado con éxito en el canal <#${channel.id}>`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error al plantar el árbol:", error);

      // Si hubo un error, asegurarse de que no quede un árbol a medias
      await treeSchema.findOneAndDelete({ guildID: guild.id });

      await interaction.reply({
        content: `${emj.deny} Ha ocurrido un error al plantar el árbol. Por favor, inténtalo de nuevo más tarde. Detalles: ${error.message}`,
        ephemeral: true,
      });
    }
  },
};
