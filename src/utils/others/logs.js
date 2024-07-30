const { EmbedBuilder, ChannelType } = require("discord.js");
const LogSettings = require("../../schemas/logs"); // Ajusta la ruta según sea necesario
const emb = require("../../botconfig/embed.json");

const colors = {
  JOIN: emb.allow,
  LEAVE: emb.deny,
  DELETE: emb.deny,
  EDIT: emb.dude,
  CREATE: emb.allow,
  BAN: emb.deny,
  UNBAN: emb.allow,
  NICKNAME: emb.color,
};

const emojis = {
  JOIN: "👋",
  LEAVE: "🚪",
  DELETE: "🗑️",
  EDIT: "✏️",
  CREATE: "🆕",
  BAN: "🔨",
  UNBAN: "🔓",
  NICKNAME: "📝",
};

const channelTypes = {
  [ChannelType.GuildText]: "Text Channel",
  [ChannelType.GuildVoice]: "Voice Channel",
  [ChannelType.GuildCategory]: "Category",
  [ChannelType.GuildStageVoice]: "Stage Channel",
};

async function sendLogEmbed(guild, embedData) {
  const logSettings = await LogSettings.findOne({ guildId: guild.id });
  if (logSettings?.logChannelId) {
    const logChannel = guild.channels.cache.get(logSettings.logChannelId);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor(embedData.color)
        .setTitle(`${embedData.emoji} ${embedData.title}`)
        .setDescription(embedData.description)
        .setTimestamp();

      if (embedData.fields && Array.isArray(embedData.fields)) {
        const validFields = embedData.fields.map((field) => ({
          name: field.name.substring(0, 256) || "\u200B",
          value: field.value.toString().substring(0, 1024) || "\u200B",
          inline: !!field.inline,
        }));
        embed.addFields(validFields);
      }

      if (embedData.thumbnail) {
        embed.setThumbnail(embedData.thumbnail);
      }

      await logChannel.send({ embeds: [embed] });
    }
  }
}

