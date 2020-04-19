const Jimp = require("jimp");
const fs = require('fs');
const gm = require("gm");
const util = require('util');
const readFile = util.promisify(fs.readFile);

function init(client, cm, ap) {
    cm.push(
        {
            "command": "fry",
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
            "handler": async (msg) => {
                let imageFile = await readFile("./bot-plugins/memes/image-templates/celebrate.gif");
                gm(imageFile, "microsoft-celebrate-bssccbot.gif")
                    .resize(300,300)
                    .stroke("#ffffff")
                    .fill('#ffffff')
                    .font("./bot-plugins/memes/image-templates/RedHatDisplay-Medium.ttf", 20)
                    .drawText(0,10, msg.content.substr(msg.content.indexOf(" ") + 1), 'South')
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
}

module.exports = init;
