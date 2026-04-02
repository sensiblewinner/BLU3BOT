// commands/welcome.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.welcomeGroups) global.welcomeGroups = new Set();
if (!global.goodbyeGroups) global.goodbyeGroups = new Set();
if (!global.welcomeMessages) global.welcomeMessages = new Map();
if (!global.goodbyeMessages) global.goodbyeMessages = new Map();

module.exports = {
    command: new Command(
        'welcome',
        'Toggle welcome & goodbye messages for a group',
        '.welcome [on/off] [custom message]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👋');

            if (!from.endsWith('@g.us')) {
                return reply('❌ This command can only be used in groups.');
            }

            const action = args[0]?.toLowerCase();

            if (!action || (action !== 'on' && action !== 'off' && action !== 'status' && action !== 'set')) {
                const isOn = global.welcomeGroups.has(from);
                const custom = global.welcomeMessages.get(from);
                return reply(
                    `👋 *WELCOME MESSAGE SETTINGS*\n\n` +
                    `*Current Status:* ${isOn ? '🟢 ON' : '🔴 OFF'}\n` +
                    `*Custom Message:* ${custom || '(Default)'}\n\n` +
                    `*Commands:*\n` +
                    `• .welcome on — Enable\n` +
                    `• .welcome off — Disable\n` +
                    `• .welcome set [custom message] — Set custom text\n` +
                    `  Use {name} for member name, {group} for group name`
                );
            }

            if (action === 'set') {
                const customMsg = args.slice(1).join(' ');
                if (!customMsg) return reply('Please provide a custom message.\nUse {name} for the member\'s name and {group} for the group name.');
                global.welcomeMessages.set(from, customMsg);
                return reply(`✅ Custom welcome message set:\n\n_${customMsg}_`);
            }

            if (action === 'on') {
                global.welcomeGroups.add(from);
                await react('✅');
                await reply('🟢 *Welcome Messages Enabled*\n\nNew members will be greeted when they join.');
            } else {
                global.welcomeGroups.delete(from);
                await react('✅');
                await reply('🔴 *Welcome Messages Disabled*\n\nNew members will not be greeted.');
            }
        }
    ),
    ownerOnly: true
};
