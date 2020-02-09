#!/usr/bin/env node
"use strict";

const fs = require("fs");
const V86Starter = require("./v86/libv86").V86Starter;
const stripAnsi = require('strip-ansi');

// BSSCC Bot
let emulator;
let responseChannel = "";
let booted = false;

async function startLinux() {
    function readfile(path)
    {
        return new Uint8Array(fs.readFileSync(path)).buffer;
    }

    let bios = readfile(__dirname + "/bios/seabios.bin");
    let linux = readfile(__dirname + "/image/linux.iso");

    let boot_start = Date.now();

    console.log("    -> Now booting Linux Subsystem, please stand by...");

    emulator = new V86Starter({
        bios: { buffer: bios },
        cdrom: { buffer: linux },
        autostart: true,
    });


    let char_buffer = "";
    emulator.add_listener("serial0-output-char", function(chr)
    {
        if(!booted)
        {
            var now = Date.now();
            let bootTime = now - boot_start;
            console.log("-> Linux Subsystem Started! Took " + bootTime +"ms to boot.");
            booted = true;

            // Login
            emulator.serial0_send("root\u000a");
        }

        if(responseChannel === "") {
            // No channel to send yet
            return;
        }

        char_buffer = char_buffer + chr;

        if(chr === "\u000a" || chr === "\u003a" || chr === "\u0025") {
            responseChannel.send(stripAnsi(char_buffer));
            char_buffer = "";
        }
    });
}
async function init(client, cm, ap) {

    // Start Linux
    await startLinux();

    cm.push(
        {
            "command": "linux",
            "handler": (msg) => {
                if(!booted) {
                    msg.reply("Linux is still booting... :man_running:");
                    return;
                }

                responseChannel = msg.channel;
                console.log("User " + msg.author.username + " ran Linux CMD: " + ap(msg.content)[1]);
                emulator.serial0_send(ap(msg.content)[1] + "\u000a");
            }
        }
    );
    cm.push(
        {
            "command": "enter",
            "handler": (msg) => {
                emulator.serial0_send("\u000a");
            }
        }
    );
    cm.push(
        {
            "command": "ctrlc",
            "handler": (msg) => {
                emulator.serial0_send("\u0003");
            }
        }
    );
    cm.push(
        {
            "command": "stop-emu",
            "handler": (msg) => {
                emulator.stop();
            }
        }
    );
    cm.push(
        {
            "command": "linux-help",
            "handler": (msg) => {
                msg.reply(`
                ~ BSSCCBot Linux Subsystem ~
                Dr. Smoothie runs a simple embedded Linux distro in a VM.
                
                Simply run "!linux" followed by the command (ex. !linux ls)
                `)
            }
        }
    );

}

module.exports = init;
