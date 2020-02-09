/* Logs  */
let config = require("./config");
function init(client, cm) {
    client.on("message", msg => {
        if(msg.channel.id !== config.channel && msg.author.id !== config.botId) {
            client.channels.get(config.channel).send("[" + new Date().toISOString() + "] @" + msg.author.tag + " in #" + msg.channel.name + ": " + msg.content);
        }
    });
}

module.exports = init;
