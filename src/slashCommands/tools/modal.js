const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("modal")
        .setDescription("Return my modal!"),
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId("fav-color")
            .setTitle("Color favorito?")

        const textInput = new TextInputBuilder()
            .setCustomId("favColorInput")
            .setLabel("Color favorito")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        modal.addComponents(new ActionRowBuilder().addComponents(textInput));

        await interaction.showModal(modal);
    }
}