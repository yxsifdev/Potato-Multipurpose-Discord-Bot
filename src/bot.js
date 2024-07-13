require("dotenv").config();

const { token, databaseToken, prefix } = process.env;
const { connect } = require("mongoose");
const { Client, Collection, Partials, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
    intents: 53608447,
    allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: false,
    }
});
// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMembers,
//         GatewayIntentBits.MessageContent,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.GuildPresences,
//         GatewayIntentBits.GuildVoiceStates
//     ],
//     partials: [
//         Partials.Channel,
//         Partials.Message,
//         Partials.User,
//         Partials.GuildMember,
//     ],
// });
client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.slashCommandArray = [];
client.color = "#facc15";
client.prefix = prefix;

const functionFolders = fs.readdirSync(`./src/utils`);
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/utils/${folder}`)
        .filter(file => file.endsWith('.js'));
    for (const file of functionFiles) {
        require(`./utils/${folder}/${file}`)(client);
    }
}

client.handleEvents();
client.handleSlashCommands();
client.handlePrefixCommands();
client.handleComponents();
client.login(token);

(async () => {
    await connect(databaseToken).catch(console.error);
})();
