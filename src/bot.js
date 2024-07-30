require("dotenv").config();

const { token, databaseToken, prefix } = process.env;
const { connect } = require("mongoose");
const {
  Client,
  Collection,
  Partials,
  GatewayIntentBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: 53608447,
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: false,
  },
});

//Commands
client.prefixCommands = new Collection();
//SlashCommands
client.slashCommands = new Collection();
client.slashCommandArray = [];
//ContextCommands
client.contextCommands = new Collection();
client.contextCommandArray = [];
//Components
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
//Settings
client.color = "#facc15";
client.prefix = prefix;
//Others
client.cooldowns = new Collection();

const functionFolders = fs.readdirSync(path.join(__dirname, "utils"));
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(path.join(__dirname, "utils", folder))
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles) {
    require(path.join(__dirname, "utils", folder, file))(client);
  }
}

client.handleEvents();
client.handleSlashCommands();
client.handlePrefixCommands();
client.handleComponents();

client
  .login(token)
  .then(() => {
    console.log(
      `${client.user.tag} ha iniciado sesión y está en línea`.brightYellow
    );
    console.log(`Prefix commands: ${client.prefixCommands.size}`.brightGreen);
    console.log(`Slash commands: ${client.slashCommands.size}`.brightGreen);
    console.log(
      `Context menu commands: ${client.contextCommands.size}`.brightGreen
    );
    console.log(`Buttons: ${client.buttons.size}`.brightGreen);
    console.log(`Select menus: ${client.selectMenus.size}`.brightGreen);
    console.log(`Modals: ${client.modals.size}`.brightGreen);
  })
  .catch(console.error);

(async () => {
  await connect(databaseToken).catch(console.error);
})();
