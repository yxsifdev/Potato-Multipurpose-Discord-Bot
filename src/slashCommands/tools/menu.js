const Discord = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("menu")
        .setDescription("Return an menu"),
    async execute(interaction, client) {

        //Menu de Roles
        const roleSelectMenu = new Discord.RoleSelectMenuBuilder()
            .setCustomId('role-select')
            .setPlaceholder('Select a role');
        //Menu de Usuarios
        const userSelectMenu = new Discord.UserSelectMenuBuilder()
            .setCustomId('user-select')
            .setPlaceholder('Select a user');
        //Menu de Canales
        const channelSelectMenu = new Discord.ChannelSelectMenuBuilder()
            .setCustomId('channel-select')
            .setPlaceholder('Select a channel');
        //Menu de Strings
        const pets = [
            {
                label: 'Perro',
                description: 'Es un perro',
                value: 'perro',
                emoji: "🐶"
            },
            {
                label: 'Gato',
                description: 'Es un gato',
                value: 'gato',
                emoji: "🐱"
            },
            {
                label: 'Oso',
                description: 'Es un oso',
                value: 'oso',
                emoji: "🐻"
            }
        ]

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId("sub-menu")
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Make a selection!')
            .addOptions(pets.map((pet) =>
                new Discord.StringSelectMenuOptionBuilder()
                    .setLabel(pet.label)
                    .setDescription(pet.description)
                    .setValue(pet.value)
                    .setEmoji(pet.emoji)
            ));

        await interaction.reply({
            content: "Menus de Roles, Usuarios, Canales y String", components: [
                new Discord.ActionRowBuilder().addComponents(channelSelectMenu)
            ]
        });
    }
}