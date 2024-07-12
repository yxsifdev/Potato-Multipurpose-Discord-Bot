const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ee = require("../../botconfig/embed.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Return an embed."),
    async execute(interaction, client) {

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL(), url: "https://github.com/yxsifdev" })
            .setTitle("Esto es un embed")
            .setDescription("Esto es la descripción del embed")
            .setColor(ee.color)
            .setImage(client.user.displayAvatarURL())
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: "Pie de embed", iconURL: client.user.displayAvatarURL(), })
            .setTimestamp(Date.now())
            .addFields([
                {
                    name: interaction.user.displayName,
                    value: "Valor 1",
                    inline: true
                },
                {
                    name: interaction.user.id,
                    value: "Valor 2",
                    inline: true
                },
                {
                    name: interaction.user.globalName,
                    value: "Valor 3",
                    inline: false
                }
            ])

        await interaction.reply({ content: "Mensaje Embed!! 🔔", embeds: [embed] });
    }
}