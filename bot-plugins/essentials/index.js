let axios = require("axios");
var os = require('os');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function init(client, cm, ap) {
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
    cm.push(
        {
            "command": "info",
            "handler": (msg) => {
                msg.reply("I am running Node " + process.version + " on " + os.platform() + " " + os.release());
            }
        }
    );

}

module.exports = init;
