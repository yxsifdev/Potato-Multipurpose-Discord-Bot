const { EmbedBuilder } = require("discord.js");
const treeSchema = require("../../../schemas/treeSystem");
const { createProgressBar } = require("../../../functions/progressBar");
const emj = require("../../../botconfig/emojis.json");
const emb = require("../../../botconfig/embed.json");

module.exports = {
  data: {
    name: "water_tree",
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

      // Verificar si el árbol está completamente regado
      if (treeData.riegos >= 100) {
        return interaction.reply({
          content: `${emj.deny} El árbol ya está completamente regado y no necesita más agua.`,
          ephemeral: true,
        });
      }

      // Asegurarse de que riego sea un array
      if (!Array.isArray(treeData.riego)) {
        treeData.riego = [];
      }

      // Verificar si el usuario ya regó el árbol en la última hora
      const lastWatering = treeData.riego.find(
        (r) => r.author === interaction.user.id
      );
      if (lastWatering && Date.now() - lastWatering.fecha < 60 * 60 * 1000) {
        return interaction.reply({
          content: `${emj.deny} Ya has regado el árbol en la última hora. Vuelve más tarde.`,
          ephemeral: true,
        });
      }

      // Calcular el tiempo desde el último cuidado
      const timeSinceLastCare = Date.now() - treeData.lastCare;
      const hoursSinceLastCare = timeSinceLastCare / (1000 * 60 * 60);

      // Reducir los stats basados en el tiempo sin cuidados
      treeData.riegos = Math.max(
        0,
        treeData.riegos - Math.floor(hoursSinceLastCare)
      );
      treeData.abonado = Math.max(
        0,
        treeData.abonado - Math.floor(hoursSinceLastCare)
      );

      // Actualizar datos del árbol
      treeData.riegos = Math.min(treeData.riegos + 5, 100); // Aumentar el riego en 5%

      treeData.height += Math.floor(Math.random() * 5) + 1; // Crece entre 1 y 5 mm
      treeData.riego.push({
        author: interaction.user.id,
        fecha: Date.now(),
      });
      treeData.lastCare = Date.now();

      // Actualizar tamaño del árbol basado en su altura
      if (treeData.height >= 3000)
        treeData.size = "https://imgur.com/hFS8FUc.png";
      else if (treeData.height >= 2000)
        treeData.size = "https://imgur.com/9IEytYd.png";
      else if (treeData.height >= 1000)
        treeData.size = "https://imgur.com/LsLqoaH.png";
      else treeData.size = "https://imgur.com/gsUfxMs.png";

      await treeData.save();

      // Actualizar el embed
      const updatedEmbed = new EmbedBuilder()
        .setTitle("🌳 Árbol del servidor")
        .setColor("Green")
        .setImage(treeData.size)
        .setDescription("¡Gracias por cuidarme!")
        .addFields(
          {
            name: "Regado",
            value: createProgressBar(treeData.riegos.toFixed(2)),
            inline: true,
          },
          {
            name: "Abonado",
            value: createProgressBar(treeData.abonado.toFixed(2)),
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: emb.footertext,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      await interaction.update({
        content: `**Abono:** ${treeData.abonado.toFixed(
          2
        )}%\n**Riego:** ${treeData.riegos.toFixed(
          2
        )}%\n**Altura:** ${treeData.height.toFixed(2)} mm`,
        embeds: [updatedEmbed],
      });

      await interaction.followUp({
        content: `${
          emj.check
        } Has regado el árbol. Ha crecido hasta ${treeData.height.toFixed(
          2
        )}mm.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${emj.deny} Ha ocurrido un error al regar el árbol.`,
        ephemeral: true,
      });
    }
  },
};
