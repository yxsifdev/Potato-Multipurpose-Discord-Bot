const { EmbedBuilder } = require("discord.js");
const { handleCooldown } = require("../../functions/cooldown");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emj = require("../../botconfig/emojis.json");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.content.startsWith(client.prefix) || message.author.bot)
      return;
    const args = message.content.slice(client.prefix.length).trim().split(/ +/);

    const commandName = args.shift().toLowerCase();
    const command =
      client.prefixCommands.get(commandName) ||
      client.prefixCommands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (command) {
      if (command.cooldown) {
        const cooldownResult = handleCooldown(
          client,
          commandName,
          message.author.id,
          command.cooldown
        );
        if (cooldownResult.onCooldown) {
          try {
            const reply = await message.channel.send(cooldownResult.message);
            setTimeout(() => {
              reply
                .delete()
                .catch((error) =>
                  console.error(
                    "Error al eliminar el mensaje de cooldown:",
                    error
                  )
                );
            }, 5000);
          } catch (error) {
            console.error(
              "Error al enviar o eliminar el mensaje de cooldown:",
              error
            );
          }
          return;
        }
      }

      if (command.owner && !config.owners.includes(message.author.id)) return;
      if (command.botPermissions) {
        if (!message.guild.members.me.permissions.has(command.botPermissions))
          return;
      }
      if (command.memberPermissions) {
        if (!message.member.permissions.has(command.memberPermissions)) return;
      }

      try {
        await command.execute(message, args, client);
      } catch (error) {
        console.error(error);
        await message.reply(`Algo salió mal al ejecutar este comando.`);
      }
    }
  },
};
