const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/economy");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

const trabajos = [
  "Taxista",
  "Constructor",
  "Carpintero",
  "Cajero",
  "Pescador",
  "Carnicero",
  "Policía",
  "Programador",
  "Mecánico",
  "Cocinero",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Trabaja para ganar algunas monedas"),
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
    const lastWork = user.lastWork || new Date(0);
    const difference = now - lastWork;
    const cooldown = 1000 * 60 * 60; // 1 hour cooldown

    if (difference < cooldown) {
      const timeLeft = cooldown - difference;
      const nextWorkTime = new Date(now.getTime() + timeLeft);
      return interaction.reply({
        content: `${emj.uses.alarm} Aún no puedes trabajar. Vuelve <t:${Math.floor(
          nextWorkTime / 1000
        )}:R>.`,
        ephemeral: true,
      });
    }

    const reward = Math.floor(Math.random() * 100) + 50; // Random reward between 50 and 150 coins
    user.balance += reward;
    user.lastWork = now;
    await user.save();

    const jobRandom = trabajos[Math.floor(Math.random() * trabajos.length)];

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(emb.color)
          .setDescription(
            `${emj.check} Trabajaste de \`${jobRandom}\` y has ganado \`${reward}\` coins.`
          ),
      ],
    });
  },
};
