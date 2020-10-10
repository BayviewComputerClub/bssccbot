/* Logs  */
let config = require("./config");

function isValid(msg) {
    return msg.channel.id !== config.channel && msg.author.id !== config.botId;
}

function init(client, cm) {
    client.on("message", msg => {
        if(isValid(msg)) {
            let text = msg.content.replace("@", "-");
            client.channels.get(config.channel).send("[" + new Date().toISOString() + "] @" + msg.author.tag + " in #" + msg.channel.name + ": " + text);
        }
    });
    client.on("messageUpdate", (msg, newMsg) => {
        if(isValid(msg)) {
            let text = msg.content.replace("@", "-");
            let newText = newMsg.content.replace("@", "-");
            client.channels.get(config.channel).send("[" + new Date().toISOString() + "] @" + msg.author.tag + " updated in #" + msg.channel.name + ": " + text + " --> " + newText);
        }
    });
}

module.exports = init;