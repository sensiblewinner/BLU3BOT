// commands/goodbye.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.goodbyeGroups) global.goodbyeGroups = new Set();
if (!global.goodbyeMessages) global.goodbyeMessages = new Map();

module.exports = {
    command: new Command(
        'goodbye',
        'Toggle goodbye messages when members leave a group',
        '.goodbye [on/off] or .goodbye set [message]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👋');

            if (!from.endsWith('@g.us')) {
                return reply('❌ This command can only be used in groups.');
            }

            const action = args[0]?.toLowerCase();

            if (!action || (action !== 'on' && action !== 'off' && action !== 'set')) {
                const isOn = global.goodbyeGroups.has(from);
                const custom = global.goodbyeMessages.get(from);
                return reply(
                    `🚪 *GOODBYE MESSAGE SETTINGS*\n\n` +
                    `*Current Status:* ${isOn ? '🟢 ON' : '🔴 OFF'}\n` +
                    `*Custom Message:* ${custom || '(Default)'}\n\n` +
                    `*Commands:*\n` +
                    `• .goodbye on — Enable\n` +
                    `• .goodbye off — Disable\n` +
                    `• .goodbye set [message] — Custom text\n` +
                    `  Use {name} for member name, {group} for group name`
                );
            }

            if (action === 'set') {
                const customMsg = args.slice(1).join(' ');
                if (!customMsg) return reply('Please provide a custom message.');
                global.goodbyeMessages.set(from, customMsg);
                return reply(`✅ Custom goodbye message set:\n\n_${customMsg}_`);
            }

            if (action === 'on') {
                global.goodbyeGroups.add(from);
                await react('✅');
                await reply('🟢 *Goodbye Messages Enabled*\n\nMembers will be bid farewell when they leave.');
            } else {
                global.goodbyeGroups.delete(from);
                await react('✅');
                await reply('🔴 *Goodbye Messages Disabled*\n\nNo farewell messages will be sent.');
            }
        }
    ),
    ownerOnly: true
};
