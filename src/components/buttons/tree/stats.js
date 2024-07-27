const { EmbedBuilder } = require("discord.js");
const treeSchema = require("../../../schemas/treeSystem");
const emj = require("../../../botconfig/emojis.json");
const emb = require("../../../botconfig/embed.json");

module.exports = {
  data: {
    name: "tree_stats",
  },
  async execute(interaction, client) {
    try {
      let treeData = await treeSchema.findOne({
        guildID: interaction.guild.id,
      });
      if (!treeData) {
        return interaction.reply({
          content: `${emj.deny} No se encontró ningún árbol en este servidor.`,
          ephemeral: true,
        });
      }

      // Obtener información de último riego y abonado
      const lastWatering = treeData.riego[treeData.riego.length - 1];
      const lastFertilization = treeData.abono[treeData.abono.length - 1];

      const statsEmbed = new EmbedBuilder()
        .setTitle("📊 Estadísticas del Árbol")
        .setColor("Blue")
        .addFields(
          { name: "Altura", value: `${treeData.height} mm`, inline: true },
          {
            name: "Nivel de Riego",
            value: `${treeData.riegos.toFixed(2)}%`,
            inline: true,
          },
          {
            name: "Nivel de Abono",
            value: `${treeData.abonado.toFixed(2)}%`,
            inline: true,
          },
          {
            name: "Fecha de Plantación",
            value: `<t:${Math.floor(treeData.date / 1000)}:F>`,
            inline: false,
          },
          {
            name: "Último Riego",
            value: lastWatering
              ? `<@${lastWatering.author}> - <t:${Math.floor(
                  lastWatering.fecha / 1000
                )}:R>`
              : "Nadie ha regado aún",
            inline: false,
          },
          {
            name: "Último Abonado",
            value: lastFertilization
              ? `<@${lastFertilization.author}> - <t:${Math.floor(
                  lastFertilization.fecha / 1000
                )}:R>`
              : "Nadie ha abonado aún",
            inline: false,
          },
          {
            name: "Total de Riegos",
            value: `${treeData.riego.length}`,
            inline: true,
          },
          {
            name: "Total de Abonados",
            value: `${treeData.abono.length}`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: emb.footertext,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      await interaction.reply({
        embeds: [statsEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${emj.deny} Ha ocurrido un error al obtener las estadísticas del árbol.`,
        ephemeral: true,
      });
    }
  },
};
