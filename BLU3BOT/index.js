const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    getContentType,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

// Import command system
const {
    loadCommands,
    getCommand,
    generateMenu,
    getAllCommands,
    isOnCooldown,
    setCooldown,
    checkPermissions
} = require("./commands/commandHandler");

// Import advanced systems
const db = require("./utils/database");
const welcomeSystem = require("./systems/welcomeSystem");
const autoReplySystem = require("./systems/autoReply");
const themeManager = require("./utils/themes");

const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const { Boom } = require("@hapi/boom");

// Configuration
const config = {
    BOT_NAME: "Blu3Bot",
    PREFIX: "!",
    OWNER_NUMBER: "254118402996@s.whatsapp.net",
    MODE: "public",
    SESSION_PATH: "./session",
    BOT_VERSION: "2.0.0"
};

let Blu3Bot;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Load all commands when starting
console.log("🚀 Starting Blu3Bot...");
console.log("📂 Loading commands and systems...");
loadCommands();

async function startBlu3Bot() {
    try {
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_PATH);

        Blu3Bot = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino())
            },
            browser: ["Blu3Bot", "Chrome", config.BOT_VERSION],
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (key) => {
                return {
                    conversation: "Message not found in cache"
                };
            }
        });

        // Save credentials when updated
        Blu3Bot.ev.on("creds.update", saveCreds);

        // Handle incoming messages
        Blu3Bot.ev.on("messages.upsert", async ({ messages }) => {
            const message = messages[0];
            if (!message?.message || message.key.fromMe) return;

            const from = message.key.remoteJid;
            const text = getMessageText(message);
            const sender = message.key.participant || from;
            const pushName = message.pushName || "User";

            console.log(`📨 Message from ${pushName}: ${text}`);

            // Auto-read messages
            await Blu3Bot.readMessages([message.key]);

            // Update user in database
            try {
                await db.updateUser(sender, { name: pushName });
                await db.incrementCommandCount();
                await db.addUserExp(sender, 1); // Add 1 EXP per message
            } catch (dbError) {
                console.error('Database update error:', dbError);
            }

            // Auto-reply system (before commands)
            if (!text.startsWith(config.PREFIX)) {
                try {
                    const autoReply = await autoReplySystem.findReply(text);
                    if (autoReply) {
                        await Blu3Bot.sendMessage(from, { 
                            text: autoReply 
                        }, { quoted: message });
                        return;
                    }
                } catch (autoReplyError) {
                    console.error('Auto-reply error:', autoReplyError);
                }
            }

            // Command handling
            if (text.startsWith(config.PREFIX)) {
                await handleCommand(text, from, sender, message, pushName);
            }
        });

        // Group participant updates for welcome system
        Blu3Bot.ev.on("group-participants.update", async (update) => {
            try {
                const { id, participants, action } = update;
                
                if (action === 'add') {
                    for (const participant of participants) {
                        await welcomeSystem.handleJoin(id, participant, participants, Blu3Bot);
                    }
                } else if (action === 'remove') {
                    for (const participant of participants) {
                        await welcomeSystem.handleLeave(id, participant, participants, Blu3Bot);
                    }
                }
            } catch (error) {
                console.error('Welcome system error:', error);
            }
        });

        // Connection updates
        Blu3Bot.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "connecting") {
                console.log("🕗 Connecting Blu3Bot...");
                reconnectAttempts = 0;
            }

            if (connection === "open") {
                console.log("✅ Blu3Bot Connected Successfully!");
                reconnectAttempts = 0;
                
                // Update bot presence
                await updateBotPresence();
                
                // Send connection message to owner
                const stats = await db.getStats();
                const totalCommands = await getAllCommands().length;
                
                const connectionMsg = `
🤖 *${config.BOT_NAME} ACTIVATED* 🌟

📍 *Status:* Connected ✅
📍 *Version:* ${config.BOT_VERSION}
📍 *Prefix:* ${config.PREFIX}
📍 *Mode:* ${config.MODE}
📍 *Theme:* ${themeManager.currentTheme}
📍 *Commands:* ${totalCommands} loaded
📍 *Uptime:* ${formatUptime(process.uptime())}

📊 *Statistics:*
   • Total Commands: ${stats.totalCommands}
   • Total Users: ${Object.keys(await getUsers()).length}
   • Memory Usage: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB

> _Blu3Bot Classic Edition is ready to serve!_
                `.trim();

                try {
                    await Blu3Bot.sendMessage(config.OWNER_NUMBER, { text: connectionMsg });
                } catch (error) {
                    console.log('Could not send connection message to owner');
                }
            }

            if (connection === "close") {
                const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
                console.log(`Connection closed: ${statusCode}`);
                
                if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    const delay = Math.min(5000 * reconnectAttempts, 30000);
                    console.log(`Reconnecting... Attempt ${reconnectAttempts} in ${delay}ms`);
                    setTimeout(startBlu3Bot, delay);
                } else {
                    console.log("Max reconnection attempts reached or logged out. Exiting...");
                    process.exit(1);
                }
            }
        });

        // Handle call events
        Blu3Bot.ev.on("call", async (call) => {
            try {
                console.log("📞 Incoming call detected");
                // Auto-reject calls or implement call handling
            } catch (error) {
                console.error('Call handling error:', error);
            }
        });

        console.log("🎯 Blu3Bot initialization complete!");
        console.log("💫 Waiting for QR code scan...");

    } catch (error) {
        console.error("❌ Bot initialization error:", error);
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = Math.min(10000 * reconnectAttempts, 60000);
            console.log(`Retrying initialization in ${delay}ms... Attempt ${reconnectAttempts}`);
            setTimeout(startBlu3Bot, delay);
        } else {
            console.error("Max initialization attempts reached. Exiting...");
            process.exit(1);
        }
    }
}

