/* Logs  */
let config = require("./config");

function isValid(msg) {
    return msg.channel.id !== config.channel && msg.author.id !== config.botId;
}

function init(client, cm) {
    client.on("message", msg => {
        if(isValid(msg)) {
            var content = msg.content.replace(/<@!?[d-d]+>/gi, function (x) {
				var member = msg.guild.member(x.replace(/<@!?|>/gi, ""));
                return member.nickname === null ? member.user.username
            });
            client.channels.get(config.channel).send("[" + new Date().toISOString() + "] @" + msg.author.tag + " in #" + msg.channel.name + ": " + content);
        }
    });
    client.on("messageUpdate", (msg, newMsg) => {
        if(isValid(msg) && isValid(newMsg)) {
			var content = msg.content.replace(/<@!?[d-d]+>/gi, function (x) {
				var member = msg.guild.member(x.replace(/<@!?|>/gi, ""));
				return member.nickname === null ? member.user.username
            });
			var newContent = newMsg.content.replace(/<@!?[d-d]+>/gi, function (x) {
				var member = msg.guild.member(x.replace(/<@!?|>/gi, ""));
				return member.nickname === null ? member.user.username
            });
            client.channels.get(config.channel).send("[" + new Date().toISOString() + "] @" + msg.author.tag + " updated in #" + msg.channel.name + ": " + content + " --> " + newContent);
        }
    });
}

module.exports = init;
