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
        if (!msg?.message || msg.key.fromMe) return;

        const text = extractText(msg);
        const isCmd = text.startsWith(PREFIX);

        console.log(
            chalk.magenta(
                `📩 ${msg.key.remoteJid.endsWith('@g.us') ? 'GROUP' : 'DM'} → ${text || '[MEDIA]'}`
            )
        );

        if (isCmd) await runCommand(text, sock, msg);
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