const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const treeSchema = require("../schemas/treeSystem");
const { createProgressBar } = require("../functions/progressBar");

// Función para actualizar las stats del árbol
async function updateTreeStats(client) {
  try {
    const trees = await treeSchema.find({});

    for (const tree of trees) {
      const now = new Date();
      const timeSinceLastUpdate = now - tree.lastCare;

      // Calculamos cuántas actualizaciones deberían haber ocurrido
      const updateIntervals = Math.floor(
        timeSinceLastUpdate / (15 * 60 * 1000)
      ); // 15 minutos

      if (updateIntervals > 0) {
        // Actualizamos las stats
        for (let i = 0; i < updateIntervals; i++) {
          tree.riegos = Math.max(0, tree.riegos - Math.random() * 2);
          tree.abonado = Math.max(0, tree.abonado - Math.random() * 2);

          // Incrementar la altura del árbol si está bien cuidado
          if (tree.riegos > 50 && tree.abonado > 50) {
            tree.height += Math.random() * 5; // Incremento aleatorio entre 0 y 5 mm
          }
        }

        // Actualizar el tamaño del árbol basado en su altura
        if (tree.height >= 3000) tree.size = "https://imgur.com/hFS8FUc.png";
        else if (tree.height >= 2000)
          tree.size = "https://imgur.com/9IEytYd.png";
        else if (tree.height >= 1000)
          tree.size = "https://imgur.com/LsLqoaH.png";
        else tree.size = "https://imgur.com/gsUfxMs.png";

        tree.lastCare = now;

        // Verificamos si el árbol ha muerto
        if (tree.riegos <= 0 || tree.abonado <= 0) {
          await handleTreeDeath(client, tree);
        } else {
          // Si el árbol sigue vivo, actualizamos el mensaje
          await updateTreeMessage(client, tree);
        }

        await tree.save();
      }
    }
  } catch (error) {
    console.error("Error updating tree stats:", error);
  }
}

// Función para manejar la muerte del árbol
async function handleTreeDeath(client, tree) {
  try {
    const channel = await client.channels.fetch(tree.channelID);
    if (channel) {
      try {
        const message = await channel.messages.fetch(tree.messageID);
        if (message) {
          const deathEmbed = new EmbedBuilder()
            .setTitle("🪦 El árbol ha muerto")
            .setColor("Red")
            .setDescription(
              "Lamentablemente, el árbol no ha sobrevivido debido a la falta de cuidados."
            )
            .setTimestamp()
            .setFooter({
              text: "Planta un nuevo árbol para intentarlo de nuevo",
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

          await message.edit({
            content:
              "🌳 El árbol ha muerto. Usa el comando `/tree` para plantar uno nuevo.",
            embeds: [deathEmbed],
            components: [],
          });
        }
      } catch (error) {
        if (error.code === 10008) {
          // Unknown Message error
          console.log("Mensaje no encontrado, puede haber sido eliminado.");
        } else {
          throw error;
        }
      }
    }

    // Eliminamos el árbol de la base de datos
    await treeSchema.findByIdAndDelete(tree._id);
  } catch (error) {
    console.error("Error handling tree death:", error);
  }
}

// Función para actualizar el mensaje del árbol
async function updateTreeMessage(client, tree) {
  try {
    const channel = await client.channels.fetch(tree.channelID);
    if (channel) {
      try {
        const message = await channel.messages.fetch(tree.messageID);
        if (message) {
          const updatedEmbed = new EmbedBuilder()
            .setTitle("🌱 Árbol del servidor")
            .setColor("Green")
            .setImage(tree.size)
            .setDescription(
              "¡Hola! Soy el árbol de este servidor. Tendrán que cuidarme."
            )
            .addFields(
              {
                name: "Regado",
                value: createProgressBar(tree.riegos.toFixed(2)),
                inline: true,
              },
              {
                name: "Abonado",
                value: createProgressBar(tree.abonado.toFixed(2)),
                inline: true,
              }
            )
            .setTimestamp()
            .setFooter({
              text: "Cuida de tu árbol",
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

          await message.edit({
            content: `**Abono:** ${tree.abonado.toFixed(
              2
            )}%\n**Riego:** ${tree.riegos.toFixed(
              2
            )}%\n**Altura:** ${tree.height.toFixed(2)} mm`,
            embeds: [updatedEmbed],
            components: [actionRow],
          });
        }
      } catch (error) {
        if (error.code === 10008) {
          // Unknown Message error
          console.log("Mensaje no encontrado, puede haber sido eliminado.");
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("Error updating tree message:", error);
  }
}

// Función para iniciar el sistema de actualización
function startUpdateSystem(client) {
  // Actualizamos inmediatamente al iniciar
  updateTreeStats(client);

  // Configuramos la actualización periódica
  setInterval(() => updateTreeStats(client), 15 * 60 * 1000); // Cada 15 minutos
}

module.exports = { startUpdateSystem, updateTreeMessage };
