const Jimp = require("jimp");
const fs = require('fs');
const gm = require("gm");
const util = require('util');
const readFile = util.promisify(fs.readFile);

let font = "unifont-13.0.01.ttf";

function init(client, cm, ap) {
    cm.push(
        {
            "command": "fry",
            "category": "Memes",
            "desc": "Fry/Cursify the users profile picture (!fry @user)",
            "handler": async (msg) => {
                let args = ap(msg.content);
                if(args[0] === "") {
                    await msg.reply("Give me a user to fry!");
                    return;
                }
                let user = msg.mentions.users.first();
                let pic = user.avatarURL;

                let image = await Jimp.read(pic);
                await image.blur(10);
                await image.dither565();
                await image.invert();
                await image.normalize();
                await image.rotate(30);

                let imgBuf = await image.getBufferAsync(Jimp.AUTO);

                await msg.channel.send("Deep Fried... tasty.", {
                    files: [{
                        attachment: imgBuf,
                        name: 'fried-image-bssccbot.jpg'
                    }]
                });

            }
        }
    );
    cm.push(
        {
            "command": "celebrate",
            "category": "Memes",
            "desc": "Microsoft Dance GIF (!celebrate [text])",
            "handler": async (msg) => {
                msg.reply("Please wait while I generate your freshly baked meme...");

                let text = ap(msg.content)[1];

                let imageFile = await readFile(__dirname + "/image-templates/celebrate.gif");
                gm(imageFile, "microsoft-celebrate-bssccbot.gif")
                    .resize(300,300)
                    .stroke("#ffffff")
                    .fill('#ffffff')
                    .font("./bot-plugins/memes/image-templates/" + font, 20)
                    .drawText(0,10, text, 'South')
                    .toBuffer("GIF",(err, buf) => {
                        if(err) {
                            console.log(err);
                            msg.reply(err.message);
                            return;
                        }
                        msg.channel.send("Woo! 🎉🎉🎉", {
                            files: [{
                                attachment: buf,
                                name: 'microsoft-celebrate-bssccbot.gif'
                            }]
                        });
                });

            }
        }
    );
    cm.push(
        {
            "command": "celebrate-party",
            "category": "Memes",
            "desc": "Microsoft Dance Party GIF (!celebrate-party [text])",
            "handler": async (msg) => {
                msg.reply("Please wait while I generate your freshly baked meme...");

                let text = ap(msg.content)[1];

                let imageFile = await readFile(__dirname + "/image-templates/celebrate-party.gif");
                // produces really glitchy text for some reason...
                gm(imageFile, "microsoft-celebrate-party-bssccbot.gif")
                    .stroke("#ffffff")
                    .fill('#ffffff')
                    .font("./bot-plugins/memes/image-templates/" + font, 20)
                    .drawText(0,30, text, 'South')
                    .toBuffer("GIF",(err, buf) => {
                        if(err) {
                            console.log(err);
                            msg.reply(err.message);
                            return;
                        }
                        msg.channel.send("DEVELOPERS DEVELOPER DEVELOPERS DEVELOPERS! 🎉🎉🎉", {
                            files: [{
                                attachment: buf,
                                name: 'microsoft-celebrate-party-bssccbot.gif'
                            }]
                        });
                    });

            }
        }
    );
}

module.exports = init;
