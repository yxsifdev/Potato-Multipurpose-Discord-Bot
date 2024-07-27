const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const emb = require("../botconfig/embed.json");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Perfil")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    const user = await client.users.fetch(interaction.targetId);
    const creationTimestamp = Math.floor(user.createdTimestamp / 1000);

    const embedProfile = new EmbedBuilder()
      .setTitle(`Información de ${user.tag}`)
      .setDescription(
        `**ID:** ${user.id}\n**Usuario:** ${user.tag}\n**Creación:** <t:${creationTimestamp}:d> (<t:${creationTimestamp}:R>)`
      )
      .setThumbnail(user.displayAvatarURL())
      .setURL(`https://discord.com/users/${user.id}`)
      .setColor(emb.color);

    await interaction.reply({ embeds: [embedProfile], ephemeral: true });
  },
};
