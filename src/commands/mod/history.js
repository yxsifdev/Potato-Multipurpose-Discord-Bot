const { EmbedBuilder } = require("discord.js");
const UserLog = require("../../schemas/user-logs.js");
const emj = require('../../botconfig/emojis.json');
const emb = require('../../botconfig/embed.json');

module.exports = {
    name: 'history',
    description: 'Muestra todas las advertencias de un usuario.',
    usage: "p!history <id-usuario>",
    aliases: [],
    owner: false,
    memberPermissions: ["Administrator"],
    botPermissions: ["Administrator"],
    async execute(message, args, client) {
        const userId = args[0];
        if (!userId) return message.reply({ content: `${emj.deny} Especificar un ID de usuario válido.` });

        try {
            const userLogs = await UserLog.findOne({ guildId: message.guild.id });
            if (!userLogs || userLogs.warnings.length === 0) {
                const embedNoWarnings = new EmbedBuilder()
                    .setAuthor({ name: "Usuario sin advertencias", iconURL: message.guild.iconURL() })
                    .setDescription("¡Este usuario no cuenta con advertencias!")
                    .setColor(emb.color);
                return message.reply({ embeds: [embedNoWarnings] });
            }

            const userWarnings = userLogs.warnings.filter(warning => warning.userId === userId);

            if (userWarnings.length === 0) {
                const user = await client.users.fetch(userId);
                const embedNoWarnings = new EmbedBuilder()
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                    .setDescription("¡Este usuario no cuenta con advertencias!")
                    .setColor(emb.color);
                return message.reply({ embeds: [embedNoWarnings] });
            }

            const user = await client.users.fetch(userId);
            const embedHistory = new EmbedBuilder()
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setColor(emb.color)
                .setFooter({ text: `Warned: ${userWarnings.length} | Muted: 0 | Kicked: 0 | Bans: 0` });

            userWarnings.forEach(warning => {
                embedHistory.addFields([
                    { name: `Caso #${warning.case} - ${warning.action}`, value: `${warning.reason}` }
                ]);
            });

            await message.reply({ embeds: [embedHistory] });
        } catch (error) {
            console.error(error);
            await message.reply({ content: `${emj.deny} Hubo un error al recuperar el historial del usuario.` });
        }
    }
};
