const { EmbedBuilder } = require('discord.js');
const emj = require('../../botconfig/emojis.json');
const emb = require('../../botconfig/embed.json');

module.exports = {
    name: 'user',
    description: 'Muestra información de un usuario.',
    category: 'mod',
    usage: 'p!user <user-id>',
    aliases: [],
    owner: false,
    memberPermissions: [],
    botPermissions: [],
    async execute(message, args, client) {
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`${emj.deny} Uso correcto: \`${this.usage}\``)
                .setColor(emb.deny)
            return message.reply({ embeds: [embed] });
        }

        try {
            const user = await message.guild.members.fetch(args[0]).catch(() => null);
            if (!user) {
                return message.reply(`${emj.deny} El usuario no se encuentra en el servidor.`);
            }

            function getHighestRole(member) {
                const highestRole = member.roles.highest;
                if (highestRole.id === member.guild.roles.everyone.id) {
                    return '@everyone';
                } else {
                    return `<@&${highestRole.id}>`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(emb.color)
                .setAuthor({ name: user.user.tag, iconURL: user.user.displayAvatarURL() })
                .setThumbnail(user.user.displayAvatarURL())
                .addFields(
                    { name: 'UserID', value: user.id },
                    { name: 'Se unió a Discord', value: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:R>` },
                    { name: 'Se unió al Servidor', value: user.joinedTimestamp ? `<t:${Math.floor(user.joinedTimestamp / 1000)}:R>` : 'No está en el servidor' },
                    { name: 'Rol más alto', value: getHighestRole(user) }
                )
                .setFooter({ text: emb.footertext });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await message.reply('Ocurrió un error al intentar obtener la información del usuario.');
        }
    }
};