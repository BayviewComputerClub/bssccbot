let simpleCommandMappings = require("./simpleCommandMappings");
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
            await complexCommandMappings[i].handler(msg);
            return true;
        }
    }

    // Special Command: !help
    let commands = "";
    if(msgIsCommand("help", msg.content)) {
        await msg.reply("Here are a list of currently registered commands: ");
        for(let i = 0; i < simpleCommandMappings.length; i++) {
            commands = commands + "\n" + simpleCommandMappings[i].command
        }
        for(let i = 0; i < complexCommandMappings.length; i++) {
            commands = commands + "\n" + complexCommandMappings[i].command;
        }
        msg.channel.send("The command prefix is: " + ca);
        msg.channel.send(commands);
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
