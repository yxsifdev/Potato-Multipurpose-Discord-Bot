const { SlashCommandBuilder } = require("discord.js");

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: 'Who wrote "To Kill a Mockingbird"?',
    options: ["Harper Lee", "J.K. Rowling", "Mark Twain", "Ernest Hemingway"],
    answer: "Harper Lee",
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Inicia un juego de trivia"),
  owner: false,
  botPermissions: [],
  memberPermissions: [],
  async execute(interaction, client) {
    const question = questions[Math.floor(Math.random() * questions.length)];

    const optionsText = question.options
      .map((option, index) => {
        return `${index + 1}. ${option}`;
      })
      .join("\n");

    await interaction.reply({
      content: `**Pregunta:** ${question.question}\n${optionsText}`,
    });

    // Crear un filtro para la respuesta correcta
    const filter = (response) => {
      const answerIndex = parseInt(response.content);
      return (
        response.author.id === interaction.user.id &&
        answerIndex > 0 &&
        answerIndex <= question.options.length
      );
    };

    interaction.channel
      .awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
      .then((collected) => {
        const response = collected.first();
        const answerIndex = parseInt(response.content) - 1;
        const answer = question.options[answerIndex];

        if (answer === question.answer) {
          interaction.followUp({ content: "¡Correcto! 🎉" });
        } else {
          interaction.followUp({
            content: `Incorrecto. La respuesta correcta es: **${question.answer}**`,
          });
        }
      })
      .catch(() => {
        interaction.followUp({
          content:
            "No recibí una respuesta a tiempo. Inténtalo de nuevo más tarde.",
        });
      });
  },
};
