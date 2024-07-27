const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription('Responde una pregunta al estilo "8 ball"')
    .addStringOption((option) =>
      option
        .setName("pregunta")
        .setDescription("Pregunta a responder")
        .setRequired(true)
    ),
  owner: false,
  botPermissions: [],
  memberPermissions: [],
  async execute(interaction, client) {
    const { options } = interaction;
    const pregunta = options.getString("pregunta");
    if (pregunta.length < 5)
      return interaction.reply({
        content: `${emj.deny} No comprendo tu pregunta`,
      });

    const opciones = [
      "Si",
      "Tal vez",
      "No",
      "Pregunta más tarde",
      "No creo",
      "No lo se",
    ];

    const res = opciones[Math.floor(Math.random() * opciones.length)];
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `🎱 Bola mágica`,
          })
          .addFields(
            {
              name: "Pregunta",
              value: pregunta,
            },
            {
              name: "Respuesta",
              value: res,
            }
          )
          .setColor("Random"),
      ],
    });
  },
};
