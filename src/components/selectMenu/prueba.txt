module.exports = {
    data: {
        name: 'channel-select'
    },
    async execute(interaction) {
        const options = interaction.values;
        const selectedChannel = options[0];

        const sendResponse = async (content) => {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply(content);
            } else if (interaction.deferred) {
                await interaction.editReply(content);
            } else if (interaction.replied) {
                await interaction.followUp(content);
            }
        };

        if (selectedChannel === "1261352218570002452") {
            await sendResponse(`Canal de ticket!!! <#${selectedChannel}>`);
        } else {
            await sendResponse(`You selected the following options: <#${selectedChannel}>`);
        }
    }
};