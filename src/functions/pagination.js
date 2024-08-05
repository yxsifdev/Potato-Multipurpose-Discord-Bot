const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const emj = require("../botconfig/emojis.json");

async function pagination(context, pages, options = {}) {
  if (!context) throw new Error("El contexto es requerido.");
  if (!pages || !Array.isArray(pages))
    throw new Error("Se requiere un array de páginas.");
  if (pages.length === 0) throw new Error("El array de páginas está vacío.");

  const timeout = options.time || 300000; // 5 minutos por defecto
  const pageCounter = options.pageCounter !== false;

  let currentPage = 0;
  let isActive = true;

  const getContent = () => {
    return pageCounter
      ? `Página **${currentPage + 1}** de **${pages.length}**`
      : null;
  };

  const getButtons = () => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji(emj.buttons.arrow_back)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("random")
        .setEmoji(emj.buttons.arrowsshuffle)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("delete")
        .setEmoji(emj.buttons.trash)
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("jump")
        .setEmoji(emj.buttons.page_list)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji(emj.buttons.arrow_advance)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === pages.length - 1)
    );
  };

  const reply = await (context.replied || context.deferred
    ? context.editReply({
        content: getContent(),
        embeds: [pages[currentPage]],
        components: [getButtons()],
      })
    : context.reply({
        content: getContent(),
        embeds: [pages[currentPage]],
        components: [getButtons()],
        fetchReply: true,
      })
  ).catch((error) => {
    console.error("Error al enviar el mensaje inicial:", error);
    throw error;
  });

  const collector = reply.createMessageComponentCollector({ time: timeout });

  collector.on("collect", async (interaction) => {
    if (!isActive) return;

    if (
      interaction.user.id !== context.user?.id &&
      interaction.user.id !== context.author?.id
    ) {
      return interaction.reply({
        content: "No puedes usar estos botones.",
        ephemeral: true,
      });
    }

    switch (interaction.customId) {
      case "previous":
        currentPage = Math.max(0, currentPage - 1);
        break;
      case "next":
        currentPage = Math.min(pages.length - 1, currentPage + 1);
        break;
      case "random":
        currentPage = Math.floor(Math.random() * pages.length);
        break;
      case "delete":
        isActive = false;
        collector.stop();
        await interaction.message.delete().catch((error) => {
          console.error("No se pudo eliminar el mensaje de paginación:", error);
          interaction.reply({
            content:
              "No se pudo eliminar el mensaje. Por favor, inténtalo de nuevo más tarde.",
            ephemeral: true,
          });
        });
        return;
      case "jump":
        const modal = new ModalBuilder()
          .setCustomId("jumpModal")
          .setTitle("Salto de página");

        const pageInput = new TextInputBuilder()
          .setCustomId("pageNumber")
          .setLabel("Número de página")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(String(pages.length).length);

        modal.addComponents(new ActionRowBuilder().addComponents(pageInput));

        await interaction.showModal(modal);

        try {
          const modalInteraction = await interaction.awaitModalSubmit({
            time: 30000,
            filter: (i) =>
              i.customId === "jumpModal" && i.user.id === interaction.user.id,
          });

          const pageNumber = parseInt(
            modalInteraction.fields.getTextInputValue("pageNumber")
          );

          if (
            isNaN(pageNumber) ||
            pageNumber < 1 ||
            pageNumber > pages.length
          ) {
            await modalInteraction.reply({
              content: "Número de página inválido.",
              ephemeral: true,
            });
            return;
          }

          currentPage = pageNumber - 1;
          await updateMessage(modalInteraction);
        } catch (error) {
          // console.error(
          //   "Error en el manejo del modal de salto de página:",
          //   error
          // );
          return;
        }
        return;
    }

    await updateMessage(interaction);
  });

  collector.on("end", () => {
    if (!isActive) return;

    const disabledButtons = getButtons();
    disabledButtons.components.forEach((button) => button.setDisabled(true));

    reply.edit({ components: [disabledButtons] }).catch((error) => {
      console.error(
        "No se pudieron desactivar los botones después de que el colector terminara:",
        error
      );
    });
  });

  async function updateMessage(interaction) {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: getContent(),
          embeds: [pages[currentPage]],
          components: [getButtons()],
        });
      } else {
        await interaction.update({
          content: getContent(),
          embeds: [pages[currentPage]],
          components: [getButtons()],
        });
      }
    } catch (error) {
      console.error("Error al actualizar el mensaje:", error);
      try {
        await reply.edit({
          content: getContent(),
          embeds: [pages[currentPage]],
          components: [getButtons()],
        });
      } catch (editError) {
        console.error(
          "No se pudo actualizar el mensaje de paginación:",
          editError
        );
      }
    }
  }
}

module.exports = { pagination };
