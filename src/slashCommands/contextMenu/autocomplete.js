const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("autocomplete")
        .setDescription("Return autocomplete!")
        .addStringOption((option) =>
            option.setName("color")
                .setDescription("Color basado en autocomplete")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
        const choices = ["red", "blue", "green", "yellow", "orange"];
        const filtered = choices.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction, client) {
        const option = interaction.options.getString("color");
        await interaction.reply(`Color: ${option}`);
    }
}