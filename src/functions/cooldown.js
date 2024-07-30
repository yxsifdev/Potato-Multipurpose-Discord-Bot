function handleCooldown(client, commandName, userId, cooldownAmount) {
  if (!client.cooldowns.has(commandName)) {
    client.cooldowns.set(commandName, new Map());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(commandName);
  const cooldownTime = cooldownAmount * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownTime;

    if (now < expirationTime) {
      const expirationTimestamp = Math.floor(expirationTime / 1000);
      return {
        onCooldown: true,
        message: `<@${userId}>, Por favor, espera hasta <t:${expirationTimestamp}:R> antes de usar el comando \`${commandName}\` de nuevo.`,
      };
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownTime);
  return { onCooldown: false };
}

module.exports = { handleCooldown };
