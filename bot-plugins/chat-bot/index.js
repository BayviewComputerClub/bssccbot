const { dockStart } = require('@nlpjs/basic');

async function initNLP() {
    console.log("    -> Training Chat Bot...");
    const dock = await dockStart({ use: ['Basic']});
    const nlp = dock.get('nlp');
    await nlp.addCorpus('./bot-plugins/chat-bot/corpus.json');
    await nlp.train();
    return nlp;
}

async function init(client, cm, ap) {
    let nlp = await initNLP();
    client.on('message', async (msg) => {
        if(msg.channel.id === process.env.CHAT_BOT_CHANNEL && msg.author.id !== process.env.BOT_ID && !msg.content.includes("!")) {
            try {
                const response = await nlp.process('en', msg.content);
                await msg.channel.send(response.answer);
            } catch (e) {
                //console.log(e);
                await msg.channel.send(e.message);
            }

        }
    });
}

module.exports = init;
