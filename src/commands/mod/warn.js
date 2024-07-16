const UserLog = require("../../schemas/user-logs.js");
const emj = require('../../botconfig/emojis.json');
const emb = require('../../botconfig/embed.json');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'warn',
    description: 'Añadir una advertencia a un usuario.',
    category: "mod",
    usage: "p!warn <usuario> <razón>",
    aliases: ["w"],
    owner: false,
    memberPermissions: ["Administrator"],
    botPermissions: ["Administrator"],
    async execute(message, args, client) {
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`${emj.deny} Uso correcto: \`${this.usage}\``)
                .setColor(emb.deny)
            return message.reply({ embeds: [embed] });
        }
        const usuario = message.guild.members.cache.get(args[0]);
        if (!usuario) return message.reply({ content: `${emj.deny} Especificar un usuario válido` });
        if (usuario.user.id === message.author.id) return message.reply({ content: `${emj.deny} No puedes sancionarte a ti mismo` });
        if (usuario.user.bot) return message.reply({ content: `${emj.deny} No puedes sancionar a un bot` });
        if (usuario.roles.highest.position >= message.member.roles.highest.position) return message.reply({ content: `${emj.deny} No puedes sancionar a un miembro con un rol más alto que el tuyo` });
        if (!args[1]) return message.reply({ content: `${emj.deny} Especificar una razón para la advertencia` });

        try {
            let warnData = await UserLog.findOne({ guildId: message.guild.id });

            if (!warnData) {
                warnData = new UserLog({
                    guildId: message.guild.id,
                    caseCounter: 0,
                    warnings: []
                });
            }
            const userWarnings = warnData.warnings.filter(warning => warning.userId === usuario.user.id);
            if (userWarnings.length >= 5) {
                return message.reply({ content: `${emj.deny} ${usuario.user} ya ha alcanzado el máximo de advertencias permitidas.` });
            }

            warnData.caseCounter += 1;

            const warnObjet = {
                userId: usuario.user.id,
                moderatorId: message.author.id,
                action: "Warn",
                reason: args.slice(1).join(" "),
                case: warnData.caseCounter,
                date: Date.now()
            };

            warnData.warnings.push(warnObjet);
            await warnData.save();

            await message.channel.send({ content: `${emj.check} \`#${warnData.caseCounter}\` ${usuario.user} Ha sido advertido` });
        } catch (error) {
            console.error(error);
            await message.reply({ content: `${emj.deny} Hubo un error al aplicar la advertencia.` });
        }
    }
};
