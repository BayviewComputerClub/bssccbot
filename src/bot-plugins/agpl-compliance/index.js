const { exec } = require("child_process");
const os = require('os');

function init(client, cm, ap) {
    // Allow the bot to self-serve it's sourcecode to ensure AGPL Compliance.
    cm.push({
        "command": "generate-source",
        "category": "AGPL Compliance",
        "desc": "Generate an archive of the currently running bot source code",
        "handler": async (msg) => {
            await msg.reply("Please wait while I generate the source archive...");
            await msg.channel.send("Source path: " + process.env.PWD);
            await msg.channel.send("Server info: Node " + process.version + " on " + os.platform() + " " + os.release());
            const command = "tar --exclude='./node_modules' --exclude='.idea' --exclude='.env' --exclude='.git' --exclude='source_archive.tar.gz' --exclude='./src/bot-plugins/adventure/image/linux4.iso' --exclude='./src/bot-plugins/memes/image-templates' -zcvf source_archive.tar.gz " + process.env.PWD;
            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    await msg.channel.send(`error: ${error.message}`)
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    //return;
                }
                console.log(`stdout: ${stdout}`);
                await msg.channel.send("Tar.gz archive created! Please wait while I upload it...")
                try {
                    await msg.channel.send("BSSCCBot Live Source Archive, generated on " + Date().toString(), {
                        files: [{
                            attachment: process.env.PWD + "/source_archive.tar.gz",
                            name: 'bssccbot_source_archive.tar.gz'
                        }]
                    });
                } catch(e) {
                    await msg.channel.send("An error has occurred: " + e.message)
                }

            });
        }
    });
    cm.push({
        "command": "source",
        "category": "AGPL Compliance",
        "desc": "Links to the development source code repository",
        "handler": async (msg) => {
            await msg.reply("https://github.com/BayviewComputerClub/bssccbot");
        }
    });
}

module.exports = init;