let  { evaluate } = require("mathjs");

function init(client, cm, ap) {
    cm.push({
        "command": "math",
        "handler": async (msg) => {
            let args = ap(msg.content);
            try {
                msg.channel.send(evaluate(args[1]));
            } catch (e) {
                console.log(e);
                msg.channel.send(e.message);
                msg.channel.send("Math Error");
            }

        }
    });
}

module.exports = init;
