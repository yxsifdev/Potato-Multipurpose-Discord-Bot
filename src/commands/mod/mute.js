const { EmbedBuilder } = require("discord.js");
const UserLog = require("../../schemas/user-logs.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");
const ms = require("ms");

module.exports = {
  name: "mute",
  description: "Mutea a un usuario en un canal de texto",
  category: "mod",
  usage: "p!mute <usuario> <tiempo> <razón>",
  aliases: ["m"],
  owner: false,
  memberPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  async execute(message, args, client) {
    if (args.length < 3) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`${emj.deny} Uso correcto: \`${this.usage}\``)
        .setColor(emb.deny);
      return message.reply({ embeds: [embed] });
    }

    const usuario = message.guild.members.cache.get(args[0]);
    if (!usuario)
      return message.reply({
        content: `${emj.deny} Especificar un usuario válido`,
      });

    if (usuario.user.id === message.author.id)
      return message.reply({
        content: `${emj.deny} No puedes mutearte a ti mismo`,
      });

    if (usuario.user.bot)
      return message.reply({
        content: `${emj.deny} No puedes mutear a un bot`,
      });

    if (usuario.roles.highest.position >= message.member.roles.highest.position)
      return message.reply({
        content: `${emj.deny} No puedes mutear a un miembro con un rol más alto que el tuyo`,
      });

    const muteDuration = args[1];
    const reason = args.slice(2).join(" ");

    // Verifica si el tiempo es válido
    const durationMs = ms(muteDuration);
    if (!durationMs)
      return message.reply({
        content: `${emj.deny} El tiempo especificado no es válido.`,
      });

    try {
      let warnData = await UserLog.findOne({ guildId: message.guild.id });

      if (!warnData) {
        return message.reply({
          content: `${emj.deny} No se encontraron datos de configuración para este servidor.`,
        });
      }

      const muteRole = message.guild.roles.cache.get(warnData.muteRole);
      if (!muteRole)
        return message.reply({
          content: `${emj.deny} No se encontró el rol de mute configurado.`,
        });

      const activeMute = warnData.warnings.find(
        (warning) =>
          warning.userId === usuario.user.id &&
          warning.action === "Mute" &&
          warning.muteEnd > Date.now()
      );

      if (activeMute)
        return message.reply({
          content: `${emj.deny} El usuario ya tiene un mute en proceso.`,
        });

      await usuario.roles.add(muteRole);

      const muteEnd = Date.now() + durationMs;

      warnData.caseCounter += 1;

      const muteObject = {
        userId: usuario.user.id,
        moderatorId: message.author.id,
        action: "Mute",
        reason: reason,
        case: warnData.caseCounter,
        date: Date.now(),
        muteEnd: muteEnd,
      };

      warnData.warnings.push(muteObject);
      await warnData.save();

      await message.channel.send({
        content: `${emj.check} \`#${warnData.caseCounter}\` ${
          usuario.user
        } ha sido muteado hasta <t:${Math.floor(muteEnd / 1000)}:R>.`,
      });
    } catch (error) {
      console.error(error);
      await message.reply({
        content: `${emj.deny} Hubo un error al mutear al usuario.`,
      });
    }
  },
};
