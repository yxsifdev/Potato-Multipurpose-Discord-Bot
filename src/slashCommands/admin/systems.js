const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const emb = require("../../botconfig/embed.json")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("sistemas")
        .setDescription("Activa o desactiva los sistemas a través de un panel."),
    async execute(interaction, client) {
        const fields = [
            {
                name: "Warns",
            }
        ]
        const embedPanel = new EmbedBuilder()
            .setTitle("Panel de Sistemas")
            .setDescription("Selecciona un sistema para activarlo o desactivarlo.")
            .setFooter({ text: emb.footertext })
            .setTimestamp()
            .setColor(emb.color)
    }
}