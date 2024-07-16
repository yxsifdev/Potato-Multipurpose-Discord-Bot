const { EmbedBuilder } = require("discord.js");
const emj = require("../../botconfig/emojis.json")
const ee = require("../../botconfig/embed.json")

module.exports = {
    name: 'say',
    description: 'El bot replicará mensajes cortos.',
    category: "tools",
    usage: "p!say <message>",
    owner: false,
    botPermissions: [],
    memberPermissions: ["Administrator"],
    async execute(message, args, client) {
        const sayMessage = args.join(" ");

        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`${emj.deny} Uso correcto: \`${this.usage}\``)
                .setColor(ee.deny)
            return message.reply({ embeds: [embed] });
        }

        if (sayMessage.length > 1000) return message.reply({ content: `${emj.deny} El mensaje es muy largo.` });
        await message.reply({ content: sayMessage });
    }
}
