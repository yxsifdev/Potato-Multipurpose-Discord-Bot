const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const path = require("path");
require("colors");

module.exports = (client) => {
  client.handleSlashCommands = async () => {
    // Handling Slash Commands
    const slashCommandsPath = path.join(__dirname, "../../slashCommands");
    const slashCommandFolders = fs.readdirSync(slashCommandsPath);
    const { slashCommands, slashCommandArray } = client;

    let totalSlashCommands = 0;

    for (const folder of slashCommandFolders) {
      const folderPath = path.join(slashCommandsPath, folder);
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
          const subcommand = require(path.join(folderPath, file));
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
        const command = require(path.join(slashCommandsPath, folder));
        slashCommands.set(command.data.name, command);
        slashCommandArray.push(command.data.toJSON());
        totalSlashCommands++;
      }
    }

    // Handling Context Menu Commands
    const contextCommandsPath = path.join(__dirname, "../../contextCommands");
    const contextCommandFiles = fs
      .readdirSync(contextCommandsPath)
      .filter((file) => file.endsWith(".js"));

    const { contextCommands, contextCommandArray } = client;
    let totalContextCommands = 0;

    for (const file of contextCommandFiles) {
      const command = require(path.join(contextCommandsPath, file));
      contextCommands.set(command.data.name, command);
      contextCommandArray.push(command.data.toJSON());
      totalContextCommands++;
    }

    const clientId = "1261018820416372807";
    const rest = new REST({ version: "10" }).setToken(process.env.token);

    try {
      console.log(
        "Comenzó a actualizar los comandos de la aplicación (/)".brightYellow
      );
      await rest.put(Routes.applicationCommands(clientId), {
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
