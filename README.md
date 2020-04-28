# BSSCC Bot
## aka. dr. smoothie

This is the bot for the Bayview Computer Club's Discord Server. 

> Warning: The code is a complete disaster and you shouldn't use this.

### Features

* Linux emulation (run Linux commands using "!linux [cmd]"). Uses [v86](https://github.com/copy/v86).
* Music Bot (run "!play [song name]" while in a VC. This kinda works)
* Chat Bot (Uses the [ChatterBot](https://chatterbot.readthedocs.io/en/stable/) Python chat bot library. Is trained against included data, and the Discord server chat.)
* Chat Logging (Logs all messages to a specified log channel)
* !xkcd for XKCD comics, !joke for a dad joke
* !dmoj-problem and !dmoj-user [username]
* Meme things (!fry @User, !celebrate [text] !celebrate-party [text])
* Moderation features (!jail @User)

### Environment Variables
The bot needs the following environment variables set:
```dotenv
BOT_TOKEN=bot token (from discord developer portal)
BOT_ID=bot id (right click the bot in discord and copy id)
CHAT_LOG_CHANNEL=channel id (where to log messages to)
CHAT_BOT_ENABLE=enables the chat bot ("true" or "false", no quotes please)
CHAT_BOT_CHANNEL=channel id (where to run the chat bot)
MOD_JAIL_ROLE=ID of the role to give to jailed users (this role should disable their send messages perm for example)
SQL_USER=MS SQL Server user
SQL_PASSWORD=MS SQL Server password
SQL_SERVER=MS SQL Server address (ex. localhost)
SQL_DB=bssccbot (don't change this, the database will be created for you)
```
A ".env" file can be used to set these when running locally.

### Docker
A Docker image is available at: https://hub.docker.com/repository/docker/bsscc/bot (Be sure to set the environment variables!)

#### Deploying with Docker
BSSCCBot requires MS SQL Server! The recommended way to deploy using docker is by using docker-compose, which 
will automatically setup a BSSCCBot container and MS SQL Server container, linked with a network.

First create a "docker.env" file with the above environment variables set (EXCLUDING SQL_*).

Then run `docker-compose up` to deploy to docker! 

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
cm.push({
    "command": "",
    "handler": (msg) => {

    }
});
```
Command is the command **without** the prefix. Handler is a function that is 
called when the command is invoked (with [message object](https://discord.js.org/#/docs/main/stable/class/Message) passed to it).

#### Argument Parser
The ap() function will return the command at index 0, and the rest of the text at index 1.
```javascript
let text = ap(msg.content)[1];
```
