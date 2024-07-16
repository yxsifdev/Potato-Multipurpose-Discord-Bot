# Guia para el handler

## Estructura para crear comando de prefijo:

```js
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  name: "cmd-name",
  description: "cmd-name",
  category: "",
  usage: "p!cmd-name",
  aliases: [],
  owner: false,
  memberPermissions: [],
  botPermissions: [],
  async execute(message, args, client) {},
};
```

## Estructura para crear comando slash:

```js
const { SlashCommandBuilder } = require("discord.js");
const emj = require("../../botconfig/emojis.json");
const emb = require("../../botconfig/embed.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cmd-name")
    .setDescription("Return cmd-name"),
  async execute(interaction, client) {},
};
```
