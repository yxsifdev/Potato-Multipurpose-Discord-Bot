module.exports = { createProgressBar };

function createProgressBar(percentage) {
  // Asegurarse de que el porcentaje esté entre 0 y 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Calcular cuántos cuadrados llenos y vacíos necesitamos
  const totalSquares = 10;
  const filledSquares = Math.round((clampedPercentage / 100) * totalSquares);
  const emptySquares = totalSquares - filledSquares;

  // Crear la barra de progreso
  const filledChar = "▰";
  const emptyChar = "▱";
  const progressBar =
    filledChar.repeat(filledSquares) + emptyChar.repeat(emptySquares);

  // Añadir el porcentaje al final de la barra
  // return `${progressBar} ${clampedPercentage}%`;
  return `${progressBar}`;
}
