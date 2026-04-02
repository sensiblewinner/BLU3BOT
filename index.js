// ==============================
// 👻 BLU3BOT — MAIN ENTRY FILE
// ==============================

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const moment = require('moment');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    getContentType
} = require('@whiskeysockets/baileys');

const P = require('pino');

// ==============================
// 🔧 ENV CONFIG
// ==============================
dotenv.config();

const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'BLU3BOT';
const BOT_VERSION = process.env.BOT_VERSION || '2.0.0';
const OWNER_NUMBER = process.env.OWNER_NUMBER || '254118402996';
const MODE = process.env.MODE || 'public';

// ==============================
// 🌐 GLOBAL STATE
// ==============================
let SOCKET = null;
let RECONNECT_ATTEMPTS = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// 💾 Message cache for antidelete/antiedit (last 500 messages per session)
const MESSAGE_CACHE = new Map();
const CACHE_LIMIT = 500;

function cacheMessage(msg) {
    if (!msg?.key?.id || !msg?.message) return;
    if (MESSAGE_CACHE.size >= CACHE_LIMIT) {
        const oldest = MESSAGE_CACHE.keys().next().value;
        MESSAGE_CACHE.delete(oldest);
    }
    MESSAGE_CACHE.set(msg.key.id, msg);
}

// ==============================
// 🎬 STARTUP BANNER
// ==============================
console.log(chalk.cyan(`
+--------------------------------------+
|   👻 ${BOT_NAME.padEnd(28)} |
+--------------------------------------+
| ⚙️ Version : ${BOT_VERSION}
| 💬 Prefix  : ${PREFIX}
| 👑 Owner   : +${OWNER_NUMBER}
| 🔐 Mode    : ${MODE.toUpperCase()}
+--------------------------------------+
`));

// ==============================
// 📦 COMMAND HANDLER
// ==============================
const CommandHandler = require('./commandHandler');
const commandHandler = new CommandHandler();
global.commandHandler = commandHandler;

// ==============================
// 🧹 UTILS
// ==============================
const cleanJid = jid =>
    jid?.replace(/:\d+/, '').replace(/@s\.whatsapp\.net$/, '');

function extractText(msg) {
    if (!msg?.message) return '';
    const type = getContentType(msg.message);

    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ''
    );
}

// ==============================
// ⚡ COMMAND EXECUTOR
// ==============================
// Track bot start time for uptime commands
if (!global.BOT_START_TIME) global.BOT_START_TIME = Date.now();

// =============================================
// 🔐 DEFAULT STEALTH TRIGGER BINDINGS
// emoji/sticker → command name (owner-only, silent)
// =============================================
if (!global.stealthTriggers) {
    global.stealthTriggers = new Map([
        ['🗑️',  'antidelete'],
        ['✏️',   'antiedit'],
        ['👁️',   'vv'],
        ['💾',   'save'],
        ['🔍',   'getprofile'],
    ]);
}

// =============================================
// 🔐 STEALTH TRIGGER RUNNER
// Executes a bound command with 100% silent output
// (no visible reaction, all replies go to owner DM)
// =============================================
async function runStealthTrigger(commandName, sock, msg) {
    const command = commandHandler.commands.get(commandName);
    if (!command) {
        console.log(`⚠️  Stealth trigger: command "${commandName}" not found`);
        return;
    }

    const ownerJid = `${OWNER_NUMBER}@s.whatsapp.net`;
    const from = msg.key.remoteJid;
    const sender = cleanJid(msg.key.participant || msg.key.remoteJid);

    // All output goes silently to owner DM
    const stealthReply = (text) => sock.sendMessage(ownerJid, { text }).catch(() => {});
    const stealthReact  = () => Promise.resolve();

    // For toggle-style commands: flip the current state automatically
    const toggleArgs = {
        antidelete:  () => [global.antideleteEnabled ? 'off' : 'on'],
        antiedit:    () => [global.antieditEnabled   ? 'off' : 'on'],
    };
    const args = (toggleArgs[commandName] ? toggleArgs[commandName]() : []);

    const context = {
        from,
        message: msg,
        sender,
        pushName: msg.pushName || 'User',
        prefix: PREFIX,
        Blu3Bot: sock,
        ownerJid,
        commandName,
        config: { PREFIX, BOT_NAME, BOT_VERSION, OWNER_NUMBER: ownerJid, MODE }
    };

    try {
        console.log(chalk.cyan(`🔐 STEALTH TRIGGER: "${commandName}" via emoji/sticker`));
        await command.execute(stealthReply, stealthReact, from, msg, args, sock, context);
    } catch (err) {
        console.log(`Stealth trigger error [${commandName}]:`, err.message);
    }
}

