const { EmbedBuilder } = require("discord.js");
const config = require("../../botconfig/config.json")
const ee = require("../../botconfig/embed.json")
const emj = require("../../botconfig/emojis.json")

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (!message.content.startsWith(client.prefix) || message.author.bot) return;
        const args = message.content.slice(client.prefix.length).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();
        const command = client.prefixCommands.get(commandName) || client.prefixCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command) {
            if (command.owner && !config.owners.includes(message.author.id)) {
                return message.reply({ content: `${emj.check} No puedes ejecutar este comando.` });
            }
            if (command.botPermissions) {
                if (!message.guild.members.me.permissions.has(command.botPermissions)) {
                    return message.reply({ content: `${emj.deny} El bot no tiene los permisos necesarios.` });
                }
            }
            if (command.memberPermissions) {
                if (!message.member.permissions.has(command.memberPermissions)) {
                    return message.reply({ content: `${emj.deny} No tienes los permisos necesarios.` });
                }
            }
        }

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            await message.reply('Algo salió mal al ejecutar este comando.');
        }
    }
}