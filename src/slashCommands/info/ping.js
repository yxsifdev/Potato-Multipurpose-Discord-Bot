const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Return my ping!"),
    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true
        });

        const newMessage = `**API Latency:** ${client.ws.ping}**ms**\n**Client Ping:** ${message.createdTimestamp - interaction.createdTimestamp}**ms**`;
        await interaction.editReply({
            content: newMessage
        })
    }
}