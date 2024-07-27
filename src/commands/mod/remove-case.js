const UserLog = require("../../schemas/user-logs.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "remove-case",
  description: "Remover un caso específico de un usuario.",
  category: "mod",
  usage: "p!remove-case <número de caso>",
  aliases: ["r-case"],
  owner: false,
  memberPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  async execute(message, args, client) {
    if (args.length === 0) {
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

    try {
      let warnData = await UserLog.findOne({ guildId: message.guild.id });

      if (!warnData) {
        return message.reply({
          content: `${emj.deny} No se encontraron casos para este servidor.`,
        });
      }

      const caseToRemove = warnData.warnings.find(
        (warning) => warning.case === caseNumber
      );
      if (!caseToRemove) {
        return message.reply({
          content: `${emj.deny} No se encontró el caso especificado.`,
        });
      }

      warnData.warnings = warnData.warnings.filter(
        (warning) => warning.case !== caseNumber
      );

      await warnData.save();

      await message.channel.send({
        content: `${emj.check} El caso \`#${caseNumber}\` ha sido removido.`,
      });
    } catch (error) {
      console.error(error);
      await message.reply({
        content: `${emj.deny} Hubo un error al remover el caso.`,
      });
    }
  },
};
