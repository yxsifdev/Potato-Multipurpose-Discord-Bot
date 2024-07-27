const UserLog = require("../../schemas/user-logs.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "change-reason",
  description: "Cambiar la razón de un caso específico.",
  category: "mod",
  usage: "p!change-reason <número de caso> <nueva razón>",
  aliases: ["c-reason"],
  owner: false,
  memberPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  async execute(message, args, client) {
    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`${emj.deny} Uso correcto: \`${this.usage}\``)
        .setColor(emb.deny);
      return message.reply({ embeds: [embed] });
    }

    const caseNumber = parseInt(args[0]);
    if (isNaN(caseNumber))
      return message.reply({
        content: `${emj.deny} Especificar un número de caso válido`,
      });

    const newReason = args.slice(1).join(" ");

    try {
      let warnData = await UserLog.findOne({ guildId: message.guild.id });

      if (!warnData) {
        return message.reply({
          content: `${emj.deny} No se encontraron casos para este servidor.`,
        });
      }

      const caseToUpdate = warnData.warnings.find(
        (warning) => warning.case === caseNumber
      );
      if (!caseToUpdate) {
        return message.reply({
          content: `${emj.deny} No se encontró el caso especificado.`,
        });
      }

      caseToUpdate.reason = newReason;

      await warnData.save();

      await message.channel.send({
        content: `${emj.check} La razón del caso \`#${caseNumber}\` ha sido actualizada.`,
      });
    } catch (error) {
      console.error(error);
      await message.reply({
        content: `${emj.deny} Hubo un error al cambiar la razón del caso.`,
      });
    }
  },
};
