const { EmbedBuilder } = require("discord.js");
const UserLog = require("../../schemas/user-logs.js");
const emj = require('../../botconfig/emojis.json');
const emb = require('../../botconfig/embed.json');

module.exports = {
    name: 'case',
    description: 'Muestra la información de un caso específico.',
    usage: "p!case <id-caso>",
    aliases: [],
    owner: false,
    memberPermissions: ["Administrator"],
    botPermissions: ["Administrator"],
    async execute(message, args, client) {
        const caseId = parseInt(args[0], 10);
        if (isNaN(caseId)) return message.reply({ content: `${emj.deny} Especificar un ID de caso válido.` });

        try {
            const userLogs = await UserLog.findOne({ guildId: message.guild.id });
            if (!userLogs || userLogs.warnings.length === 0) {
                return message.reply({ content: `${emj.deny} No se encontró el caso especificado.` });
            }

            const caseInfo = userLogs.warnings.find(warning => warning.case === caseId);

            if (!caseInfo) {
                return message.reply({ content: `${emj.deny} No se encontró el caso especificado.` });
            }

            // Obtener la información del usuario y del moderador
            const user = await client.users.fetch(caseInfo.userId);
            const moderator = await client.users.fetch(caseInfo.moderatorId);

            const embedCase = new EmbedBuilder()
                .setAuthor({
                    name: moderator.tag,
                    iconURL: moderator.displayAvatarURL()
                })
                .setDescription(`**Usuario:** ${user.tag} (${user.id})\n**Acción:** ${caseInfo.action}\n**Razón:** ${caseInfo.reason}`)
                .setColor(emb.color)
                .setTimestamp(caseInfo.date)
                .setFooter({ text: `Caso #${caseId}` });

            await message.reply({ embeds: [embedCase] });
        } catch (error) {
            console.error(error);
            await message.reply({ content: `${emj.deny} Hubo un error al recuperar la información del caso.` });
        }
    }
};
