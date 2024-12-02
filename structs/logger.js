const chalk = require('chalk');

function backend(message) {
    return console.log("[" + chalk.blue("BACKEND") + "] " + message);
}

function error(message) {
    return console.log("[" + chalk.red("ERROR") + "] " + message);
}

function reboot(message) {
    return console.log("[" + chalk.hex('#ADD8E6')("REBOOT") + "] " + message);
}

function database(message) {
    return console.log("[" + chalk.green("DATABASE") + "] " + message);
}

function debug(message) {
    return console.log("[" + chalk.yellow("DEBUG") + "] " + message);
}


module.exports = {
    backend,
    error,
    reboot,
    database,
    debug
}