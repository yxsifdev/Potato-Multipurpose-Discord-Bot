const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const {
  sendComparisonResult,
  sendAgeResult,
} = require("../../functions/timeCompareFunctions");

module.exports = {
  name: "compare-time",
  description: "¡Compara fechas o calcula tu edad de forma interactiva.",
  usage: "p!compare-time",
  aliases: [],
  cooldown: 5,
  async execute(message, args, client) {
    const initialEmbed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle("🚀 Comparador de Tiempo Interactivo 🕰️")
      .setDescription("Selecciona qué quieres hacer:")
      .setFooter({ text: "¡Exploremos el tiempo!" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("compare_dates")
        .setLabel("Comparar Fechas")
        .setStyle("Primary"),
      new ButtonBuilder()
        .setCustomId("calculate_age")
        .setLabel("Calcular Edad")
        .setStyle("Secondary")
    );

    await message.reply({
      embeds: [initialEmbed],
      components: [row],
    });
  },
};
