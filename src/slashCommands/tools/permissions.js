const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permissions")
        .setDescription("Return permissions")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true });

        const { roles } = interaction.member;
        const role = await interaction.guild.roles.fetch("1261377482414751827").catch(console.error);

        const testRole = await interaction.guild.roles.create({
            name: "Test",
            permissions: [PermissionsBitField.Flags.KickMembers]
        }).catch(console.error);

        if (roles.cache.has("1261377482414751827")) {
            await roles.remove(role).catch(console.error);
            await interaction.editReply({
                content: `${role.name} removido`
            });
        } else {
            await interaction.editReply({
                content: `Tu no tienes el rol ${role.name}`
            });
        }

        await roles.add(testRole).catch(console.error);
        await testRole.setPermissions([PermissionsBitField.Flags.BanMembers]).catch(console.error);

        const channel = await interaction.guild.channels.create({
            name: "test",
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: testRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        }).catch(console.error);

        await channel.permissionOverwrites.edit(testRole.id, { SendMessages: false }).catch(console.error);
    }
};