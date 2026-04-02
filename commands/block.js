// commands/block.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

module.exports = {
    command: new Command(
        'block',
        'Block users from using bot',
        '.block [@mention or reply]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🚫');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned;

            if (!target) {
                await reply('Please reply to a user or @mention them to block.');
                return;
            }

            if (!global.blockedUsers) global.blockedUsers = new Set();
            global.blockedUsers.add(target);
            
            await reply({
                text: `✅ @${target.split('@')[0]} has been blocked from using the bot.`,
                mentions: [target]
            });
        }
    ),
    ownerOnly: true
};