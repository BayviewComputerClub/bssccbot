// smoothie-web > dmoj
const axios = require("axios");

function randomProperty(obj) {
    let keys = Object.keys(obj);
    let key = keys[ keys.length * Math.random() << 0];
    return {
        id: key,
        info: obj[key]
    }

}

function init(client, cm, ap) {
    cm.push(
        {
            "command": "dmoj-problem",
            "category": "DMOJ",
            "desc": "Get a random DMOJ problem",
            "handler": async (msg) => {
                axios.defaults.headers = {
                    'Accept': 'application/json',
                    'User-Agent': 'bssccbot/1.0'
                };
                const response = await axios.get('https://dmoj.ca/api/problem/list');
                let problem = randomProperty(response.data);
                await msg.channel.send("Why not try out **" + problem.info.name + "** for " + problem.info.points + " points?" + "\n" +
                    "https://dmoj.ca/problem/" + problem.id
                );
            }
        }
    );
    cm.push(
        {
            "command": "dmoj-user",
            "category": "DMOJ",
            "desc": "Get stats for a DMOJ user (!dmoj-user [username])",
            "handler": async (msg) => {
                let user = ap(msg.content)[1];
                if(user === "") {
                    await msg.channel.send("I need a DMOJ user to lookup!");
                    return;
                }

                axios.defaults.headers = {
                    'Accept': 'application/json',
                    'User-Agent': 'bssccbot/1.0'
                };
                try{
                    const response = await axios.get('https://dmoj.ca/api/user/info/' + user);
                    await msg.channel.send("DMOJ Stats for: **" + user + "**" + "\n" +
                        "Points: " + response.data.points + "\n" +
                        "Performance Points: " + response.data.performance_points
                    );
                } catch (e) {
                    await msg.reply("Invalid DMOJ user!");
                }

            }
        }
    );
}

module.exports = init;
