const { ActivityType } = require("discord.js");
require("colors");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    await client.user.setPresence({
      activities: [
        {
          name: "Bot Multiproposito",
          type: ActivityType.Streaming,
          url: "https://www.twitch.tv/yxsifdev",
        },
      ],
    });
  },
};
