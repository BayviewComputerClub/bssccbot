/* Music Bot  */
const ytdl = require('ytdl-core');
//const { getInfo } = require('ytdl-getinfo');
const ytsr = require('ytsr');

let isPlaying = false;

function init(client, cm, ap) {
    cm.push(
        {
            "command": "play",
            "handler": async (msg) => {
                if(isPlaying) {
                    await msg.reply("Something is playing (or I broke)! You need to stop the player first, use '!stop'.");
                    return;
                }
                isPlaying = true;
                try{
                    let vc = msg.member.voiceChannel;
                    let conn;
                    try {
                        conn = await vc.join();
                    } catch (e) {
                        await msg.reply("Could not connect :no_entry_sign:... are you in a voice channel?");
                        console.trace(e);
                        return;
                    }
                    let search = ap(msg.content);
                    console.log("query:" + search[1]);
                    if(search[0] === "") {
                        await msg.reply("You need to tell me what to play!");
                        return;
                    }
                    await msg.reply("Connected :tada:... Please wait...");
                    //let ytResults = await getInfo(search[1]);

                    let ytResults = await ytsr(search[1]);
                    let result = ytResults.items[0];

                    console.log("Playing " + result.title + " ==> " + result.link);
                    let dispatcher = conn.playStream(ytdl(result.link, { quality: "highestaudio", filter: 'audioonly' }));
                    dispatcher.setVolume(0.5);
                    dispatcher.setBitrate("auto");
                    await msg.reply("Playing your song (" + ytResults.items[0].title + ")! :musical_note: ");
                    return dispatcher;
                } catch (e) {
                    await msg.reply("Oops, there was an error trying to play the song... :frowning:");
                    console.trace(e);
                }
            }
        }
    );
    cm.push(
        {
            "command": "stop",
            "handler": async(msg) => {
                let vc = msg.member.voiceChannel;
                await vc.leave();
                await msg.reply("The party's over! :wave:");
                isPlaying = false;
            }
        }
    );
}

module.exports = init;
