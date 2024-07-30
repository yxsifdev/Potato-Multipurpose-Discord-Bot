const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const LogSettings = require("../schemas/logs"); // Asegúrate de que la ruta sea correcta
const emj = require("../botconfig/emojis.json");
const emb = require("../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logsetup")
    .setDescription("Configura el sistema de logs")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Establece el canal para los logs")
        .addChannelOption((option) =>
          option
            .setName("log_channel")
            .setDescription("El canal donde se enviarán los logs")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Activa o desactiva tipos de logs específicos")
        .addStringOption((option) =>
          option
            .setName("log_type")
            .setDescription("El tipo de log a configurar")
            .setRequired(true)
            .addChoices(
              { name: "Miembro se une", value: "memberJoin" },
              { name: "Miembro se va", value: "memberLeave" },
              { name: "Mensaje eliminado", value: "messageDelete" },
              { name: "Mensaje editado", value: "messageEdit" },
              { name: "Canal creado", value: "channelCreate" },
              { name: "Canal eliminado", value: "channelDelete" },
              { name: "Rol creado", value: "roleCreate" },
              { name: "Rol eliminado", value: "roleDelete" },
              { name: "Baneo", value: "ban" },
              { name: "Desbaneo", value: "unban" },
              { name: "Cambio de apodo", value: "nicknameChange" }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Activar o desactivar este tipo de log")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle_all")
        .setDescription("Activa o desactiva todos los tipos de logs")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Activar o desactivar todos los logs")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Muestra el estado actual de la configuración de logs")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 3,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      let logSettings = await LogSettings.findOne({
        guildId: interaction.guild.id,
      });

      if (!logSettings) {
        logSettings = new LogSettings({ guildId: interaction.guild.id });
      }

      switch (subcommand) {
        case "channel":
          const logChannel = interaction.options.getChannel("log_channel");
          logSettings.logChannelId = logChannel.id;
          await logSettings.save();

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(emb.allow)
                .setTitle("Canal de Logs Configurado")
                .setDescription(`Canal de logs establecido a ${logChannel}.`)
                .setTimestamp(),
            ],
          });
          break;

        case "toggle":
          const logType = interaction.options.getString("log_type");
          const enabled = interaction.options.getBoolean("enabled");

          logSettings.enabledLogs[logType] = enabled;
          await logSettings.save();

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(enabled ? emb.allow : emb.deny)
                .setTitle("Configuración de Log Actualizada")
                .setDescription(
                  `Logs de "${logType}" ${
                    enabled ? "activados" : "desactivados"
                  }.`
                )
                .setTimestamp(),
            ],
          });
          break;

        case "toggle_all":
          const allEnabled = interaction.options.getBoolean("enabled");
          for (const key in logSettings.enabledLogs) {
            logSettings.enabledLogs[key] = allEnabled;
          }
          await logSettings.save();

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(allEnabled ? emb.allow : emb.deny)
                .setTitle("Configuración Global de Logs Actualizada")
                .setDescription(
                  `Todos los logs han sido ${
                    allEnabled ? "activados" : "desactivados"
                  }.`
                )
                .setTimestamp(),
            ],
          });
          break;

        case "status":
          const statusEmbed = new EmbedBuilder()
            .setColor("#0099FF")
            .setTitle("Estado de la Configuración de Logs")
            .addFields(
              {
                name: "Canal de Logs",
                value: logSettings.logChannelId
                  ? `<#${logSettings.logChannelId}>`
                  : "No configurado",
              },
              ...Object.entries(logSettings.enabledLogs).map(
                ([key, value]) => ({
                  name: key,
                  value: value ? "✅ Activado" : "❌ Desactivado",
                  inline: true,
                })
              )
            )
            .setTimestamp();

          await interaction.reply({ embeds: [statusEmbed] });
          break;
      }
    } catch (error) {
      console.error("Error al configurar los logs:", error);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(emb.deny)
            .setTitle("Error")
            .setDescription(
              "Hubo un error al configurar los logs. Por favor, intenta de nuevo más tarde."
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }
  },
};
