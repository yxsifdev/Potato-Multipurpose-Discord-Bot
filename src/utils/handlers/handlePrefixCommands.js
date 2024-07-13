const fs = require("fs");
require("colors");

module.exports = (client) => {
    client.handlePrefixCommands = async () => {
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter(file => file.endsWith('.js'));

            const { prefixCommands } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                // console.log(`Cargando comando con prefijo: ${command.name}`);
                prefixCommands.set(command.name, command);
            }
        }
        console.log('Comandos con prefijo cargados correctamente'.brightBlue);
    }
}
