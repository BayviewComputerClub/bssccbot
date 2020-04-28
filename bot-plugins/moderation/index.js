const sql = require('mssql');
const {createUserIfNotExists} = require("../../services/database");

// Server moderation features
async function init(client, cm, ap) {
    let pool = await sql.connect();

    // User Events:
    client.on('guildMemberAdd', async (member) => {
        // When a user rejoins, their perms are reset.
        // This will enforce the jailed role.

        let isJailed = (await pool.request()
            .input("user_id", member.id)
            .query("SELECT is_jailed FROM users WHERE user_id = @user_id"))
            .recordset[0]
            .is_jailed
        if(isJailed) {
            console.log("Jailed user " + member.id + " rejoined the server");
            await member.addRole(process.env.MOD_JAIL_ROLE);
        }
    });

    // Commands:
    cm.push({
        "command": "admin",
        "handler": async (msg) => {
            // Check if user has permission.
            await createUserIfNotExists(msg.author.id);

            let isAdmin = (await pool.request()
                .input("user_id", msg.author.id)
                .query("SELECT is_admin FROM users WHERE user_id = @user_id"))
                .recordset[0]
                .is_admin;
            if(!isAdmin || msg.author.id !== process.env.MOD_ADMIN_ID) {
                msg.reply(":exclamation: You are not an admin!");
                return;
            }

            if(ap(msg.content)[0] === "") {
                msg.reply(`Please specify a subcommand:
                jail list - Lists the users currently in jail.
                jail [user] - Puts a user in jail.
                jail [user] remove - Remove a user from jail.
                
                add [user] - Make a user an admin
                remove [user] - Remove a user as admin
                `);
                return;
            }

            let args = msg.content.split(" ");
            let mention = msg.mentions.users.first();
            console.log(args);
            switch(args[1]) {
                case "jail":
                    if(args[2] === "list") {
                        let result = await pool.request()
                            .query("SELECT user_id FROM users WHERE is_jailed = 1")
                        console.log(result);
                        if(result.recordset.length === 0) {
                            msg.channel.send("No users are currently jailed!");
                            return;
                        }
                        msg.channel.send("These users are currently jailed: ");
                        for(let user of result.recordset) {
                            let userObj = await client.fetchUser(user.user_id);
                            msg.channel.send("- " + userObj.username);
                        }
                        return;
                    } else {
                        // There is a user being passed...
                        try {
                            await createUserIfNotExists(mention.id);
                            if(args[3] === "remove") {
                                await pool.request()
                                    .input("user_id", mention.id)
                                    .query("UPDATE users SET is_jailed = 0 WHERE user_id = @user_id");
                                await msg.guild.members.get(mention.id).removeRole(process.env.MOD_JAIL_ROLE);
                                msg.reply("Removed! :white_check_mark: ");
                                return;
                            } else {
                                await pool.request()
                                    .input("user_id", mention.id)
                                    .query("UPDATE users SET is_jailed = 1 WHERE user_id = @user_id");
                                await msg.guild.members.get(mention.id).addRole(process.env.MOD_JAIL_ROLE);
                                msg.reply("Added! :cop:");
                                return;
                            }
                        } catch(e) {
                            msg.channel.send(e.message);
                            console.error(e);
                            msg.channel.send("There was an unexpected error :frowning:");
                        }

                    }
                    break;
                case "add":
                    try {
                        await pool.request()
                            .input("user_id", mention.id)
                            .query("UPDATE users SET is_admin = 1 WHERE user_id = @user_id");
                        msg.reply("Set user as admin!");
                        return;
                    } catch (e) {
                        msg.channel.send(e.message);
                        console.error(e);
                        msg.channel.send("There was an unexpected error :frowning:");
                    }
                    break;
                case "remove":
                    try {
                        await pool.request()
                            .input("user_id", mention.id)
                            .query("UPDATE users SET is_admin = 0 WHERE user_id = @user_id");
                        msg.reply("Removed user as admin!");
                        return;
                    } catch (e) {
                        msg.channel.send(e.message);
                        console.error(e);
                        msg.channel.send("There was an unexpected error :frowning:");
                    }
                    break;
                default:
                    msg.reply("Invalid command!");
            } // end switch

        }
    });
}

module.exports = init;
