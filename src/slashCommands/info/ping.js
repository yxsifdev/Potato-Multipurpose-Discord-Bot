const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia del bot"),
  owner: false,
  botPermissions: [], 
  memberPermissions: [],
  async execute(interaction, client) {
    const apiLatency = client.ws.ping;
    const clientPing = Date.now() - interaction.createdTimestamp;

    const res = `**API Latency:** ${apiLatency}**ms**\n**Client Ping:** ${clientPing}**ms**`;
    await interaction.reply({ content: res });
  },
};
