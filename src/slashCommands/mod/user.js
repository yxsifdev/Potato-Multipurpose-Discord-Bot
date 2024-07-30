const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userLogSchema = require("../../schemas/user-logs");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Panel de moderación")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Ingresa el usuario a moderar.")
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const { options, user, guild } = interaction;

    let userData = await userLogSchema.findOne({ guildId: guild.id });
    const accountCreateTimeStamp = Math.floor(user.createdAt / 1000);

    if (!userdata) return interaction.reply("No hay datos...");

    const resEmbed = new EmbedBuilder()
      .setColor(emb.color)
      .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL() })
      .setDescription(
        ` 🆔 **ID:** ${user.id}\n🆕 **Creada:** <t:${accountCreateTimeStamp}:D> (<t:${accountCreateTimeStamp}:R>)\n**Casos:** 8`
      );

    await interaction.reply({ embeds: [resEmbed] });
  },
};
