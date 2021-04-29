const _ = require('lodash');

let simpleCommandMappings = require("./simpleCommandMappings.json");
let complexCommandMappings = require("./complexCommandMappings");

let ca = "!";

async function mapCommand(msg) {
    if(msg.author.id === process.env.BOT_ID) {
        return;
    }
    //Scan simple command mappings first...
    for(let i = 0; i < simpleCommandMappings.length; i++) {
        if(msgIsCommand(simpleCommandMappings[i].command, msg.content)) {
            await msg.reply(simpleCommandMappings[i].response);
            return true;
        }
    }

    // Then handle complex command mappings.
    for(let i = 0; i < complexCommandMappings.length; i++) {
        if(msgIsCommand(complexCommandMappings[i].command, msg.content)) {
            try {
                await complexCommandMappings[i].handler(msg);
            } catch(e) {
                await msg.channel.send("An error has occurred running the command: " + e.message);
            }
            return true;
        }
    }

    // Special Command: !help
    let commands = "";
    let categoryLists = [];
    let helpMsg = "";
    if(msgIsCommand("help", msg.content)) {
        helpMsg += "Here are a list of currently registered commands: \n";
        for(let i = 0; i < simpleCommandMappings.length; i++) {
            commands = commands + "\n!" + simpleCommandMappings[i].command
        }
        helpMsg += "The command prefix is: " + ca + "\n";
        //msg.channel.send(commands);
        await _.forEach(complexCommandMappings, (c) => {
            if("category" in c) {
                if(c.category in categoryLists) {
                    categoryLists[c.category] += "\n" + ca + c.command + " - *" + c.desc + "*";
                } else {
                    categoryLists[c.category] = ca + c.command + " - *" + c.desc + "*";
                }
            } else {
                if("Uncategorized" in categoryLists) {
                    categoryLists["Uncategorized"] += "\n" + ca + c.command;
                } else {
                    categoryLists["Uncategorized"] = ca + c.command;
                }
            }
        });
        await _.forOwn(categoryLists, async (value, key) => {
            helpMsg += ("**" + key + "**\n----------\n" + value + "\n\n");
        });
        helpMsg += ("**Informational**\n----------" + commands);
        await msg.reply(helpMsg)
        return true;
    }

    return false;
}

//todo make this less dumb
function msgIsCommand(cmd, msg) {
    let msgSubstring = msg.substring(ca.length, cmd.length+1);
    let isCommand = msgSubstring === cmd;
    return msg.charAt(0) === ca && isCommand && msg.split(" ")[0] === ca + cmd;

}
function argumentParser(msg) {
    return [msg.substr(0, msg.indexOf(' ')), msg.substr(msg.indexOf(' '))];
}

module.exports = {mapCommand};
