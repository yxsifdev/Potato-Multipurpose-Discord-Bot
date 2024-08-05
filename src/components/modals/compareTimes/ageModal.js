const { parseDate, sendAgeResult } = require("../../../functions/timeCompareFunctions");
const emj = require("../../../botconfig/emojis.json");
const emb = require("../../../botconfig/embed.json");

module.exports = {
  data: {
    name: "age_modal",
  },
  async execute(interaction, client) {
    const birthdateString = interaction.fields.getTextInputValue("birthdate");
    const birthdate = parseDate(birthdateString);

    if (!birthdate) {
      await interaction.reply({
        content: "❌ La fecha de nacimiento no es válida. Por favor, usa un formato de fecha reconocible (ej: YYYY-MM-DD, DD/MM/YYYY)",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({ content: "Calculando...", ephemeral: true });
    await sendAgeResult(interaction, birthdate);
  },
};