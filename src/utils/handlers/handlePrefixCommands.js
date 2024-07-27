const fs = require("fs");
require("colors");

module.exports = (client) => {
  client.handlePrefixCommands = async () => {
    const commandPath = "./src/commands";
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".js"));

    const { prefixCommands } = client;
    for (const file of commandFiles) {
      const command = require(`../../commands/${file}`);
      // console.log(`Cargando comando con prefijo: ${command.name}`);
      prefixCommands.set(command.name, command);
    }

    const commandFolders = fs
      .readdirSync(commandPath)
      .filter((file) => fs.lstatSync(`${commandPath}/${file}`).isDirectory());
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`${commandPath}/${folder}`)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        // console.log(`Cargando comando con prefijo: ${command.name}`);
        prefixCommands.set(command.name, command);
      }
    }

    console.log("Comandos con prefijo cargados correctamente".brightBlue);
  };
};