async function runCommand(text, sock, msg) {
    const sender = cleanJid(msg.key.participant || msg.key.remoteJid);

    const context = {
        from: msg.key.remoteJid,
        message: msg,
        sender,
        pushName: msg.pushName || 'User',
        prefix: PREFIX,
        Blu3Bot: sock,
        config: {
            PREFIX,
            BOT_NAME,
            BOT_VERSION,
            OWNER_NUMBER: `${OWNER_NUMBER}@s.whatsapp.net`,
            MODE
        }
    };

    try {
        await sock.readMessages([msg.key]);
        await commandHandler.executeCommand(text, context);
    } catch (err) {
        // ❌ IMPORTANT: IGNORE INVALID COMMANDS
        if (
            err.message?.toLowerCase().includes('command') ||
            err.message?.toLowerCase().includes('not found')
        ) {
            return;
        }

        console.log(chalk.red('❌ Command error:'), err.message);
    }
}

// ==============================
// 📡 CONNECTION HANDLERS
// ==============================
async function onConnected(sock) {
    RECONNECT_ATTEMPTS = 0; // reset counter on every successful connection
    const time = moment().format('HH:mm:ss');
    const cmdCount = commandHandler.getCommandCount();

    const connectedText = `
+------------------------------+
|     🔗 BLU3BOT CONNECTED     |
+------------------------------+
| ⚡ Status : ONLINE
| 🔐 Mode   : ${MODE.toUpperCase()}
| 🧩 Plugins: ${cmdCount}
| 👤 Owner  : Brandon
| 💾 RAM    : [████████░░] 80%
+------------------------------+

🕒 Time: ${time}
🤖 Version: ${BOT_VERSION}
`;

    console.log(chalk.green(connectedText));

    await sock.sendMessage(
        `${OWNER_NUMBER}@s.whatsapp.net`,
        { text: connectedText }
    );
}

async function onDisconnect(lastDisconnect) {
    const code = lastDisconnect?.error?.output?.statusCode;
    RECONNECT_ATTEMPTS++;

    console.log(chalk.yellow(`⚠️ Disconnected (code ${code})`));

    if (
        code === DisconnectReason.loggedOut ||
        code === 401 ||
        code === 403
    ) {
        console.log(chalk.red('🔒 Logged out. Clearing session...'));
        fs.rmSync('./session', { recursive: true, force: true });
        RECONNECT_ATTEMPTS = 0;
    }

    if (RECONNECT_ATTEMPTS <= MAX_RECONNECT_ATTEMPTS) {
        setTimeout(startBot, 3000 * RECONNECT_ATTEMPTS);
    }
}

