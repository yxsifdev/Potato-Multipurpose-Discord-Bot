const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlockchannel")
    .setDescription(
      "Desbloquea el canal actual para que todos puedan enviar mensajes"
    ),
  category: "mod",
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

    if (
      permissions &&
      !permissions.deny.has(PermissionFlagsBits.SendMessages)
    ) {
      return interaction.reply({
        content: `${emj.deny} Este canal ya está desbloqueado.`,
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null,
      });

      const embed = new EmbedBuilder()
        .setColor(emb.allow)
        .setTitle("🔓 Canal Desbloqueado")
        .setDescription(
          `${emj.check} Este canal ha sido desbloqueado. Todos pueden enviar mensajes aquí.`
        )
        .setFooter({ text: emb.footertext });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Hubo un error al intentar desbloquear el canal.",
        ephemeral: true,
      });
    }
  },
};
