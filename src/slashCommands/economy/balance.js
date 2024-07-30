const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/economy");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Muestra tu balance actual"),
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    let user = await User.findOne({ userId, guildId });
    if (!user) {
      user = new User({ userId, guildId });
      await user.save();
    }

    const balance = user.balance;
    const bank = user.bank;
    const total = balance + bank;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(emb.color)
          .setAuthor({
            name: `Cuenta de ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `Usa \`/economy leaderboard\` para ver el top de usuarios`
          )
          .addFields(
            {
              name: "💰 Balance",
              value: `* \`${balance}\``,
              inline: true,
            },
            {
              name: "💳 Banco",
              value: `* \`${bank}\``,
              inline: true,
            },
            {
              name: "💰 Total",
              value: `* \`${total}\``,
              inline: true,
            }
          ),
      ],
    });
  },
};
