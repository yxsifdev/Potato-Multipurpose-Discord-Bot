const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra información y comandos del bot."),
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const categories = {};

    // Función para agregar comandos a las categorías
    const addCommandToCategory = (cmd, type, category) => {
      if (!categories[category]) {
        categories[category] = { prefix: [], slash: [] };
      }
      categories[category][type].push(cmd);
    };

    // Organizar comandos prefix por categoría
    const prefixCommandPath = "./src/commands";
    const commandFolders = fs
      .readdirSync(prefixCommandPath)
      .filter((file) =>
        fs.lstatSync(path.join(prefixCommandPath, file)).isDirectory()
      );

    client.prefixCommands.forEach((cmd) => {
      const folder = commandFolders.find((f) =>
        fs.existsSync(path.join(prefixCommandPath, f, `${cmd.name}.js`))
      );
      addCommandToCategory(
        { name: cmd.name, description: cmd.description },
        "prefix",
        folder || "Sin categoría"
      );
    });

    // Organizar comandos slash por categoría
    const slashCommandPath = "./src/slashCommands";
    const slashCommandFolders = fs
      .readdirSync(slashCommandPath)
      .filter((file) =>
        fs.lstatSync(path.join(slashCommandPath, file)).isDirectory()
      );

    // Crear un conjunto con los nombres de las carpetas de comandos slash
    const slashFolderNames = new Set(slashCommandFolders);

    client.slashCommands.forEach((cmd) => {
      const commandFile = `${cmd.data.name}.js`;
      let category = "Sin categoría";

      for (const folder of slashCommandFolders) {
        if (fs.existsSync(path.join(slashCommandPath, folder, commandFile))) {
          category = folder;
          break;
        }
      }

      if (category !== "Sin categoría") {
        // Si el comando tiene una categoría, agregar sus subcomandos
        if (
          cmd.data.options &&
          cmd.data.options.some((opt) => opt.type === 1)
        ) {
          cmd.data.options.forEach((subCmd) => {
            addCommandToCategory(
              {
                name: `${cmd.data.name} ${subCmd.name}`,
                description: subCmd.description,
              },
              "slash",
              category
            );
          });
        } else {
          addCommandToCategory(
            {
              name: cmd.data.name,
              description: cmd.data.description,
            },
            "slash",
            category
          );
        }
      } else if (!slashFolderNames.has(cmd.data.name)) {
        // Solo agregar a "Sin categoría" si el nombre del comando no coincide con una carpeta
        addCommandToCategory(
          {
            name: cmd.data.name,
            description: cmd.data.description,
          },
          "slash",
          "Sin categoría"
        );
      }
    });

    // Crear el menú desplegable
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_select")
      .setPlaceholder("Selecciona una categoría")
      .addOptions(
        Object.keys(categories).map((category) => {
          const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

          let emoji;
          switch (capitalizedCategory.toLowerCase()) {
            case "mod":
              emoji = "🛡️";
              break;
            case "fun":
              emoji = "🎉";
              break;
            case "tools":
              emoji = "🔧";
              break;
            case "config":
              emoji = "⚙️";
              break;
            case "use":
              emoji = "👍";
              break;
            case "user":
              emoji = "👤";
              break;
            case "info":
              emoji = "ℹ️";
              break;
            case "system":
              emoji = "🔨";
              break;
            default:
              emoji = "📁";
          }
          return new StringSelectMenuOptionBuilder()
            .setLabel(capitalizedCategory)
            .setValue(category)
            .setDescription(`Comandos en la categoría ${capitalizedCategory}`)
            .setEmoji(emoji);
        })
      )
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Volver al inicio")
          .setValue("home")
          .setDescription("Regresar a la pantalla principal")
          .setEmoji("🏠")
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const resEmbed = new EmbedBuilder().setColor(emb.color);

    const initialEmbed = resEmbed
      .setTitle("Ayuda del Bot")
      .setDescription(
        `${emj.check} | **Selecciona una categoría para ver los comandos.**`
      );

    await interaction.reply({
      embeds: [initialEmbed],
      components: [row],
    });

    const filter = (i) =>
      i.customId === "help_select" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      const value = i.values[0];

      if (value === "home") {
        await i.update({
          embeds: [initialEmbed],
          components: [row],
        });
      } else {
        const category = value;
        const prefixCommands = categories[category]?.prefix || [];
        const slashCommands = categories[category]?.slash || [];

        const prefixCommandsList = prefixCommands.length
          ? prefixCommands
              .map(
                ({ name, description }) =>
                  `\`${client.prefix}${name}\`: ${description}`
              )
              .join("\n")
          : "No existen comandos prefix en esta categoría";

        const slashCommandsList = slashCommands.length
          ? slashCommands
              .map((cmd) => `\`/${cmd.name}\`: ${cmd.description}`)
              .join("\n")
          : "No existen comandos slash en esta categoría";

        const categoryEmbed = resEmbed.setTitle(`Comandos de ${category}:`)
          .setDescription(`
            ${emj.check} | **Comandos de Prefijo:**
            ${prefixCommandsList}
            
            ${emj.neutral} | **Comandos Slash:**
            ${slashCommandsList}
          `);

        await i.update({ embeds: [categoryEmbed], components: [row] });
      }
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (error) {
        console.error("Error al eliminar los componentes:", error);
      }
    });
  },
};