module.exports = (client) => {
  // Member Join
  client.on("guildMemberAdd", async (member) => {
    const logSettings = await LogSettings.findOne({ guildId: member.guild.id });
    if (logSettings?.enabledLogs?.memberJoin) {
      await sendLogEmbed(member.guild, {
        color: colors.JOIN,
        emoji: emojis.JOIN,
        title: "Nuevo Miembro",
        description: `${member.user.tag} se ha unido al servidor.`,
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "ID", value: member.id, inline: true },
          {
            name: "Cuenta Creada",
            value: member.user.createdAt.toUTCString(),
            inline: true,
          },
        ],
      });
    }
  });

  // Member Leave
  client.on("guildMemberRemove", async (member) => {
    const logSettings = await LogSettings.findOne({ guildId: member.guild.id });
    if (logSettings?.enabledLogs?.memberLeave) {
      await sendLogEmbed(member.guild, {
        color: colors.LEAVE,
        emoji: emojis.LEAVE,
        title: "Miembro Salió",
        description: `${member.user.tag} ha abandonado el servidor.`,
        thumbnail: member.user.displayAvatarURL(),
        fields: [
          { name: "ID", value: member.id, inline: true },
          {
            name: "Se Unió",
            value: member.joinedAt.toUTCString(),
            inline: true,
          },
        ],
      });
    }
  });

  // Message Delete
  client.on("messageDelete", async (message) => {
    if (message.author.bot) return;
    const logSettings = await LogSettings.findOne({
      guildId: message.guild.id,
    });
    if (logSettings?.enabledLogs?.messageDelete) {
      await sendLogEmbed(message.guild, {
        color: colors.DELETE,
        emoji: emojis.DELETE,
        title: "Mensaje Eliminado",
        description: `Un mensaje de ${message.author.tag} fue eliminado en ${message.channel}.`,
        fields: [
          {
            name: "Contenido",
            value: message.content.substring(0, 1024) || "Sin contenido",
          },
          { name: "ID del Autor", value: message.author.id, inline: true },
          { name: "ID del Canal", value: message.channel.id, inline: true },
        ],
      });
    }
  });

  // Message Edit
  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    const logSettings = await LogSettings.findOne({
      guildId: oldMessage.guild.id,
    });
    if (
      logSettings?.enabledLogs?.messageEdit &&
      oldMessage.content !== newMessage.content
    ) {
      await sendLogEmbed(oldMessage.guild, {
        color: colors.EDIT,
        emoji: emojis.EDIT,
        title: "Mensaje Editado",
        description: `Un mensaje de ${oldMessage.author.tag} fue editado en ${oldMessage.channel}.`,
        fields: [
          {
            name: "Antes",
            value: oldMessage.content.substring(0, 1024) || "Sin contenido",
          },
          {
            name: "Después",
            value: newMessage.content.substring(0, 1024) || "Sin contenido",
          },
          { name: "ID del Autor", value: oldMessage.author.id, inline: true },
          { name: "ID del Canal", value: oldMessage.channel.id, inline: true },
        ],
      });
    }
  });

  // Channel Create
  client.on("channelCreate", async (channel) => {
    const logSettings = await LogSettings.findOne({
      guildId: channel.guild.id,
    });

    if (logSettings?.enabledLogs?.channelCreate) {
      await sendLogEmbed(channel.guild, {
        color: colors.CREATE,
        emoji: emojis.CREATE,
        title: "Canal Creado",
        description: `Se ha creado un nuevo canal: ${channel || channel.name}`,
        fields: [
          { name: "ID del Canal", value: channel.id, inline: true },
          {
            name: "Tipo",
            value: channelTypes[channel.type] || channel.type,
            inline: true,
          },
        ],
      });
    }
  });

  // Channel Delete
  client.on("channelDelete", async (channel) => {
    const logSettings = await LogSettings.findOne({
      guildId: channel.guild.id,
    });
    if (logSettings?.enabledLogs?.channelDelete) {
      await sendLogEmbed(channel.guild, {
        color: colors.DELETE,
        emoji: emojis.DELETE,
        title: "Canal Eliminado",
        description: `Se ha eliminado un canal: ${channel.name}`,
        fields: [
          { name: "ID del Canal", value: channel.id, inline: true },
          {
            name: "Tipo",
            value: channelTypes[channel.type] || channel.type,
            inline: true,
          },
        ],
      });
    }
  });

  // Role Create
  client.on("roleCreate", async (role) => {
    const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
    if (logSettings?.enabledLogs?.roleCreate) {
      await sendLogEmbed(role.guild, {
        color: colors.CREATE,
        emoji: emojis.CREATE,
        title: "Rol Creado",
        description: `Se ha creado un nuevo rol: ${role.name}`,
        fields: [
          { name: "ID del Rol", value: role.id, inline: true },
          { name: "Color", value: role.hexColor, inline: true },
        ],
      });
    }
  });

  // Role Delete
  client.on("roleDelete", async (role) => {
    const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
    if (logSettings?.enabledLogs?.roleDelete) {
      await sendLogEmbed(role.guild, {
        color: colors.DELETE,
        emoji: emojis.DELETE,
        title: "Rol Eliminado",
        description: `Se ha eliminado un rol: ${role.name}`,
        fields: [
          { name: "ID del Rol", value: role.id, inline: true },
          { name: "Color", value: role.hexColor, inline: true },
        ],
      });
    }
  });

  // Ban
  client.on("guildBanAdd", async (ban) => {
    const logSettings = await LogSettings.findOne({ guildId: ban.guild.id });
    if (logSettings?.enabledLogs?.ban) {
      await sendLogEmbed(ban.guild, {
        color: colors.BAN,
        emoji: emojis.BAN,
        title: "Usuario Baneado",
        description: `${ban.user.tag} ha sido baneado del servidor.`,
        thumbnail: ban.user.displayAvatarURL(),
        fields: [
          { name: "ID del Usuario", value: ban.user.id, inline: true },
          {
            name: "Razón",
            value: ban.reason || "No especificada",
            inline: true,
          },
        ],
      });
    }
  });

  // Unban
  client.on("guildBanRemove", async (ban) => {
    const logSettings = await LogSettings.findOne({ guildId: ban.guild.id });
    if (logSettings?.enabledLogs?.unban) {
      await sendLogEmbed(ban.guild, {
        color: colors.UNBAN,
        emoji: emojis.UNBAN,
        title: "Usuario Desbaneado",
        description: `${ban.user.tag} ha sido desbaneado del servidor.`,
        thumbnail: ban.user.displayAvatarURL(),
        fields: [{ name: "ID del Usuario", value: ban.user.id, inline: true }],
      });
    }
  });

  // Nickname Change
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
      const logSettings = await LogSettings.findOne({
        guildId: newMember.guild.id,
      });
      if (logSettings?.enabledLogs?.nicknameChange) {
        await sendLogEmbed(newMember.guild, {
          color: colors.NICKNAME,
          emoji: emojis.NICKNAME,
          title: "Cambio de Apodo",
          description: `El apodo de ${
            newMember.user || newMember.user.tag
          } ha sido cambiado.`,
          thumbnail: newMember.user.displayAvatarURL(),
          fields: [
            { name: "Usuario", value: newMember.user.tag, inline: true },
            { name: "ID del Usuario", value: newMember.id, inline: true },
            {
              name: "Apodo Anterior",
              value: oldMember.nickname || "Ninguno",
              inline: true,
            },
            {
              name: "Nuevo Apodo",
              value: newMember.nickname || "Ninguno",
              inline: true,
            },
          ],
        });
      }
    }
  });
};
