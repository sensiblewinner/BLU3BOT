// commands/setpresence.js — Control bot WhatsApp online presence
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (global.botPresence === undefined) global.botPresence = 'available';

const MODES = {
    available:   { label: 'Online',      emoji: '🟢', wa: 'available'   },
    online:      { label: 'Online',      emoji: '🟢', wa: 'available'   },
    offline:     { label: 'Offline',     emoji: '⚫', wa: 'unavailable' },
    unavailable: { label: 'Offline',     emoji: '⚫', wa: 'unavailable' },
    typing:      { label: 'Typing...',   emoji: '✍️',  wa: 'composing'   },
    composing:   { label: 'Typing...',   emoji: '✍️',  wa: 'composing'   },
    recording:   { label: 'Recording 🎙️',emoji: '🎙️', wa: 'recording'   },
    voice:       { label: 'Recording 🎙️',emoji: '🎙️', wa: 'recording'   },
};

module.exports = {
    command: new Command(
        'setpresence',
        "Set the bot's WhatsApp presence status — online, offline, typing, recording",
        '.setpresence [online | offline | typing | recording]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👁️');

            const input = args[0]?.toLowerCase();
            const current = MODES[global.botPresence] || MODES['available'];

            if (!input) {
                const modeList = [...new Set(Object.values(MODES).map(m => m.label))]
                    .map(l => `  • ${l}`)
                    .join('\n');
                await reply(
                    `👁️ *Bot Presence*\n\n` +
                    `Current: ${current.emoji} *${current.label}*\n\n` +
                    `Modes:\n  • online\n  • offline\n  • typing\n  • recording\n\n` +
                    `Usage: \`.setpresence online\``
                );
                return;
            }

            const mode = MODES[input];
            if (!mode) {
                await reply(`❌ Unknown mode \`${input}\`\n\nChoose: online, offline, typing, recording`);
                return;
            }

            try {
                await Blu3Bot.sendPresenceUpdate(mode.wa);
                global.botPresence = input;
                await react('✅');
                await reply(`${mode.emoji} *Presence set to ${mode.label}*`);
            } catch (err) {
                await reply(`❌ Failed to update presence: ${err.message}`);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['presence', 'botstatus', 'online', 'setonline']
};
