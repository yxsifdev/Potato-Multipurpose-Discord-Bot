const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Eliminar una cierta cantidad de mensajes")
    .addNumberOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a eliminar")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuario a quien eliminar mensajes")
        .setRequired(false)
    ),
  owner: false,
  botPermissions: ["ManageMessage"],
  memberPermissions: ["ManageMessage"],
  async execute(interaction, client) {
    const { channel, options } = interaction;
    const cantidad = options.getNumber("cantidad");
    const usuario = options.getUser("usuario");

    const messages = await channel.messages.fetch({ limit: cantidad + 1 });

    const res = new EmbedBuilder().setColor(emb.allow);

    try {
      if (usuario) {
        let i = 0;
        const filtered = [];

        messages.forEach((msg) => {
          if (msg.author.id === usuario.id && cantidad > i) {
            filtered.push(msg);
            i++;
          }
        });

        await channel.bulkDelete(filtered).then((messages) => {
          res.setDescription(
            `${emj.check} Eliminado ${messages.size} mensajes de ${usuario}`
          );
        });
      } else {
        await channel.bulkDelete(cantidad, true).then((messages) => {
          res.setDescription(
            `${emj.check} Eliminado ${messages.size} mensajes`
          );
        });
      }
    } catch (error) {
      console.error(error);
      res.setDescription(
        `${emj.deny} Algo salió mal al intentar eliminar los mensajes`
      );
    }

    interaction.reply({ embeds: [res], ephemeral: true });
  },
};
