const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  name: "help",
  description: "Muestra información y comandos del bot.",
  category: "info",
  usage: "p!help",
  aliases: [],
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(message, args, client) {
    const categories = {};
    const COMMANDS_PER_PAGE = 20;

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
          const capitalizedCategory =
            category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
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

    let currentPage = 1;
    let currentCategory = null;

    const msg = await message.reply({
      embeds: [initialEmbed],
      components: [row],
    });

    const filter = (i) => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.customId === "help_select") {
          const value = i.values[0];

          if (value === "home") {
            currentCategory = null;
            currentPage = 1;
            await i.update({
              embeds: [initialEmbed],
              components: [row],
            });
          } else {
            currentCategory = value;
            currentPage = 1;
            await updateCategoryEmbed(i);
          }
        } else if (i.customId === "prev_page") {
          currentPage--;
          await updateCategoryEmbed(i);
        } else if (i.customId === "next_page") {
          currentPage++;
          await updateCategoryEmbed(i);
        }
      } catch (error) {
        console.error("Error en el collector:", error);
        await i.reply({
          content: "Ha ocurrido un error. Por favor, intenta nuevamente.",
          ephemeral: true,
        });
      }
    });

    collector.on("end", async () => {
      try {
        if (msg.editable) {
          await msg.edit({ components: [] });
        }
      } catch (error) {
        console.error("Error al eliminar los componentes:", error);
      }
    });

    async function updateCategoryEmbed(i) {
      const category = currentCategory;
      const prefixCommands = categories[category]?.prefix || [];
      const slashCommands = categories[category]?.slash || [];

      const totalCommands = prefixCommands.length + slashCommands.length;
      const totalPages = Math.ceil(totalCommands / COMMANDS_PER_PAGE);

      currentPage = Math.max(1, Math.min(currentPage, totalPages));

      const startIndex = (currentPage - 1) * COMMANDS_PER_PAGE;
      const endIndex = startIndex + COMMANDS_PER_PAGE;

      const prefixCommandsList = prefixCommands
        .slice(startIndex, endIndex)
        .map(
          ({ name, description }) =>
            `\`${client.prefix}${name}\`: ${description}`
        )
        .join("\n");

      const slashCommandsList = slashCommands
        .slice(
          Math.max(0, startIndex - prefixCommands.length),
          Math.max(0, endIndex - prefixCommands.length)
        )
        .map((cmd) => `\`/${cmd.name}\`: ${cmd.description}`)
        .join("\n");

      const categoryEmbed = resEmbed
        .setTitle(`Comandos de ${category}:`)
        .setDescription(
          `
          ${emj.check} | **Comandos de Prefijo:**
          ${prefixCommandsList || "No hay comandos prefix en esta página"}
          
          ${emj.neutral} | **Comandos Slash:**
          ${slashCommandsList || "No hay comandos slash en esta página"}
          
          Página ${currentPage} de ${totalPages}
        `
        );

      const prevButton = new ButtonBuilder()
        .setCustomId("prev_page")
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 1);

      const nextButton = new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages);

      const navigationRow = new ActionRowBuilder().addComponents(
        prevButton,
        nextButton
      );

      await i.update({
        embeds: [categoryEmbed],
        components: [row, navigationRow],
      });
    }
  },
};
