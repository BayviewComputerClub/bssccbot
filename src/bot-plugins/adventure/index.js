#!/usr/bin/env node
"use strict";

const fs = require("fs");
const V86Starter = require("./v86/libv86").V86Starter;
const stripAnsi = require('strip-ansi');

// BSSCC Bot
let emulator;
let responseChannel = null;
let booted = false;

async function startLinux() {
    function readfile(path) {
        return new Uint8Array(fs.readFileSync(path)).buffer;
    }

    let bios = readfile(__dirname + "/bios/seabios.bin");
    let linux = readfile(__dirname + "/image/linux4.iso");

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
            let now = Date.now();
            let bootTime = now - boot_start;
            console.log("-> Linux Subsystem Started! Took " + bootTime +"ms to boot.");
            booted = true;

            // Login
            emulator.serial0_send("root\u000a");
        }

        if(responseChannel === null) {
            // No channel to send yet
            return;
        }


        char_buffer = char_buffer + chr;

        /*if(chr === "\u000a" || chr === "\u003a" || chr === "\u0025") {
            responseChannel.send(stripAnsi(char_buffer));
            char_buffer = "";
        }*/

        // Keep filling the buffer until we are returned to a prompt
        function sendBuffer() {
            //console.log(stripAnsi(char_buffer));
            let chunkedResponse = stripAnsi(char_buffer).match(/(.|[\r\n]){1,2000}/g);
            for(let i = 0; i < chunkedResponse.length; i++) {
                responseChannel.send(chunkedResponse[i]);
            }
            char_buffer = "";
        }

        // todo handle infinite loops (ex. "yes" command)
        if(char_buffer.includes("%")) {
            sendBuffer();
        }

        if(char_buffer.length > 10000) {
            // probably in a infinite loop (like "yes" or something)
            char_buffer = "";
            emulator.serial0_send("\x03");
            responseChannel.send("Output buffer limit exceeded!");
        }

    });
}

async function init(client, cm, ap) {
    if(process.env.LINUX_VM_ENABLE !== 'true') {
        console.log("    -> This plugin is disabled.");
        return;
    }

    // Start Linux
    await startLinux();

    cm.push(
        {
            "command": "linux",
            "category": "Linux",
            "desc": "Run a command in a BusyBox/Linux VM (!linux [command])",
            "handler": (msg) => {
                if(!booted) {
                    msg.reply("Linux is still booting... :man_running:");
                    return;
                }

                // no top for you
                if(msg.content.includes("top") || msg.content.includes("nano") || msg.content.includes("vi") || msg.content.includes("vim")) {
                    emulator.serial0_send("\u000a");
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
            "category": "Linux",
            "desc": "Press the enter key in the VM",
            "handler": (msg) => {
                emulator.serial0_send("\u000a");
            }
        }
    );
    cm.push(
        {
            "command": "ctrlc",
            "category": "Linux",
            "desc": "Press Ctrl+C in the VM",
            "handler": (msg) => {
                emulator.serial0_send("\x03");
            }
        }
    );
    cm.push(
        {
            "command": "linux-help",
            "category": "Linux",
            "desc": "About the Linux subsystem",
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
