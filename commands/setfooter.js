// commands/setfooter.js — Set a custom footer appended to all bot messages
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (global.botFooter === undefined) global.botFooter = null;

module.exports = {
    command: new Command(
        'setfooter',
        'Set a custom footer line appended to every bot response, or clear it',
        '.setfooter [text] | .setfooter off',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📝');

            const input = args.join(' ').trim();

            if (!input) {
                await reply(
                    `📝 *Bot Footer*\n\n` +
                    `Current: ${global.botFooter ? `_"${global.botFooter}"_` : '🔴 Not set'}\n\n` +
                    `Usage:\n` +
                    `• \`.setfooter Powered by BLU3BOT 🤖\` — set footer\n` +
                    `• \`.setfooter off\` — clear footer\n\n` +
                    `_The footer appears at the bottom of bot messages that use it._`
                );
                return;
            }

            if (input.toLowerCase() === 'off' || input.toLowerCase() === 'clear' || input.toLowerCase() === 'none') {
                global.botFooter = null;
                await react('✅');
                await reply('✅ Bot footer *cleared*. No footer will be shown.');
                return;
            }

            if (input.length > 100) {
                await reply('⚠️ Footer too long. Max 100 characters.');
                return;
            }

            global.botFooter = input;
            await react('✅');
            await reply(
                `✅ *Footer Set*\n\n` +
                `_"${input}"_\n\n` +
                `This will appear at the bottom of bot messages.\n` +
                `Use \`.setfooter off\` to remove it.`
            );
        }
    ),
    ownerOnly: true,
    aliases: ['footer', 'botfooter', 'signature', 'setsig']
};
