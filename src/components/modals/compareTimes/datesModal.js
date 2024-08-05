const { parseDate, sendComparisonResult } = require("../../../functions/timeCompareFunctions");
const moment = require("moment");
const emj = require("../../../botconfig/emojis.json");
const emb = require("../../../botconfig/embed.json");

module.exports = {
  data: {
    name: "dates_modal",
  },
  async execute(interaction, client) {
    const date1String = interaction.fields.getTextInputValue("date1");
    const date2String = interaction.fields.getTextInputValue("date2");

    const date1 = parseDate(date1String);
    const date2 = date2String ? parseDate(date2String) : moment();

    if (!date1 || (date2String && !date2)) {
      await interaction.reply({
        content: "❌ Una o ambas fechas no son válidas. Por favor, usa un formato de fecha reconocible (ej: YYYY-MM-DD, DD/MM/YYYY)",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({ content: "Calculando...", ephemeral: true });
    await sendComparisonResult(interaction, date1, date2);
  },
};