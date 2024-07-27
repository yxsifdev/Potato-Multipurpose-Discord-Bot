const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const UserLog = require("../../schemas/user-logs.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("muterole")
    .setDescription("Configura el rol de mute.")
    .addRoleOption((option) =>
      option.setName("role").setDescription("El rol de mute").setRequired(true)
    ),
  owner: false,
  memberPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction) {
    const role = interaction.options.getRole("role");

    try {
      let warnData = await UserLog.findOne({ guildId: interaction.guild.id });

      if (!warnData) {
        warnData = new UserLog({
          guildId: interaction.guild.id,
          muteRole: role.id,
        });
      } else {
        warnData.muteRole = role.id;
      }

      await warnData.save();

      const embed = new EmbedBuilder()
        .setDescription(
          `${emj.check} Configuración actualizada: el rol de mute ahora es ${role}`
        )
        .setColor(emb.color);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${emj.deny} Hubo un error al guardar la configuración.`,
        ephemeral: true,
      });
    }
  },
};
