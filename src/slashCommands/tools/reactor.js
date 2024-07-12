const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("reactor")
        .setDescription("Return reactions"),
    async execute(interaction, client) {
        const message = await interaction.reply({
            content: "Reacciona aquí",
            fetchReply: true
        });
        // const emoji = client.guilds.emojis.cache.find(emoji => emoji.id = "1047140309538197585");
        const emoji1 = client.emojis.cache.find(emoji => emoji.id == "1047140307906596874");

        message.react(emoji1);
        message.react("🔔");

        const filter = (reaction, user) => {
            return reaction.emoji.name == "🔔" && user.id == interaction.user.id;
        }

        const collector = message.createReactionCollector({ filter, time: 15000 });

        collector.on("collect", (reaction, user) => {
            console.log(`${user.tag} reaccionó con ${reaction.emoji.name}`);
        });
        collector.on("end", (collected) => {
            console.log(`Recolectadas ${collected.size}`);
        });

    }
}