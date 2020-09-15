let  { evaluate } = require("mathjs");
let mjAPI = require("mathjax-node-svg2png");
mjAPI.config({
    MathJax: {
    }
});
mjAPI.start();

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
    }, {
        "command": "latex",
        "handler": async (msg) => {
            await msg.channel.send("Please wait...");
            let args = ap(msg.content);
            mjAPI.typeset({
                math: args[1],
                format: "inline-TeX",
                png:true,
                scale: 3
            }, async (data)  => {
                if (!data.errors) {
                    console.log(typeof data.png)
                    let buff = new Buffer(data.png.split(',')[1], 'base64');
                    await msg.channel.send("Rendered LaTeX:", {
                        files: [{
                            attachment: buff,
                            name: 'bssccbot-latex.png'
                        }]
                    });
                } else {
                    await msg.channel.send(data.errors)
                }
            });

        }
    });
}

module.exports = init;
