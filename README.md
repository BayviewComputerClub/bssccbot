# BSSCC Bot
## aka. dr. smoothie

This is the bot for the Bayview Computer Club's Discord Server. 

> Warning: The code is a complete disaster and you shouldn't use this.

### Features

* Linux emulation (run Linux commands using "!linux [cmd]"). Uses [v86](https://github.com/copy/v86).
* Music Bot (run "!play [song name]" while in a VC. This kinda works)
* Chat Bot (Uses [nlp.js](https://github.com/axa-group/nlp.js) with a supplied corpus file)
* Chat Logging (Logs all messages to a specified log channel)
* Some other stuff (like !joke and !fry)

### Environment Variables
The bot needs the following environment variables set:
```dotenv
BOT_TOKEN=bot token (from discord developer portal)
BOT_ID=bot id (right click the bot in discord and copy id)
CHAT_LOG_CHANNEL=channel id (where to log messages to)
CHAT_BOT_CHANNEL=channel id (where to run the chat bot)
```

### Docker
A Docker image is available at: https://hub.docker.com/repository/docker/bsscc/bot
Be sure to set the environment variables!

### Plugin Documentation:

Plugins consist of a folder in the bot-plugins directory, and an index.js file containing an init function.

**This plugin uses DiscordJS v11, make sure you are reading the correct documentation!**

Plugin Template:
```javascript
function init(client, cm, ap) {

}

module.exports = init;

```
client -> the instance of the [DiscordJS Client](https://discord.js.org/#/docs/main/v11/class/Client).

cm -> the Command Mapping object

ap -> argumentParser() helper utility.


To register a command:
```javascript
cm.push(
        {
            "command": "",
            "handler": (msg) => {

            }
        }
    );
```
Command is the command **without** the prefix. Handler is a function that is 
called when the command is invoked (with [message object](https://discord.js.org/#/docs/main/stable/class/Message) passed to it).
