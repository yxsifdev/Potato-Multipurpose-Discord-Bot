const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Administrator, ManageMessages, SendMessages } = PermissionFlagsBits;
const UserLog = require("../../schemas/user-logs.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  name: "cases",
  description:
    "Muestra los últimos casos y la información de moderación del servidor.",
  usage: "p!cases [usuario]",
  aliases: [],
  cooldown: 3,
  owner: false,
  memberPermissions: [Administrator],
  botPermissions: [SendMessages, ManageMessages],
  async execute(message, args, client) {
    try {
      const userLogs = await UserLog.findOne({ guildId: message.guild.id });
      if (!userLogs) {
        return message.reply({
          content: `${emj.deny} No se encontraron casos en este servidor.`,
        });
      }

      let targetUser = message.mentions.users.first() || message.author;
      if (args[0] && !message.mentions.users.size) {
        try {
          targetUser = await client.users.fetch(args[0]);
        } catch (error) {
          return message.reply({
            content: `${emj.deny} No se pudo encontrar al usuario especificado.`,
          });
        }
      }

      const userCases = userLogs.warnings.filter(
        (w) => w.userId === targetUser.id
      );
      const totalCases = userCases.length;
      const lastFiveCases = userCases.slice(-5).reverse();

      const embedCase = new EmbedBuilder()
        .setAuthor({
          name: `Información de casos de ${targetUser.tag}`,
          iconURL: targetUser.displayAvatarURL(),
        })
        .setColor(emb.color)
        .setDescription(
          `**Total de casos:** ${totalCases}\n**Último caso del servidor:** #${userLogs.caseCounter}`
        )
        .setTimestamp()
        .setFooter({
          text: `Solicitado por ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        });

      if (lastFiveCases.length > 0) {
        let casesDescription = "";
        for (const caseInfo of lastFiveCases) {
          const moderator = await message.guild.members
            .fetch(caseInfo.moderatorId)
            .catch(() => null);
          const moderatorName = moderator
            ? moderator.user.tag
            : "Moderador desconocido";
          const caseDate = new Date(caseInfo.date).toLocaleString("es-ES", {
            timeZone: "UTC",
          });

          casesDescription += `**Caso #${caseInfo.case}** - ${caseInfo.action}\n`;
          casesDescription += `🛡️ Moderador: ${moderatorName}\n`;
          casesDescription += `📅 Fecha: ${caseDate}\n`;
          casesDescription += `📝 Razón: ${caseInfo.reason}\n`;
          if (caseInfo.action === "Mute" && caseInfo.muteEnd) {
            const muteEndDate = new Date(caseInfo.muteEnd).toLocaleString(
              "es-ES",
              { timeZone: "UTC" }
            );
            casesDescription += `🔇 Fin del mute: ${muteEndDate}\n`;
          }
          casesDescription += "\n";
        }
        embedCase.addFields({
          name: "Últimos 5 casos",
          value: casesDescription,
        });
      } else {
        embedCase.addFields({
          name: "Casos",
          value: "Este usuario no tiene casos registrados.",
        });
      }

      await message.reply({ embeds: [embedCase] });
    } catch (error) {
      console.error(error);
      await message.reply({
        content: `${emj.deny} Hubo un error al recuperar la información de los casos.`,
      });
    }
  },
};
