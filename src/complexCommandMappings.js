let complexCommandMappings = [
    {
        "command": "test",
        "handler": async (msg) => {
            await msg.channel.send("This is a complex command");
        }
    }
];
module.exports = complexCommandMappings;
