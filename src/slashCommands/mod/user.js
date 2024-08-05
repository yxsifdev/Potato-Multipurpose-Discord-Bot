const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const userLogSchema = require("../../schemas/user-logs");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Panel de moderación")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Ingresa el usuario a moderar.")
        .setRequired(true)
    ),
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(interaction, client) {
    const { options, iUser, guild } = interaction;
    const sUser = options.getUser("usuario") || iUser;

    let userData = await userLogSchema.findOne({ guildId: guild.id });
    const accountCreateTimeStamp = Math.floor(sUser.createdAt / 1000);

    if (!userData) return interaction.reply("No hay datos...");

    let casos = userData.warnings.filter((w) => w.userId == sUser.id);

    let buttonBan = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`btnModActionBan_${sUser.id}`)
      .setLabel("Banear")
      .setEmoji("🔨");
    let buttonKick = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`btnModActionKick_${sUser.id}`)
      .setLabel("Expulsar")
      .setEmoji("🦵");
    let buttonMute = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`btnModActionMute_${sUser.id}`)
      .setLabel("Silenciar")
      .setEmoji("🤫");
    let buttonRefresh = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`btnModActionRefresh_${sUser.id}`)
      .setLabel("Actualizar")
      .setEmoji("🔁");
    let buttonAvatar = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setCustomId(`btnModActionAvatar_${sUser.id}`)
      .setLabel("Avatar")
      .setEmoji("👤");
    let buttonMod = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId(`btnModActionMod_${sUser.id}`)
      .setLabel("Mod")
      .setEmoji("🛡️");

    const row1 = new ActionRowBuilder().addComponents(
      buttonBan,
      buttonKick,
      buttonMute
    );
    const row2 = new ActionRowBuilder().addComponents(
      buttonRefresh,
      buttonAvatar,
      buttonMod
    );

    const resEmbed = new EmbedBuilder()
      .setColor(emb.color)
      .setAuthor({ name: `${sUser.tag}`, iconURL: sUser.displayAvatarURL() })
      .setDescription(
        ` 🆔 **ID:** ${
          sUser.id
        }\n🆕 **Creada:** <t:${accountCreateTimeStamp}:D> (<t:${accountCreateTimeStamp}:R>)\n🚨 **Sanciones:** ${
          casos.length || "No cuenta con sanciones."
        }`
      );

    await interaction.reply({ embeds: [resEmbed], components: [row1, row2] });
  },
};
