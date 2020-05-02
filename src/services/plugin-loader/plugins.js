const { readdirSync, statSync } = require('fs');
const { join } = require('path');

async function loadPlugins(client) {
    // Get a list of folders in the plugins directory.
    const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
    let pluginList = dirs(__dirname + "/../../bot-plugins");
    // Load each plugin.
    let plugins = [];
    console.log("-> Loading Plugins...");
    for(let i = 0; i < pluginList.length; i++) {
        console.log("  -> Loading plugin " + pluginList[i]);
        plugins[i] = require("../../bot-plugins/" + pluginList[i] + "/index");
    }
    console.log("-> Activating Plugins...");
    for(let i = 0; i < pluginList.length; i++) {
        console.log("  -> Activating plugin " + pluginList[i]);
        await plugins[i](client, require("../../complexCommandMappings"), argumentParser);
    }
}
module.exports = loadPlugins;

function argumentParser(msg) {
    return [msg.substr(0, msg.indexOf(' ')), msg.substr(msg.indexOf(' ')+1)];
}
