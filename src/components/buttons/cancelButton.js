const emj = require('../../botconfig/emojis.json');

module.exports = {
    data: {
        name: "cancelar-sancion"
    },
    async execute(interaction, client) {
        interaction.update({ content: `${emj.check} Panel de acciones cancelado.`, components: [] });
    }
}