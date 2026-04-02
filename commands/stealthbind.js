// commands/stealthbind.js
// Owner-only stealth trigger manager
// Usage:
//   .stealthbind              — list all current bindings
//   .stealthbind [emoji] [cmd] — bind an emoji to a stealth command
//   .stealthbind sticker [cmd] — reply to a sticker to bind it
//   .stealthunbind [emoji]     — remove an emoji binding
//   .stealthunbind sticker     — reply to a sticker to unbind it
//   .stealthreset              — restore default bindings

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const DEFAULT_BINDINGS = [
    ['🗑️',  'antidelete'],
    ['✏️',   'antiedit'],
    ['👁️',   'vv'],
    ['💾',   'save'],
    ['🔍',   'getprofile'],
];

function ensureMap() {
    if (!global.stealthTriggers) {
        global.stealthTriggers = new Map(DEFAULT_BINDINGS);
    }
}

function formatBindingList() {
    ensureMap();
    const entries = [...global.stealthTriggers.entries()];
    if (entries.length === 0) return '_No bindings set._';

    let text = '';
    for (const [trigger, cmd] of entries) {
        const isSticker = trigger.startsWith('sticker:');
        const label = isSticker ? `🃏 Sticker \`${trigger.slice(8, 16)}…\`` : trigger;
        text += `${label}  →  \`${cmd}\`\n`;
    }
    return text;
}

// ─── .stealthbind ────────────────────────────────────────────────────────────
const bindCommand = new Command(
    'stealthbind',
    'Bind an emoji or sticker to a stealth command',
    '.stealthbind [emoji] [cmd] | .stealthbind sticker [cmd]',
    'owner',
    async (reply, react, from, message, args, Blu3Bot, context) => {
        await react('🔐');
        ensureMap();

        // No args → show current bindings
        if (!args[0]) {
            const list = formatBindingList();
            await reply(
                `🔐 *Stealth Trigger Bindings*\n\n${list}\n` +
                `*Commands:*\n` +
                `\`.stealthbind [emoji] [cmd]\` — bind emoji\n` +
                `\`.stealthbind sticker [cmd]\` — reply to sticker to bind it\n` +
                `\`.stealthunbind [emoji]\` — remove a binding\n` +
                `\`.stealthreset\` — restore defaults\n\n` +
                `*Stealth commands available:*\n` +
                `antidelete · antiedit · vv · save · getprofile`
            );
            return;
        }

        // Sticker binding — must be a reply to a sticker
        if (args[0].toLowerCase() === 'sticker') {
            const cmdName = args[1]?.toLowerCase();
            if (!cmdName) {
                await reply('Usage: `.stealthbind sticker [commandname]`\nReply to a sticker and include the command name.');
                return;
            }

            const quotedSticker =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

            if (!quotedSticker?.fileSha256) {
                await reply('❌ Reply to a sticker first, then run `.stealthbind sticker [cmd]`');
                return;
            }

            const hash = Buffer.from(quotedSticker.fileSha256).toString('hex').slice(0, 16);
            const stickerKey = `sticker:${hash}`;
            global.stealthTriggers.set(stickerKey, cmdName);
            await reply(`✅ Sticker bound to \`.${cmdName}\`\nKey: \`${hash}…\`\n\nSend that sticker anywhere and I will silently run \`.${cmdName}\``);
            return;
        }

        // Emoji binding
        const emoji = args[0].trim();
        const cmdName = args.slice(1).join('').toLowerCase().replace(/^\./, '');

        if (!cmdName) {
            await reply(`Usage: \`.stealthbind ${emoji} [commandname]\`\nExample: \`.stealthbind 🕵️ getprofile\``);
            return;
        }

        global.stealthTriggers.set(emoji, cmdName);
        await reply(`✅ \`${emoji}\` is now bound to \`.${cmdName}\`\n\nSend ${emoji} anywhere as the owner and \`.${cmdName}\` will fire silently.`);
    }
);
bindCommand.ownerOnly = true;
bindCommand.stealth = true;

// ─── .stealthunbind ──────────────────────────────────────────────────────────
const unbindCommand = new Command(
    'stealthunbind',
    'Remove a stealth trigger binding',
    '.stealthunbind [emoji] | .stealthunbind sticker',
    'owner',
    async (reply, react, from, message, args, Blu3Bot, context) => {
        await react('🗑️');
        ensureMap();

        if (!args[0]) {
            await reply('Usage: `.stealthunbind [emoji]`\nOr reply to a sticker and use `.stealthunbind sticker`');
            return;
        }

        if (args[0].toLowerCase() === 'sticker') {
            const quotedSticker =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
            if (!quotedSticker?.fileSha256) {
                await reply('❌ Reply to the sticker you want to unbind first.');
                return;
            }
            const hash = Buffer.from(quotedSticker.fileSha256).toString('hex').slice(0, 16);
            const stickerKey = `sticker:${hash}`;
            if (global.stealthTriggers.delete(stickerKey)) {
                await reply(`✅ Sticker binding \`${hash}…\` removed.`);
            } else {
                await reply(`❌ No binding found for that sticker.`);
            }
            return;
        }

        const trigger = args[0].trim();
        if (global.stealthTriggers.delete(trigger)) {
            await reply(`✅ Binding for \`${trigger}\` removed.`);
        } else {
            await reply(`❌ No binding found for \`${trigger}\`.`);
        }
    }
);
unbindCommand.ownerOnly = true;
unbindCommand.stealth = true;

// ─── .stealthreset ───────────────────────────────────────────────────────────
const resetCommand = new Command(
    'stealthreset',
    'Restore default stealth trigger bindings',
    '.stealthreset',
    'owner',
    async (reply, react, from, message, args, Blu3Bot, context) => {
        await react('🔄');
        global.stealthTriggers = new Map(DEFAULT_BINDINGS);
        await reply(
            `✅ *Stealth triggers reset to defaults:*\n\n` +
            DEFAULT_BINDINGS.map(([e, c]) => `${e}  →  \`.${c}\``).join('\n')
        );
    }
);
resetCommand.ownerOnly = true;
resetCommand.stealth = true;

// ─── Export all three as an array ────────────────────────────────────────────
module.exports = [
    { command: bindCommand,   ownerOnly: true, stealth: true },
    { command: unbindCommand, ownerOnly: true, stealth: true },
    { command: resetCommand,  ownerOnly: true, stealth: true },
];
