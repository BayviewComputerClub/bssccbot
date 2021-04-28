const axios = require("axios");
const os = require('os');
const sql = require('mssql');
const eightball = require('8ball');
const wiki = require('wikijs').default;
const truncate = require('truncate');
const svg2img = require('svg2img');
const {createUserIfNotExists} = require("../../services/database/database");

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
            "category": "Essentials",
            "desc": "Tells a random dad joke",
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
            "category": "Essentials",
            "desc": "Tells you your fortune",
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
            "category": "Essentials",
            "desc": "Makes a cow say the message (!cowsay [text])",
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
            "category": "Essentials",
            "desc": "Gets an XKCD comic (!xkcd, !xkcd latest, !xkcd [comic number])",
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
            "category": "Essentials",
            "desc": "Roll a 6-sided die",
            "handler": (msg) => {
                msg.reply(getRandomInt(5) + 1); // 1-6
            }
        }
    );
    cm.push(
        {
            "command": "random",
            "category": "Essentials",
            "desc": "Get a random number (!random [max number])",
            "handler": (msg) => {
                if(isNaN(ap(msg.content)[1])) {
                    msg.reply("Please specify the max int!");
                    return;
                }
                msg.reply(getRandomInt(ap(msg.content)[1])); // 1-6
            }
        }
    );
    cm.push(
        {
            "command": "8ball",
            "category": "Essentials",
            "desc": "Let the Magic 8-Ball:tm: answer your question",
            "handler": (msg) => {
                msg.reply(eightball() + + ".");
            }
        }
    );
    cm.push(
        {
            "command": "wiki",
            "category": "Essentials",
            "desc": "Lookup the Wikipedia article for a topic (!wiki [topic])",
            "handler": async (msg) => {
                let args = ap(msg.content);
                let articleSearch = await wiki().search(args[1]);
                if(articleSearch.results.length === 0) {
                    msg.reply(":x: No articles for " + args[1] + " found!");
                    return;
                }
                let article = await wiki().page(articleSearch.results[0])
                let summary = await article.summary();
                let mainImage = await article.mainImage();
                let url = await article.url();
                if(mainImage.endsWith("svg")) {
                    svg2img(
                        mainImage,
                        async (error, buffer) => {
                            await msg.channel.send("", {
                                files: [{
                                    attachment: buffer,
                                    name: 'wikipedia-image.png'
                                }]
                            });
                            await msg.channel.send(truncate(summary, 1000) + "\n <" + url + ">");
                        });
                } else {
                    await msg.channel.send(mainImage)
                    await msg.channel.send(truncate(summary, 1000) + "\n <" + url + ">");
                }
            }
        }
    );
    cm.push({
        "command": "stats",
        "category": "Essentials",
        "desc": "See how many messages a user has sent (!stats @user)",
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
    cm.push({
        "command": "stats-top",
        "category": "Essentials",
        "desc": "Find the top chatters on the server",
        "handler": async (msg) => {
            await msg.channel.send("**Top 5 Users with the Most Messages Sent (Since I Started Counting)**");
            let topUsers = (await pool.request()
                .query("SELECT TOP 5 * FROM users ORDER BY num_messages DESC")).recordset;
            let resultMsg = "";
            for(let user of topUsers) {
                let userObj = await client.fetchUser(user.user_id);
                resultMsg = resultMsg + "- " + userObj.username + " (" + user.num_messages +" messages)\n"
            }
            await msg.channel.send(resultMsg);
            //console.log(topUsers);
        }
    });
    cm.push(
        {
            "command": "clear",
            "category": "Essentials",
            "desc": "Clear the chat",
            "handler": (msg) => {
                let clearMsg = "\n";
                msg.channel.send("." + clearMsg.repeat(1000) + "All Clean :smile:"); // 1-6
            }
        }
    );
    cm.push(
        {
            "command": "info",
            "category": "Essentials",
            "desc": "Display bot server information",
            "handler": async (msg) => {
                await msg.channel.send("I am running Node " + process.version + " on " + os.platform() + " " + os.release() + "!");
                let sqlVersion = (await pool.request().query("SELECT @@VERSION AS VERSION")).recordset[0].VERSION;
                console.log(sqlVersion)
                msg.channel.send(sqlVersion);
            }
        }
    );
    cm.push(
        {
            "command": "restart",
            "category": "Essentials",
            "desc": "(Admin only) Restart the bot",
            "handler": async (msg) => {
                await createUserIfNotExists(msg.author.id);
                if(msg.author.id !== process.env.MOD_ADMIN_ID) {
                    let isAdmin = (await pool.request()
                        .input("user_id", msg.author.id)
                        .query("SELECT is_admin FROM users WHERE user_id = @user_id"))
                        .recordset[0]
                        .is_admin;
                    if(!isAdmin) {
                        msg.reply(":exclamation: You are not an admin!");
                        return;
                    }
                }

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