// Helper function to extract message text
function getMessageText(message) {
    if (!message?.message) return "";
    
    const type = getContentType(message.message);
    switch (type) {
        case "conversation":
            return message.message.conversation;
        case "extendedTextMessage":
            return message.message.extendedTextMessage.text;
        case "imageMessage":
            return message.message.imageMessage.caption || "";
        case "videoMessage":
            return message.message.videoMessage.caption || "";
        case "documentMessage":
            return message.message.documentMessage.caption || "";
        case "audioMessage":
            return message.message.audioMessage.caption || "";
        default:
            return "";
    }
}

// Enhanced command handler
async function handleCommand(text, from, sender, message, pushName) {
    const commandText = text.slice(config.PREFIX.length).trim().split(' ')[0].toLowerCase();
    const args = text.slice(config.PREFIX.length + commandText.length).trim().split(' ').filter(arg => arg);

    const reply = (text) => Blu3Bot.sendMessage(from, { text }, { quoted: message });
    
    const react = (emoji) => Blu3Bot.sendMessage(from, { 
        react: { text: emoji, key: message.key } 
    });

    console.log(`⚡ Command: ${commandText} from ${pushName}`);

    try {
        // Update command statistics
        await db.updateUser(sender, { 
            name: pushName,
            commandsUsed: (await db.getUser(sender)).commandsUsed + 1
        });

        // Handle menu command separately
        if (commandText === 'menu' || commandText === 'help') {
            const menu = generateMenu(config.PREFIX);
            await reply(menu);
            return;
        }

        // Get command from our command system
        const command = getCommand(commandText);
        
        if (command) {
            // Check permissions
            const permissionError = checkPermissions(command, sender, from, config);
            if (permissionError) {
                await reply(permissionError);
                return;
            }

            // Check cooldown
            if (isOnCooldown(sender, command.name)) {
                const cooldownTime = command.cooldown || 3;
                await reply(`⏰ This command is on cooldown. Please wait ${cooldownTime} seconds before using it again.`);
                return;
            }

            // Set cooldown if applicable
            if (command.cooldown > 0) {
                setCooldown(sender, command.name);
            }

            // Execute command
            await command.execute(reply, react, args, from, sender, message, pushName, Blu3Bot);

        } else {
            // Command not found - show suggestions
            const allCommands = getAllCommands();
            const similar = allCommands.filter(cmd => 
                cmd.name.includes(commandText) || 
                cmd.aliases.some(alias => alias.includes(commandText))
            ).slice(0, 3);
            
            let response = `❌ Command "*${commandText}*" not found.\n\n`;
            
            if (similar.length > 0) {
                response += `💡 *Similar commands:*\n`;
                similar.forEach(cmd => {
                    response += `• ${config.PREFIX}${cmd.name} - ${cmd.description}\n`;
                });
                response += `\nUse ${config.PREFIX}menu to see all commands.`;
            } else {
                response += `💡 Use ${config.PREFIX}menu to see all available commands.`;
            }
            
            await reply(response);
        }
    } catch (error) {
        console.error(`Command error [${commandText}]:`, error);
        
        try {
            await reply(`❌ Error executing command: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
        } catch (sendError) {
            console.error('Failed to send error message:', sendError);
        }
    }
}

// Helper function to update bot presence
async function updateBotPresence() {
    try {
        await Blu3Bot.sendPresenceUpdate('available');
        
        // Set custom status
        const statusMessage = `🤖 ${config.BOT_NAME} v${config.BOT_VERSION} | Online`;
        await Blu3Bot.updateProfileStatus(statusMessage);
        
    } catch (error) {
        console.error('Presence update error:', error);
    }
}

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Helper function to get all users (for statistics)
async function getUsers() {
    try {
        const usersPath = path.join(__dirname, 'database', 'users.json');
        if (fs.existsSync(usersPath)) {
            return await fs.readJson(usersPath);
        }
        return {};
    } catch (error) {
        console.error('Error reading users:', error);
        return {};
    }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Blu3Bot gracefully...');
    
    try {
        if (Blu3Bot) {
            await Blu3Bot.logout();
            await Blu3Bot.ws.close();
        }
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Blu3Bot received termination signal...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for database operations
process.on('warning', (warning) => {
    console.warn('⚠️ System Warning:', warning);
});

// Start the bot with error handling
(async () => {
    try {
        await startBlu3Bot();
    } catch (error) {
        console.error('Fatal error during startup:', error);
        process.exit(1);
    }
})();

// Export for testing or other modules
module.exports = {
    Blu3Bot,
    config,
    startBlu3Bot
};

console.log("🎉 Blu3Bot Classic Edition - Initialization Complete!");
console.log("✨ Features Loaded:");
console.log("   ✅ Command System with Auto-Loading");
console.log("   ✅ Database Integration");
console.log("   ✅ Theme System");
console.log("   ✅ Welcome/Goodbye System");
console.log("   ✅ Auto-Reply System");
console.log("   ✅ Advanced Permissions");
console.log("   ✅ Cooldown System");
console.log("   ✅ Error Handling");
console.log("   ✅ Graceful Shutdown");