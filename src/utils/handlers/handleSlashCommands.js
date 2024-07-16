const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
require("colors");

module.exports = (client) => {
    client.handleSlashCommands = async () => {
        const commandFolders = fs.readdirSync('./src/slashCommands');
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/slashCommands/${folder}`)
                .filter(file => file.endsWith('.js'));

            const { slashCommands, slashCommandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../slashCommands/${folder}/${file}`);
                slashCommands.set(command.data.name, command);
                slashCommandArray.push(command.data.toJSON());
            }
        }

        const clientId = "1261018820416372807";
        const guildId = "1017083096627171449";
        const rest = new REST({ version: "10" }).setToken(process.env.token);
        try {
            console.log('Comenzó a actualizar los comandos de la aplicación (/)'.brightYellow);
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: client.slashCommandArray });
            console.log('Comandos de aplicación (/) recargados correctamente'.brightBlue);
        } catch (error) {
            console.error(error);
        }
    }
}
