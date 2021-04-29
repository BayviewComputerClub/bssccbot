/*
    BSSCCBot for Discord
    Copyright (C) 2021  Seshan Ravikumar

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

console.log("Starting BSSCCBot...");

require('dotenv').config();
const Discord = require('discord.js');

const {mapCommand} = require('./commandHandler');
const {initDB, connectDB} = require('./services/database/database');

const loadPlugins = require("./services/plugin-loader/plugins");

let isLoaded = false;

// Connect to Discord
const client = new Discord.Client({disableEveryone: true, disableMentions: 'everyone'});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Kick-off loading.
    await main();
});

client.on('message', async (msg) => {
    await mapCommand(msg);
});

client.login(process.env.BOT_TOKEN).then(r => {});

//Main Function
async function main() {
    if(!isLoaded) {
        try {
            // Create databases if they don't exist
            await initDB();

            // Connect to SQL Server
            await connectDB();

            // Load Plugins
            await loadPlugins(client);

            isLoaded = true;
            console.log("-> BSSCC Bot has started!")
        } catch (e) {
            console.error("Failed to start BSSCCBot:");
            console.error(e);
            process.exit(1);
        }

    } else {
        console.log("[Debug] The bot has reconnected.");
    }
}
