const axios = require("axios");
const os = require('os');
const sql = require('mssql');
const {createUserIfNotExists} = require("../../services/database");

const util = require('util');
const exec = util.promisify(require('child_process').exec);

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function init(client, cm, ap) {
    let pool = await sql.connect();
    cm.push(
        {
            "command": "joke",
            "handler": async (msg) => {
                axios.defaults.headers = {
                    'Accept': 'text/plain',
                };
                const response = await axios.get('https://icanhazdadjoke.com/');
                await msg.reply(response.data);
            }
        }
    );
    cm.push(
        {
            "command": "fortune",
            "handler": async (msg) => {
                try {
                    const { stdout } = await exec('fortune');
                    await msg.channel.send(stdout);
                } catch (e) {
                    await msg.channel.send(e.message);
                }
            }
        }
    );
    cm.push(
        {
            "command": "cowsay",
            "handler": async (msg) => {
                let text = ap(msg.content)[1].replace(/(\r\n|\n|\r)/gm,"");

                try {
                    const { stdout } = await exec('cowsay ' + text);
                    await msg.channel.send("```bash\n" + stdout + "```");
                } catch (e) {
                    await msg.channel.send(e.message);
                }
            }
        }
    );
    cm.push(
        {
            "command": "xkcd",
            "handler": async (msg) => {
                let args = ap(msg.content);
                try {
                    if(args[0] === "") {
                        // Get random comic
                        // Get the latest comic to determine the ID upper bounds
                        const maxID = (await axios.get('https://xkcd.com/info.0.json')).data.num;
                        let id = getRandomInt(maxID);
                        const comic = (await axios.get('https://xkcd.com/' + id + '/info.0.json')).data;
                        msg.channel.send(`XKCD ${id} - ${comic.title}\n${comic.img}`);
                        msg.channel.send("> " + comic.alt);

                    } else if(args[1].toLowerCase() === "latest") {
                        // Get latest comic
                        const comic = (await axios.get('https://xkcd.com/info.0.json')).data;
                        msg.channel.send(`XKCD ${comic.num} - ${comic.title}\n${comic.img}`);
                        msg.channel.send("> " + comic.alt);
                    } else {
                        let comicID = args[1];
                        const comic = (await axios.get('https://xkcd.com/' + comicID + '/info.0.json')).data;
                        msg.channel.send(`XKCD ${comicID} - ${comic.title}\n${comic.img}`);
                        msg.channel.send("> " + comic.alt);
                    }
                } catch (e) {
                    msg.channel.send("Could not get comic!");
                    msg.channel.send(e.message);
                    console.log(e);
                }

            }
        }
    );
    cm.push(
        {
            "command": "roll",
            "handler": (msg) => {
                msg.reply(getRandomInt(5) + 1); // 1-6
            }
        }
    );
    cm.push(
        {
            "command": "random",
            "handler": (msg) => {
                if(isNaN(ap(msg.content)[1])) {
                    msg.reply("Please specify the max int!");
                    return;
                }
                msg.reply(getRandomInt(ap(msg.content)[1])); // 1-6
            }
        }
    );
    cm.push({
        "command": "stats",
        "handler": async (msg) => {
            let args = ap(msg.content);
            if(args[0] === "") {
                await msg.reply("I need a user to check the stats for!");
                return;
            }
            let user = msg.mentions.users.first();

            await createUserIfNotExists(msg.author.id);
            try {
                let numMessages = (await pool.request()
                    .input("user_id", user.id)
                    .query("SELECT num_messages FROM users WHERE user_id = @user_id"))
                    .recordset[0]
                    .num_messages;
                msg.channel.send(`**Stats for ${user.username}**\nTotal Messages Sent: ${numMessages}`);
            } catch (e) {
                msg.channel.send("No stats for that user yet!");
                console.error(e);
            }

        }
    });
    cm.push(
        {
            "command": "clear",
            "handler": (msg) => {
                let clearMsg = "\n";
                msg.channel.send("." + clearMsg.repeat(1000) + "All Clean :smile:"); // 1-6
            }
        }
    );
    cm.push(
        {
            "command": "info",
            "handler": (msg) => {
                msg.reply("I am running Node " + process.version + " on " + os.platform() + " " + os.release());
            }
        }
    );
    cm.push(
        {
            "command": "restart",
            "handler": async (msg) => {
                await msg.reply("Goodbye...");
                process.exit(0);
            }
        }
    );
    cm.push(
        {
            "command": "die",
            "handler": async (msg) => {
                await msg.reply("Goodbye...");
                process.exit(0);
            }
        }
    );

    // ~~ message events ~~
    client.on("message", async (msg) => {
        // Increment the total number of messages in the DB.
        if(msg.author.id === process.env.BOT_ID) {
            return;
        }
        try {
            await createUserIfNotExists(msg.author.id);
            await pool.request()
                .input("user_id", msg.author.id)
                .query("UPDATE users SET num_messages = num_messages + 1 WHERE user_id = @user_id");
        } catch (e) {
            console.error("Major Database Error!!!");
            console.error(e);
        }

    });


}

module.exports = init;
