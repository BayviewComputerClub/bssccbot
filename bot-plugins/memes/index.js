let Jimp = require("jimp");

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
}

module.exports = init;
