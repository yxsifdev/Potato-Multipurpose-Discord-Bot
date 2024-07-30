const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ecoSchema = require("../../schemas/economy");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposita monedas en tu banco")
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de monedas a depositar")
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
        content: `${emj.deny} Debes depositar una cantidad mayor a 0.`,
        ephemeral: true,
      });
      return;
    }

    let ecoData = await ecoSchema.findOne({ guildId, userId });

    if (!ecoData) {
      ecoData = new ecoSchema({ guildId, userId, balance: 0, bank: 0 });
      await ecoData.save();
    }

    if (amount > ecoData.balance) {
      interaction.reply({
        content: `${emj.deny} Solo cuentas con \`${ecoData.balance}\` monedas disponibles para depositar.`,
        ephemeral: true,
      });
      return;
    }

    ecoData.balance -= amount;
    ecoData.bank += amount;
    await ecoData.save();

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(emb.color)
          .setDescription(
            `${emj.check} Has depositado \`${amount}\` monedas en tu banco.`
          ),
      ],
    });
  },
};
