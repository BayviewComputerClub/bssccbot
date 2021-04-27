/* Music Bot  */
const ytdl = require('ytdl-core');
//const { getInfo } = require('ytdl-getinfo');
const ytsr = require('ytsr');

let isPlaying = false;
let musicQueue = [];

// Voice channel object
let vc = null;
// Voice channel connection (VoiceConnection) object.
let conn;
// Voice channel stream (StreamDispatcher) object.
let dispatcher;

// YTDL Stream
let ytdlStream;

async function playSong(search, msg) {
    if(isPlaying) {
        // Add song to the queue
        musicQueue.push(search)
        msg.reply("Your song has been added to the queue!")
    } else {
        // todo !connect
        isPlaying = true;

        let ytResults = await ytsr(search);
        let result = ytResults.items[0];
        console.log(result)
        console.log("Playing " + result.title + " ==> " + result.url);
        ytdlStream = ytdl(result.url, { quality: "highestaudio", filter: 'audioonly' })
        dispatcher = conn.playStream(ytdlStream);
        dispatcher.setVolume(0.5);
        dispatcher.setBitrate("auto");
        await msg.channel.send("Playing your song (" + result.title + ")! :musical_note: ");
        ytdlStream.on('end', async () => {
            msg.channel.send("The song has finished playing!");
            isPlaying = false;
            if(musicQueue.length !== 0) {
                let next = musicQueue.pop();
                msg.channel.send("Playing next song: " + next);
                await playSong(next, msg);
            } else {
                await vc.leave();
                vc = null;
                await msg.reply("The party's over! :wave:");
            }
        });
        return dispatcher;
    }
}

function init(client, cm, ap) {
    cm.push(
        {
            "command": "play",
            "handler": async (msg) => {
                try{
                    let search = ap(msg.content);
                    console.log("query:" + search[1]);
                    if(search[0] === "") {
                        await msg.reply("You need to tell me what to play!");
                        return;
                    }
                    if(vc === null) {
                        vc = msg.member.voiceChannel;
                        try {
                            conn = await vc.join();
                            await msg.reply("Connected :tada:... Please wait...");
                        } catch (e) {
                            await msg.channel.send("Could not connect :no_entry_sign:... are you in a voice channel?");
                            vc = null;
                            console.trace(e);
                            return;
                        }
                    }
                    await playSong(search[1], msg);
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
                if(vc == null) {
                    msg.reply("I am not playing anything!");
                    return;
                }
                await vc.leave();
                vc = null;
                await msg.reply("The party's over! :wave:");
                isPlaying = false;
            }
        }
    );
    cm.push(
        {
            "command": "skip",
            "handler": async(msg) => {
                if(vc == null) {
                    msg.reply("I am not playing anything!");
                    return;
                }
                await msg.reply(":track_next: Skipping the current song...");
                dispatcher.pause();
                isPlaying = false;
                await playSong(musicQueue.pop(), msg);
            }
        }
    );
}

module.exports = init;
