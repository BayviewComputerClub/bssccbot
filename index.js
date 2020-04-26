// BSSCC Bot

console.log("Starting BSSCCBot...");

require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const {mapCommand} = require('./commandHandler');

let isLoaded = false;

function argumentParser(msg) {
    return [msg.substr(0, msg.indexOf(' ')), msg.substr(msg.indexOf(' ')+1)];
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Begin loading plugins.
    await loadPlugins();
});

client.on('message', msg => {
    mapCommand(msg);
});

client.login(process.env.BOT_TOKEN).then(r => {});

// Load Plugins
async function loadPlugins() {
    if(!isLoaded) {
        // Get a list of folders in the plugins directory.
        const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
        let pluginList = dirs("./bot-plugins");
        // Load each plugin.
        let plugins = [];
        console.log("-> Loading Plugins...");
        for(let i = 0; i < pluginList.length; i++) {
            console.log("  -> Loading plugin " + pluginList[i]);
            plugins[i] = require("./bot-plugins/" + pluginList[i] + "/index");
        }
        console.log("-> Activating Plugins...");
        for(let i = 0; i < pluginList.length; i++) {
            console.log("  -> Activating plugin " + pluginList[i]);
            await plugins[i](client, require("./complexCommandMappings"), argumentParser);
        }
        isLoaded = true;
        console.log("-> BSSCC Bot has started!")
    } else {
        console.log("[Debug] The bot has reconnected.");
    }
}
