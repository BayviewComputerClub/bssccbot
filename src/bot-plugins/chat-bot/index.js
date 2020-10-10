const fs = require('fs');
const spawn = require("child_process").spawn;
const emojiText = require("emoji-text");

async function init(client, cm, ap) {
    if(process.env.CHAT_BOT_ENABLE !== 'true') {
        console.log("    -> This plugin is disabled.");
        return;
    }

    // Get the last 100 (discord api limit) messages of each channel and dump it into a json file for chat bot training.
    try {
        console.log("Loading messages from channels for bot training...");
        let messagesArr = [];

        // might as well load the old corpus file too...
        let oldCorpus = require("./corpus.json");
        for(let data of oldCorpus.data) {
            for(let u of data.utterances) {
                for(let a of data.answers) {
                    messagesArr.push(u);
                    messagesArr.push(a);
                }
            }
        }

        let discordMessagesArr = []

        for(let guild of client.guilds) {
            //console.log(guild[1].channels);
            for(let channel of guild[1].channels) {
                //console.log(channel[1]);
                if(channel[1].type === "text") {
                    console.log("    -> " + channel[1].id);
                    let trainingChannel = client.channels.get(channel[1].id);
                    if(channel[1].id === process.env.CHAT_BOT_CHANNEL) {
                        // Don't train from the chat bot channel
                        console.log("    -> Ignore bot-playground...");
                        continue;
                    }
                    let messages = await trainingChannel.fetchMessages({ limit: 100 });
                    for(let message of messages) {
                        //console.log(message[1].content);
                        if(message[1].content.includes("@")) {
                            continue;
                        }
                        discordMessagesArr.push(
                            emojiText.convert(
                                message[1].content.replace("@", "-"),
                                {
                                    delimiter: ':'
                                }
                            )
                        );
                    }
                }
            }
        }
        discordMessagesArr = discordMessagesArr.reverse();
        messagesArr = messagesArr.concat(discordMessagesArr);

        fs.writeFileSync(__dirname + '/python/discord_chat_training.json', JSON.stringify(messagesArr), 'utf8');
        console.log("    -> Loaded " + messagesArr.length + " messages for training!");
    } catch(e) {
        console.error("    -> There was an issue loading messages from channels...");
        console.error(e);
        process.exit(1);
    }

    console.log("    -> Starting Python Chat Bot...");

    const bot = spawn('python3', [__dirname + "/python/bot.py"], {cwd: __dirname + '/python/'});
    bot.stdin.setEncoding('utf-8');

    // Bind script output to bot channel.
    bot.stdout.on('data', async (data) => {
        //console.log(data);
        if(data.toString().includes("%") || data.toString().includes("[") || data.toString().includes("@")) {
            // We don't need boot progress...;
            return;
        }
        try {
            client.channels.get(process.env.CHAT_BOT_CHANNEL).send(data.toString().replace("@", "-"));
        } catch(e) {
            console.log(e);
            client.channels.get(process.env.CHAT_BOT_CHANNEL).send(e.message);
        }

    });
    bot.stderr.on('data', async (data) => {
        console.log(data.toString());
        if(data.toString().includes("%") || data.toString().includes("[") || data.toString().includes("@")) {
            // We don't need boot progress...;
            return;
        }
        try {
            client.channels.get(process.env.CHAT_BOT_CHANNEL).send(data.toString());
        } catch(e) {
            client.channels.get(process.env.CHAT_BOT_CHANNEL).send(e.message);
        }

    });
    bot.on('close', async (code) => {
        console.log(`Python Bot exited with code ${code}`);
        await client.channels.get(process.env.CHAT_BOT_CHANNEL).send("Chat Bot crashed with code " + code + " :frowning: ");
        await client.channels.get(process.env.CHAT_BOT_CHANNEL).send("Hold on... I am restarting :recycle:");
        process.exit(code);
    });

    cm.push({
        "command": "chat",
        "handler": async (msg) => {
            let text = ap(msg.content)[1];

            if(msg.content <= 1) {
                return;
            }

            // Is it in the chat channel, or a DM.
            //let isVaildChannel = msg.guild === null || msg.channel.id === process.env.CHAT_BOT_CHANNEL;

            if(msg.author.id !== process.env.BOT_ID) {
                try {
                    if(msg.content === "" || msg.content.toLowerCase().includes("pls")) { // also ignore dank memer commands
                        return;
                    }
                    if(msg.author.id === "270904126974590976") {
                        // ignore dank memer himself
                        return;
                    }
                    bot.stdin.write(text + "\r\n");
                } catch (e) {
                    //console.log(e);
                    await msg.channel.send("error:" + e.message);
                }
            }
        }
    });
}

module.exports = init;
