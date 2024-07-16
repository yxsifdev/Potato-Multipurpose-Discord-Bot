const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
require("colors");

module.exports = (client) => {
  client.handleSlashCommands = async () => {
    // Handling Slash Commands
    const slashCommandFolders = fs.readdirSync("./src/slashCommands");
    const { slashCommands, slashCommandArray } = client;

    let totalSlashCommands = 0;

    for (const folder of slashCommandFolders) {
      const folderPath = `./src/slashCommands/${folder}`;
      if (fs.lstatSync(folderPath).isDirectory()) {
        const subcommandFiles = fs
          .readdirSync(folderPath)
          .filter((file) => file.endsWith(".js"));

        const mainCommand = {
          data: {
            name: folder,
            description: `Commands for ${folder}`,
            options: [],
          },
          async execute(interaction, client) {
            const subcommandName = interaction.options.getSubcommand();
            const subcommand = slashCommands.get(`${folder}/${subcommandName}`);
            if (subcommand) {
              await subcommand.execute(interaction, client);
            } else {
              await interaction.reply({
                content: `Subcommand \`${subcommandName}\` not found.`,
                ephemeral: true,
              });
            }
          },
        };

        for (const file of subcommandFiles) {
          const subcommand = require(`../../slashCommands/${folder}/${file}`);
          mainCommand.data.options.push({
            type: 1, // 1 is for subcommand type
            name: subcommand.data.name,
            description: subcommand.data.description,
            options: subcommand.data.options,
          });
          slashCommands.set(`${folder}/${subcommand.data.name}`, subcommand);
          totalSlashCommands++;
        }

        slashCommands.set(mainCommand.data.name, mainCommand);
        slashCommandArray.push(mainCommand.data);
      } else if (folder.endsWith(".js")) {
        const command = require(`../../slashCommands/${folder}`);
        slashCommands.set(command.data.name, command);
        slashCommandArray.push(command.data.toJSON());
        totalSlashCommands++;
      }
    }

    // Handling Context Menu Commands
    const contextCommandFiles = fs
      .readdirSync("./src/contextCommands")
      .filter((file) => file.endsWith(".js"));

    const { contextCommands, contextCommandArray } = client;
    let totalContextCommands = 0;

    for (const file of contextCommandFiles) {
      const command = require(`../../contextCommands/${file}`);
      contextCommands.set(command.data.name, command);
      contextCommandArray.push(command.data.toJSON());
      totalContextCommands++;
    }

    const clientId = "1261018820416372807";
    const guildId = "1017083096627171449";
    const rest = new REST({ version: "10" }).setToken(process.env.token);

    try {
      console.log(
        "Comenzó a actualizar los comandos de la aplicación (/)".brightYellow
      );
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: [...client.slashCommandArray, ...client.contextCommandArray],
      });
      console.log(
        "Comandos de aplicación (/) recargados correctamente".brightBlue
      );
    } catch (error) {
      console.error(error);
    }
  };
};
