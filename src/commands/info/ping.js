module.exports = {
  name: "ping",
  description: "Muestra la latencia del bot",
  category: "info",
  usage: "p!ping",
  aliases: ["latency"],
  owner: false,
  memberPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  async execute(message, args, client) {
    const apiLatency = client.ws.ping;
    const clientPing = Date.now() - message.createdTimestamp;

    const res = `**API Latency:** ${apiLatency}**ms**\n**Client Ping:** ${clientPing}**ms**`;
    await message.reply({ content: res });
  },
};
