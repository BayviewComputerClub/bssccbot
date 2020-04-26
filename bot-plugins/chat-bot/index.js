const { dockStart } = require('@nlpjs/basic');
const fs = require('fs');
const spawn = require("child_process").spawn;

async function initNLP() {
    console.log("    -> Training Chat Bot...");
    const dock = await dockStart({ use: ['Basic']});
    const nlp = dock.get('nlp');
    await nlp.addCorpus('./bot-plugins/chat-bot/corpus.json');
    await nlp.train();
    return nlp;
}

async function init(client, cm, ap) {
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
                    console.log(channel[1].id);
                    let trainingChannel = client.channels.get(channel[1].id);
                    let messages = await trainingChannel.fetchMessages({ limit: 100 });
                    for(let message of messages) {
                        //console.log(message[1].content);
                        discordMessagesArr.push(message[1].content.replace("@", "-"))
                    }
                }
            }
        }
        discordMessagesArr = discordMessagesArr.reverse();
        messagesArr = messagesArr.concat(discordMessagesArr);

        fs.writeFileSync(__dirname + '/python/discord_chat_training.json', JSON.stringify(messagesArr), 'utf8');
        console.log("Loaded " + messagesArr.length + " messages for training!");
    } catch(e) {
        console.error("There was an issue loading messages from channels...");
        console.error(e);
        process.exit(1);
    }

    console.log("Starting Python Chat Bot...");

    const bot = spawn('python3', [__dirname + "/python/bot.py"], {cwd: __dirname + '/python/'});
    bot.stdin.setEncoding('utf-8');

    // Bind script output to bot channel.
    bot.stdout.on('data', async (data) => {
        //console.log(data);
        if(data.toString().includes("%")) {
            // We don't need boot progress...;
            return;
        }
        client.channels.get(process.env.CHAT_BOT_CHANNEL).send(data.toString().replace("@", "-"));
    });
    bot.stderr.on('data', async (data) => {
        //console.log(data);
        try {
            client.channels.get(process.env.CHAT_BOT_CHANNEL).send(data.toString());
        } catch(e) {
            client.channels.get(process.env.CHAT_BOT_CHANNEL).send(e.message);
        }

    });
    bot.on('close', (code) => {
        console.log(`Python Bot exited with code ${code}`);
        client.channels.get(process.env.CHAT_BOT_CHANNEL).send("Chat Bot crashed with " + code + " :frowning: ");
    });

    //let nlp = await initNLP();
    client.on('message', async (msg) => {

        // Is it in the chat channel, or a DM.
        let isVaildChannel = msg.guild === null || msg.channel.id === process.env.CHAT_BOT_CHANNEL;

        if(isVaildChannel && msg.author.id !== process.env.BOT_ID && !msg.content.includes("!")) {
            try {
                /*const response = await nlp.process('en', msg.content);
                if(response.answer === "NONE") {
                    return;
                }
                await msg.channel.send(response.answer);*/
                if(msg.content === "") {
                    return;
                }
                bot.stdin.write(msg.content + "\r\n");
            } catch (e) {
                //console.log(e);
                await msg.channel.send("error:" + e.message);
            }
        }
    });
}

module.exports = init;
