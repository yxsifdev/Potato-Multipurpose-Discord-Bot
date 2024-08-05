const userLogSchema = require("../../schemas/user-logs");
const responses = require("../../botconfig/responses.json");
const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (!customId.startsWith("btnModAction")) return;

    const action = customId
      .split("_")[0]
      .replace("btnModAction", "")
      .toLowerCase();
    const userId = customId.split("_")[1];

    if (!userId) {
      return interaction.reply({
        content: responses.user.idNotFound,
        ephemeral: true,
      });
    }

    try {
      const guild = interaction.guild;
      const user = await guild.members.fetch(userId).catch(() => null);

      if (!user) {
        return interaction.reply({
          content: responses.user.userNotFound,
          ephemeral: true,
        });
      }

      switch (action) {
        case "refresh":
          await handleRefresh(interaction, user);
          break;
        case "avatar":
          await handleAvatar(interaction, user);
          break;
        case "ban":
          await handleBan(interaction, user);
          break;
        case "kick":
          await handleKick(interaction, user);
          break;
        case "mute":
          await handleMute(interaction, user, guild);
          break;
        case "mod":
          await handleMod(interaction, user, guild);
          break;
        default:
          return interaction.reply({
            content: responses.button.noAction,
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "🚫 Ocurrió un error al procesar la interacción.",
        ephemeral: true,
      });
    }
  });
};

async function handleRefresh(interaction, user) {
  const message = await interaction.message.fetch();
  const originalEmbed = message.embeds[0];

  let userData = await userLogSchema.findOne({ guildId: interaction.guild.id });
  if (!userData || !userData.warnings) {
    userData = { warnings: [] };
  }

  const accountCreateTimeStamp = Math.floor(
    user.user.createdAt.getTime() / 1000
  );
  let casos = userData.warnings.filter((w) => w.userId == user.id);

  const newEmbed = EmbedBuilder.from(originalEmbed).setDescription(
    `🆔 **ID:** ${
      user.id
    }\n🆕 **Creada:** <t:${accountCreateTimeStamp}:D> (<t:${accountCreateTimeStamp}:R>)\n🚨 **Sanciones:** ${
      casos.length > 0 ? casos.length : "No cuenta con sanciones."
    }`
  );

  await interaction.update({
    embeds: [newEmbed],
    ephemeral: true,
  });
}

async function handleAvatar(interaction, user) {
  await interaction.reply({
    content: `🖼️ **Avatar de ${
      user.displayName
    }:**\n${user.user.displayAvatarURL({ extension: "png", size: 2048 })}`,
    ephemeral: true,
  });
}

async function handleBan(interaction, user) {
  await user.ban({
    reason: "Acción de moderación mediante interacción con botones",
  });
  await interaction.reply({
    content: `🔨 El usuario ${user} (\`${user.displayName}\`) ha sido baneado del servidor.`,
    ephemeral: true,
  });
}

async function handleKick(interaction, user) {
  await user.kick("Acción de moderación mediante interacción con botones");
  await interaction.reply({
    content: `👢 El usuario ${user} (\`${user.displayName}\`) ha sido expulsado del servidor.`,
    ephemeral: true,
  });
}

async function handleMute(interaction, user, guild) {
  let muteRole = guild.roles.cache.find((role) => role.name === "Muted");
  if (!muteRole) {
    return interaction.reply({
      content: "❌ El rol `Muted` no ha sido encontrado.",
      ephemeral: true,
    });
  }

  if (user.roles.cache.has(muteRole.id)) {
    await user.roles.remove(
      muteRole,
      "Acción de moderación mediante interacción con botones."
    );
    return interaction.reply({
      content: `🔊 El usuario ${user} (\`${user.displayName}\`) ha sido desmutado.`,
      ephemeral: true,
    });
  }

  await user.roles.add(
    muteRole,
    "Acción de moderación mediante interacción con botones."
  );
  await interaction.reply({
    content: `🔇 El usuario ${user} (\`${user.displayName}\`) ha sido silenciado.`,
    ephemeral: true,
  });
}

async function handleMod(interaction, user, guild) {
  let modRole = guild.roles.cache.find((role) => role.name === "Moderator");
  if (!modRole) {
    return interaction.reply({
      content: "❌ El rol `Moderator` no ha sido encontrado.",
      ephemeral: true,
    });
  }

  if (user.roles.cache.has(modRole.id)) {
    await user.roles.remove(
      modRole,
      "Acción de moderación mediante interacción con botones."
    );
    return interaction.reply({
      content: `🔽 El rol de Moderador ha sido removido de ${user} (\`${user.displayName}\`).`,
      ephemeral: true,
    });
  }

  await user.roles.add(
    modRole,
    "Acción de moderación mediante interacción con botones."
  );
  await interaction.reply({
    content: `🔼 El rol de Moderador ha sido otorgado a ${user} (\`${user.displayName}\`).`,
    ephemeral: true,
  });
}