// ==============================
// 🚀 START BOT
// ==============================
async function startBot() {
    console.log(chalk.blue('\n📦 Loading commands...'));
    commandHandler.loadCommands(path.join(__dirname, 'commands'));

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' }))
        },
        browser: [BOT_NAME, 'Chrome', BOT_VERSION],
        logger: P({ level: 'silent' }),
        markOnlineOnConnect: true
    });

    SOCKET = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log(chalk.yellow('\n📲 Scan QR:\n'));
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') onConnected(sock);
        if (connection === 'close') onDisconnect(lastDisconnect);
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg?.message) return;

        // Cache incoming messages for antidelete recovery (skip fromMe to save space)
        if (!msg.key.fromMe) cacheMessage(msg);

        // Antiedit: detect edited messages and forward originals to owner DM
        if (global.antieditEnabled) {
            const editedMsg = msg.message?.editedMessage || msg.message?.protocolMessage?.editedMessage;
            if (editedMsg) {
                const originalKey = msg.message?.protocolMessage?.key || editedMsg.key;
                const originalId = originalKey?.id;
                const cachedOriginal = originalId ? MESSAGE_CACHE.get(originalId) : null;

                const newText =
                    editedMsg.message?.conversation ||
                    editedMsg.message?.extendedTextMessage?.text ||
                    '[non-text content]';

                let editReport = `✏️ *ANTIEDIT ALERT*\n\n`;
                editReport += `*Chat:* ${msg.key.remoteJid.endsWith('@g.us') ? 'Group' : 'DM'}\n`;
                editReport += `*From:* @${cleanJid(msg.key.participant || msg.key.remoteJid)}\n\n`;

                if (cachedOriginal) {
                    const oldText = extractText(cachedOriginal) || '[non-text content]';
                    editReport += `*Original:*\n${oldText}\n\n*Edited to:*\n${newText}`;
                } else {
                    editReport += `*Edited message:*\n${newText}\n\n_(Original not in cache)_`;
                }

                try {
                    await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, { text: editReport });
                } catch (err) {
                    console.log('Antiedit send error:', err.message);
                }
                return;
            }
        }

        if (msg.key.fromMe) return;

        const from  = msg.key.remoteJid;
        const text  = extractText(msg);
        const isCmd = text.startsWith(PREFIX);
        const isDM  = !from.endsWith('@g.us');
        const sender  = cleanJid(msg.key.participant || from);
        const isOwner = sender.includes(OWNER_NUMBER);

        console.log(
            chalk.magenta(
                `📩 ${isDM ? 'DM' : 'GROUP'} → ${text || '[MEDIA]'}`
            )
        );

        // =============================================
        // 🔐 STEALTH EMOJI / STICKER TRIGGERS (owner-only)
        // Must check BEFORE DND / command routing so they
        // work anywhere — DM, group, even when DND is on.
        // =============================================
        if (isOwner) {
            let stealthCmd = null;

            // 1) Emoji trigger — exact match on the full message text
            if (text && global.stealthTriggers?.has(text.trim())) {
                stealthCmd = global.stealthTriggers.get(text.trim());
            }

            // 2) Sticker trigger — matched on first 16 hex chars of fileSha256
            if (!stealthCmd) {
                const stickerMsg = msg.message?.stickerMessage;
                if (stickerMsg?.fileSha256) {
                    const hash = Buffer.from(stickerMsg.fileSha256).toString('hex').slice(0, 16);
                    const stickerKey = `sticker:${hash}`;
                    if (global.stealthTriggers?.has(stickerKey)) {
                        stealthCmd = global.stealthTriggers.get(stickerKey);
                    }
                }
            }

            if (stealthCmd && !isCmd) {
                await runStealthTrigger(stealthCmd, sock, msg);
                return;
            }
        }

        // =============================================
        // 🚫 BLACKLIST — silently drop blacklisted users
        // =============================================
        if (!isOwner && global.blacklistedUsers?.has(`${sender}@s.whatsapp.net`)) return;
        if (!isOwner && global.blacklistedUsers?.has(sender)) return;

        // =============================================
        // 🔧 MAINTENANCE MODE — notify non-owners
        // =============================================
        if (global.maintenanceMode && !isOwner && isCmd) {
            try {
                await sock.sendMessage(from, {
                    text: global.maintenanceMessage || '🔧 BLU3BOT is currently under maintenance. Please try again later.'
                }, { quoted: msg });
            } catch {}
            return;
        }

        // =============================================
        // ⏱️ COOLDOWN — rate-limit non-owner commands
        // =============================================
        if (!isOwner && isCmd && global.cmdCooldown > 0) {
            if (!global.cooldownTracker) global.cooldownTracker = new Map();
            const lastUsed = global.cooldownTracker.get(sender) || 0;
            const elapsed  = (Date.now() - lastUsed) / 1000;
            if (elapsed < global.cmdCooldown) {
                const remaining = (global.cmdCooldown - elapsed).toFixed(1);
                const langMsg   = global.botStrings?.cooldown?.[global.botLanguage || 'en'];
                const notice    = (langMsg || '⏱️ Please wait {sec}s before using another command.').replace('{sec}', remaining);
                try { await sock.sendMessage(from, { text: notice }, { quoted: msg }); } catch {}
                return;
            }
            global.cooldownTracker.set(sender, Date.now());
        }

        // DND: skip non-owner DM commands
        if (global.dndEnabled && isDM && !isOwner && isCmd) return;

        // Auto-reply: send once per person per DND session
        if (global.autoreplyEnabled && isDM && !isOwner && !isCmd) {
            if (!global.autoreplyContacted) global.autoreplyContacted = new Set();
            if (!global.autoreplyContacted.has(sender)) {
                global.autoreplyContacted.add(sender);
                try {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: global.autoreplyMessage || "I'm currently unavailable. I'll get back to you soon! 🤖"
                    }, { quoted: msg });
                } catch {}
            }
        }

        // ==============================
        // 🛡️ GROUP MODERATION HANDLERS
        // ==============================
        const isGroup = !isDM;

        if (isGroup && !isOwner) {
            const chatJid = msg.key.remoteJid;

            // Helper: check if bot is admin in this group
            const isBotAdmin = async () => {
                try {
                    const meta = await sock.groupMetadata(chatJid);
                    const botNum = cleanJid(sock.user?.id);
                    const botMember = meta.participants.find(p => cleanJid(p.id) === botNum);
                    return botMember?.admin === 'admin' || botMember?.admin === 'superadmin';
                } catch {
                    return false;
                }
            };

            // Helper: delete message + warn sender
            const deleteAndNotify = async (reason) => {
                try {
                    await sock.sendMessage(chatJid, { delete: msg.key });
                    await sock.sendMessage(chatJid, {
                        text: `⚠️ @${sender} — ${reason}`,
                        mentions: [msg.key.participant || msg.key.remoteJid]
                    });
                } catch {}
            };

            const msgType = Object.keys(msg.message)[0];

            // 🔗 ANTILINK
            if (global.antilinkEnabled && text) {
                const urlPattern = /(https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/)[^\s]*/i;
                if (urlPattern.test(text) && await isBotAdmin()) {
                    await deleteAndNotify('Links are not allowed in this group.');
                    return;
                }
            }

            // 🔞 ANTIBADWORD
            if (global.badWords && text) {
                const groupWords = global.badWords.get(chatJid);
                if (groupWords && groupWords.size > 0) {
                    const lowerText = text.toLowerCase();
                    const found = [...groupWords].find(w => lowerText.includes(w));
                    if (found && await isBotAdmin()) {
                        await deleteAndNotify(`Inappropriate language is not allowed.`);
                        return;
                    }
                }
            }

            // 🚫 ANTISTICKER
            if (global.antisticker && msgType === 'stickerMessage') {
                if (await isBotAdmin()) {
                    await deleteAndNotify('Stickers are disabled in this group.');
                    return;
                }
            }

            // 🔕 ANTIMENTION — delete messages with too many @mentions
            if (global.antimentionEnabled) {
                const mentionLimit = global.antimentionLimit || 5;
                const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentions.length >= mentionLimit && await isBotAdmin()) {
                    await deleteAndNotify(`Mass-mentioning (${mentions.length} mentions) is not allowed.`);
                    return;
                }
            }
        }

        if (isCmd) await runCommand(text, sock, msg);
    });

    // Antidelete: intercept deleted messages and send content to owner DM silently
    sock.ev.on('messages.delete', async (deletedInfo) => {
        if (!global.antideleteEnabled) return;

        const keys = deletedInfo?.keys || [];
        for (const key of keys) {
            if (!key?.id) continue;

            const cached = MESSAGE_CACHE.get(key.id);
            if (!cached) continue;

            const senderNum = cleanJid(key.participant || key.remoteJid);
            const chatJid = key.remoteJid;
            const isGroup = chatJid?.endsWith('@g.us');

            const msgText = extractText(cached) || null;
            const msgType = cached.message ? Object.keys(cached.message)[0] : 'unknown';

            let report = `🗑️ *ANTIDELETE ALERT*\n\n`;
            report += `*Deleted by:* @${senderNum}\n`;
            report += `*Chat:* ${isGroup ? 'Group' : 'DM'} (${chatJid})\n\n`;

            try {
                if (msgText) {
                    report += `*Message:*\n${msgText}`;
                    await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, { text: report });
                } else if (msgType === 'imageMessage') {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const stream = await downloadContentFromMessage(cached.message.imageMessage, 'image');
                    let buf = Buffer.from([]);
                    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    report += `*Type:* Image`;
                    await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, {
                        image: buf,
                        caption: report
                    });
                } else if (msgType === 'videoMessage') {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const stream = await downloadContentFromMessage(cached.message.videoMessage, 'video');
                    let buf = Buffer.from([]);
                    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    report += `*Type:* Video`;
                    await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, {
                        video: buf,
                        caption: report
                    });
                } else {
                    report += `*Type:* ${msgType} (preview not available)`;
                    await sock.sendMessage(`${OWNER_NUMBER}@s.whatsapp.net`, { text: report });
                }
            } catch (err) {
                console.log('Antidelete send error:', err.message);
            }
        }
    });

    // Anti-call: auto-reject incoming calls
    sock.ev.on('call', async (calls) => {
        if (!global.anticallEnabled) return;
        for (const call of calls) {
            if (call.status === 'offer') {
                try {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: '❌ Sorry, I cannot accept calls. Please send a message instead.'
                    });
                } catch (err) {
                    console.log('Anti-call reject error:', err.message);
                }
            }
        }
    });

    // Welcome & Goodbye: handle group participant updates
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        try {
            const groupMeta = await sock.groupMetadata(id);
            const groupName = groupMeta.subject;

            if (action === 'add' && global.welcomeGroups?.has(id)) {
                for (const participant of participants) {
                    const name = `@${participant.split('@')[0]}`;
                    const customMsg = global.welcomeMessages?.get(id);
                    const welcomeText = customMsg
                        ? customMsg.replace('{name}', name).replace('{group}', groupName)
                        : `👋 Welcome to *${groupName}*, ${name}!\n\nWe're glad to have you here. Please read the group rules and enjoy your stay! 🎉`;

                    await sock.sendMessage(id, {
                        text: welcomeText,
                        mentions: [participant]
                    });
                }
            }

            if (action === 'remove' && global.goodbyeGroups?.has(id)) {
                for (const participant of participants) {
                    const name = `@${participant.split('@')[0]}`;
                    const customMsg = global.goodbyeMessages?.get(id);
                    const goodbyeText = customMsg
                        ? customMsg.replace('{name}', name).replace('{group}', groupName)
                        : `👋 Goodbye, ${name}! Thanks for being part of *${groupName}*. We'll miss you! 💙`;

                    await sock.sendMessage(id, {
                        text: goodbyeText,
                        mentions: [participant]
                    });
                }
            }
        } catch (err) {
            console.log('Welcome/Goodbye error:', err.message);
        }
    });
}

// ==============================
// 🟢 INIT
// ==============================
startBot();

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
process.on('SIGINT', () => {
    SOCKET?.ws.close();
    process.exit(0);
});