const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionsBitField } = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const ee = require("../../botconfig/embed.json");

module.exports = {
    name: 'modpanel',
    description: 'Muestra un panel para sancionar a un usuario',
    category: "mod",
    usage: "p!modpanel <user-id>",
    owner: false,
    memberPermissions: ["Administrator"],
    botPermissions: ["Administrator"],
    async execute(message, args, client) {
        const usuario = message.guild.members.cache.get(args[0]);
        //Verificar que especifique al usuario, que no sea el mismo usuario y que no sea un bot
        if (!usuario) return message.reply({ content: `${emj.deny} Especificar un usuario` });
        if (usuario.user.id === message.author.id) return message.reply({ content: `${emj.deny} No puedes sancionarte` });
        if (usuario.user.bot) return message.reply({ content: `${emj.deny} No puedes sancionar a un bot` });

        // Verificar si el usuario es administrador o dueño del servidor
        if (usuario.id === message.guild.ownerId) return message.reply({ content: `${emj.deny} No puedes sancionar al dueño del servidor` });
        if (usuario.permissions.has("Administrator")) return message.reply({ content: `${emj.deny} No puedes sancionar a un administrador` });


        const sancion = [
            {
                label: 'Ban',
                description: 'Banear al usuario',
                value: `ban ${usuario.user.id}`,
                emoji: '🔨'
            },
            {
                label: 'Kick',
                description: 'Expulsar al usuario',
                value: `kick ${usuario.user.id}`,
                emoji: '👢'
            },
            {
                label: 'Silenciar',
                description: 'Silenciar al usuario por 15 (min)',
                value: `mute ${usuario.user.id}`,
                emoji: '🔇'
            }
        ];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("sancion-selectmenu")
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Selecciona una acción')
            .addOptions(sancion.map((sancion) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(sancion.label)
                    .setDescription(sancion.description)
                    .setValue(sancion.value)
                    .setEmoji(sancion.emoji)
            ));

        const cancelButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Cancelar")
            .setCustomId("cancelar-sancion");

        const row1 = new ActionRowBuilder()
            .addComponents(selectMenu);
        const row2 = new ActionRowBuilder()
            .addComponents(cancelButton);

        const modEmbed = new EmbedBuilder()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle("Panel de moderación:")
            .setDescription(`<@${usuario.user.id}> - (${usuario.user.id})`)
            .setThumbnail(usuario.user.displayAvatarURL({ dynamic: true }))
            .setColor(ee.color)
            .setTimestamp()
            .setFooter({ text: ee.footertext });

        await message.reply({ embeds: [modEmbed], components: [row1, row2] });
    }
};