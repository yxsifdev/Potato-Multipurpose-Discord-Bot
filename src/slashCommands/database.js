const { SlashCommandBuilder } = require("discord.js");
const Guild = require("../schemas/guild.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("database")
        .setDescription("Return database!"),
    async execute(interaction, client) {
        const { guild } = interaction;
        let guildProfile = await Guild.findOne({ guildId: guild.id });
        if (!guildProfile) {
            guildProfile = await new Guild({
                guildId: guild.id,
            })
            await guildProfile.save().catch(console.error);
            await interaction.reply({ content: `¡Se ha creado la base de datos para ${guildProfile.guildId}!`, ephemeral: true });
            console.log(guildProfile);
        } else {
            await interaction.reply({ content: `Ya existe datos del servidor\n\`\`\`yml\n${guildProfile}\`\`\``, ephemeral: true });
        }
    }
}