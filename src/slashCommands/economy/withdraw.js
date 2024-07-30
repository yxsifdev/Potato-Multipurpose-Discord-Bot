const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../schemas/economy");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Retirar monedas en tu banco")
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de monedas a retirar")
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const { user, guild, options } = interaction;
    const userId = user.id;
    const guildId = guild.id;

    const amount = options.getInteger("cantidad");

    if (amount <= 0) {
      interaction.reply({
        content: `${emj.deny} Debes retirar una cantidad mayor a 0.`,
        ephemeral: true,
      });
      return;
    }

    let ecoData = await ecoSchema.findOne({ guildId, userId });

    if (!ecoData) {
      ecoData = new ecoSchema({ guildId, userId, balance: 0, bank: 0 });
      await ecoData.save();
    }

    if (amount > ecoData.bank) {
      interaction.reply({
        content: `${emj.deny} Solo cuentas con \`${ecoData.bank}\` monedas disponibles para depositar.`,
        ephemeral: true,
      });
      return;
    }

    ecoData.bank -= amount;
    ecoData.balance += amount;
    await ecoData.save();

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(emb.color)
          .setDescription(
            `${emj.check} Has retirado \`${amount}\` monedas en tu banco.`
          ),
      ],
    });
  },
};
