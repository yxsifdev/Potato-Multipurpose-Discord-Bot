const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/economy");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Reclama tus recompensas diarias"),
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

    const now = new Date();
    const lastDaily = user.lastDaily || new Date(0);
    const difference = now - lastDaily;
    const oneDay = 1000 * 60 * 60 * 24;

    if (difference < oneDay) {
      const timeLeft = oneDay - difference;
      const nextDailyTime = new Date(now.getTime() + timeLeft);
      return interaction.reply({
        content: `${
          emj.uses.alarm
        } Ya reclamaste tu recompensa diaria. Vuelve en <t:${Math.floor(
          nextDailyTime / 1000
        )}:R>.`,
        ephemeral: true,
      });
    }

    const reward = 100; // Amount rewarded daily
    user.balance += reward;
    user.lastDaily = now;
    await user.save();

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(emb.color)
          .setDescription(
            `🎉 Has recibido \`${reward}\` de tu recompensa diaria`
          ),
      ],
    });
  },
};
