const moment = require("moment");
const { EmbedBuilder } = require("discord.js");

function parseDate(dateString) {
  const formats = [
    moment.ISO_8601,
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY/MM/DD",
  ];

  for (let format of formats) {
    const date = moment(dateString, format, true);
    if (date.isValid()) {
      return date;
    }
  }

  return null;
}

async function sendComparisonResult(interaction, date1, date2) {
  const duration = moment.duration(date2.diff(date1));
  const difference = [
    `${Math.abs(duration.years())} años`,
    `${Math.abs(duration.months())} meses`,
    `${Math.abs(duration.days())} días`,
    `${Math.abs(duration.hours())} horas`,
    `${Math.abs(duration.minutes())} minutos`,
    `${Math.abs(duration.seconds())} segundos`,
  ]
    .filter((unit) => !unit.startsWith("0"))
    .join(", ");

  const comparisonEmbed = new EmbedBuilder()
    .setColor("#4CAF50")
    .setTitle("🚀 ¡Viaje en el Tiempo Completado! 🕰️")
    .addFields(
      {
        name: "🚀 Punto de partida",
        value: date1.format("YYYY-MM-DD HH:mm:ss"),
        inline: true,
      },
      {
        name: "🏁 Destino",
        value: date2.format("YYYY-MM-DD HH:mm:ss"),
        inline: true,
      },
      { name: "⏳ Tiempo viajado", value: difference || "¡Mismo momento!" }
    )
    .setFooter({
      text: date2.isAfter(date1)
        ? "¡Viajamos al futuro! 🔮"
        : "¡Retrocedimos en el tiempo! 🦖",
    })
    .setTimestamp();

  await interaction.editReply({
    content: "",
    embeds: [comparisonEmbed],
    components: [],
  });
  // ... (el mismo código que tenías antes para crear y enviar el embed de comparación)
}

async function sendAgeResult(interaction, birthdate) {
  const now = moment();
  const age = moment.duration(now.diff(birthdate));
  const ageString = `${age.years()} años, ${age.months()} meses y ${age.days()} días`;

  const nextBirthday = moment(birthdate).year(now.year());
  if (nextBirthday.isBefore(now)) {
    nextBirthday.add(1, "year");
  }
  const daysUntilBirthday = nextBirthday.diff(now, "days");

  const ageEmbed = new EmbedBuilder()
    .setColor("#4CAF50")
    .setTitle("🎂 Cálculo de Edad 🕰️")
    .addFields(
      {
        name: "🚀 Fecha de Nacimiento",
        value: birthdate.format("YYYY-MM-DD"),
        inline: true,
      },
      {
        name: "🏁 Fecha Actual",
        value: now.format("YYYY-MM-DD"),
        inline: true,
      },
      { name: "⏳ Edad", value: ageString },
      {
        name: "🎉 Próximo Cumpleaños",
        value: `En ${daysUntilBirthday} días`,
      }
    )
    .setFooter({
      text: "¡El tiempo vuela cuando te diviertes! 🦋",
    })
    .setTimestamp();

  await interaction.editReply({
    content: "",
    embeds: [ageEmbed],
    components: [],
  });
  // ... (el mismo código que tenías antes para crear y enviar el embed de edad)
}

module.exports = {
  parseDate,
  sendComparisonResult,
  sendAgeResult,
};
