module.exports = {
    data: {
        name: "fav-color"
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `Tu color favorito es: ${interaction.fields.getTextInputValue("favColorInput")}`
        })
    }
}