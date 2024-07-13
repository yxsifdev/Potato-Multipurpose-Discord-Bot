const { EmbedBuilder } = require('discord.js');
const ee = require("../botconfig/embed.json");
async function respuestaEmbed(message, contenido) {
    if (!message) {
        console.error('El parámetro `message` es obligatorio.');
        return;
    } else if (!contenido) {
        console.error('El parámetro `contenido` es obligatorio.');
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(ee.color)
        .setDescription(contenido);
    await message.reply({ embeds: [embed], allowedMentions: { allowedMentions: false } }); //parse: ['roles', 'users', 'everyone']
}

module.exports = { respuestaEmbed };
