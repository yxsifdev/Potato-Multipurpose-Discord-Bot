const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lockchannel")
    .setDescription(
      "Bloquea el canal actual para que nadie pueda enviar mensajes"
    ),
  owner: false,
  botPermissions: ["ManageChannels"],
  memberPermissions: ["ManageChannels"],
  async execute(interaction, client) {
    const channel = interaction.channel;

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: "Este comando solo puede ser usado en canales de texto.",
        ephemeral: true,
      });
    }

    const everyoneRole = interaction.guild.roles.everyone;
    const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);

    if (permissions && permissions.deny.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({
        content: `${emj.deny} Este canal ya está bloqueado.`,
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false,
      });

      const embed = new EmbedBuilder()
        .setColor(emb.allow)
        .setTitle("🔒 Canal Bloqueado")
        .setDescription(
          `${emj.check} Este canal ha sido bloqueado. Nadie puede enviar mensajes aquí.`
        )
        .setFooter({ text: emb.footertext });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Hubo un error al intentar bloquear el canal.",
        ephemeral: true,
      });
    }
  },
};
