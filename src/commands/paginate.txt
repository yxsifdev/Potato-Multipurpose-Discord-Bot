const { EmbedBuilder } = require("discord.js");
const { pagination } = require("../functions/pagination");

module.exports = {
  name: "paginate",
  description: "Muestra una lista paginada de elementos",
  usage: "p!paginate",
  async execute(message, args, client) {
    const pages = [
      new EmbedBuilder().setDescription("Página 1").setColor("Red"),
      new EmbedBuilder().setDescription("Página 2").setColor("Blue"),
      new EmbedBuilder().setDescription("Página 3").setColor("Green"),
    ];

    await pagination(message, pages, {
      time: 60000,
      fastSkip: true,
      pageCounter: true,
    });
  },
};
