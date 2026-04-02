// commands/autoreply.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.autoreplyEnabled) global.autoreplyEnabled = false;
if (!global.autoreplyMessage) global.autoreplyMessage = "I'm currently unavailable. I'll get back to you soon! 🤖";
if (!global.autoreplyContacted) global.autoreplyContacted = new Set();

module.exports = {
    command: new Command(
        'autoreply',
        'Auto-reply to DMs when the owner is away',
        '.autoreply [on/off/set/reset]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💬');

            const action = args[0]?.toLowerCase();

            if (!action) {
                return reply(
                    `💬 *AUTO-REPLY SETTINGS*\n\n` +
                    `*Status:* ${global.autoreplyEnabled ? '🟢 ON' : '🔴 OFF'}\n` +
                    `*Message:* _${global.autoreplyMessage}_\n\n` +
                    `*Commands:*\n` +
                    `• .autoreply on — Enable auto-reply\n` +
                    `• .autoreply off — Disable auto-reply\n` +
                    `• .autoreply set [message] — Set custom reply\n` +
                    `• .autoreply reset — Reset to default message`
                );
            }

            if (action === 'on') {
                global.autoreplyEnabled = true;
                global.autoreplyContacted.clear();
                await react('✅');
                return reply('🟢 *Auto-Reply Activated*\n\nDMs will receive an automatic reply (once per person).');
            }

            if (action === 'off') {
                global.autoreplyEnabled = false;
                global.autoreplyContacted.clear();
                await react('✅');
                return reply('🔴 *Auto-Reply Deactivated*\n\nNo more automatic replies.');
            }

            if (action === 'set') {
                const msg = args.slice(1).join(' ');
                if (!msg) return reply('Please provide a message after .autoreply set');
                global.autoreplyMessage = msg;
                return reply(`✅ Auto-reply message updated:\n\n_${msg}_`);
            }

            if (action === 'reset') {
                global.autoreplyMessage = "I'm currently unavailable. I'll get back to you soon! 🤖";
                return reply('✅ Auto-reply message reset to default.');
            }

            await reply('Unknown option. Use: on, off, set, or reset.');
        }
    ),
    ownerOnly: true
};
