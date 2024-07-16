const { formatDate, formatTime } = require('../../functions/convertTime.js');
const emj = require('../../botconfig/emojis.json');
const emb = require('../../botconfig/embed.json');

module.exports = {
    data: {
        name: 'sancion-selectmenu'
    },
    async execute(interaction, client) {
        const string = interaction.values[0];

        const sendResponse = async (content) => {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({ content: content, ephemeral: true });
            } else if (interaction.deferred) {
                await interaction.editReply({ content: content });
            } else if (interaction.replied) {
                await interaction.followUp({ content: content, ephemeral: true });
            }
        }

        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        const formattedTime = formatTime(currentDate);

        const userId = string.replace(/(ban|kick|mute)/g, "").trim();
        const user = await interaction.guild.members.fetch(userId).catch(() => null);

        if (!user) {
            return sendResponse(`${emj.deny} El usuario no se encuentra en el servidor.`);
        }

        const username = user.user.username;
        const reason = `Decisión de la administración`;

        // Verificar si el usuario ya está sancionado
        const isBanned = await interaction.guild.bans.fetch(user.id).catch(() => false);
        const isMuted = user.communicationDisabledUntilTimestamp && user.communicationDisabledUntilTimestamp > Date.now();

        if (string.includes("ban")) {
            if (isBanned) {
                return sendResponse(`${emj.deny} Este usuario ya está baneado.`);
            }
            if (user.bannable) {
                await user.ban({ reason });
                sendResponse(`${emj.check} Usuario baneado exitosamente.\n\`\`\`yml\nID: ${username} (${userId})\nMotivo: ${reason}\nFecha y Hora: ${formattedDate} - ${formattedTime}\`\`\``);
            } else {
                sendResponse(`${emj.deny} No se puede banear a este usuario.`);
            }
        } else if (string.includes("kick")) {
            if (isBanned) {
                return sendResponse(`${emj.deny} No se puede expulsar a un usuario que ya está baneado.`);
            }
            if (user.kickable) {
                await user.kick(reason);
                sendResponse(`${emj.check} Usuario expulsado exitosamente.\n\`\`\`yml\nID: ${username} (${userId})\nMotivo: ${reason}\nFecha y Hora: ${formattedDate} - ${formattedTime}\`\`\``);
            } else {
                sendResponse(`${emj.deny} No se puede expulsar a este usuario.`);
            }
        } else if (string.includes("mute")) {
            if (isBanned) {
                return sendResponse(`${emj.deny} No se puede silenciar a un usuario que ya está baneado.`);
            }
            if (isMuted) {
                return sendResponse(`${emj.deny} Este usuario ya está silenciado.`);
            }
            await user.timeout(15 * 60 * 1000, reason); // Silenciar por 15 minutos
            sendResponse(`${emj.check} Usuario silenciado exitosamente por 15 minutos.\n\`\`\`yml\nID: ${username} (${userId})\nMotivo: ${reason}\nFecha y Hora: ${formattedDate} - ${formattedTime}\`\`\``);
        }
    }
};
