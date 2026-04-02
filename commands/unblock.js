// commands/unblock.js
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
        'unblock',
        'Unblock a user from using the bot',
        '.unblock [@mention or reply]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✅');

            if (!global.blockedUsers) global.blockedUsers = new Set();

            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned;

            if (!target) {
                if (global.blockedUsers.size === 0) {
                    return reply('📋 *Blocked Users List*\n\nNo users are currently blocked.');
                }
                let list = `📋 *Blocked Users*\n\n`;
                let i = 1;
                global.blockedUsers.forEach(jid => {
                    list += `${i++}. @${jid.split('@')[0]}\n`;
                });
                return reply(list + '\n_Reply to a user or @mention them to unblock._');
            }

            if (!global.blockedUsers.has(target)) {
                return reply(`⚠️ @${target.split('@')[0]} is not blocked.`);
            }

            global.blockedUsers.delete(target);

            await Blu3Bot.sendMessage(from, {
                text: `✅ @${target.split('@')[0]} has been unblocked and can use the bot again.`,
                mentions: [target]
            }, { quoted: message });
        }
    ),
    ownerOnly: true
};
