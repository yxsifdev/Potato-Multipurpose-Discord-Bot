require("colors")

module.exports = {
    name: "err",
    execute(client) {
        console.log(`[Database Status] Ha ocurrido un error`.brightRed);
    }
}