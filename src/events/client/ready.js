require("colors")

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} ha iniciado sesión y está en línea`.brightGreen)
    }
}