const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
require("colors");
module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./src/slashCommands');
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/slashCommands/${folder}`)
                .filter(file => file.endsWith('.js'));

            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../slashCommands/${folder}/${file}`)
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON())
            }
        }
        const clientId = "1261018820416372807"
        const guildId = "1017083096627171449"
        const rest = new REST({ version: "9" }).setToken(process.env.token);
        try {
            console.log('Comenzó a actualizar los comandos de la aplicación (/)'.brightYellow)
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: client.commandArray });
            console.log('Comandos de aplicación (/) recargados correctamente'.brightBlue)
        } catch (error) {
            console.error(error);
        }
    }
}