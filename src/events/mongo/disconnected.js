require("colors")

module.exports = {
    name: "disconnected",
    execute() {
        console.log(`[Database Status] Desconectada`.brightRed);
    }
}