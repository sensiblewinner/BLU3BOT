// commands/blacklist.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.blacklistedUsers) global.blacklistedUsers = new Set();

module.exports = {
    command: new Command(
        'blacklist',
        'Block a user from using the bot entirely',
        '.blacklist [add/remove/list] [@mention or reply]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🚫');

            if (!global.blacklistedUsers) global.blacklistedUsers = new Set();

            const action = args[0]?.toLowerCase();
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned;

            if (!action || action === 'list') {
                if (global.blacklistedUsers.size === 0) {
                    await reply('✅ Blacklist is empty — no users blocked.');
                    return;
                }
                const list = [...global.blacklistedUsers]
                    .map((jid, i) => `${i + 1}. +${jid.replace('@s.whatsapp.net', '')}`)
                    .join('\n');
                await reply(`🚫 *Blacklisted Users (${global.blacklistedUsers.size})*\n\n${list}`);
                return;
            }

            if (action === 'add') {
                if (!target) {
                    await reply('Usage: Reply to a message or @mention a user.\n`.blacklist add @user`');
                    return;
                }
                global.blacklistedUsers.add(target);
                await Blu3Bot.sendMessage(from, {
                    text: `✅ @${target.split('@')[0]} has been blacklisted and can no longer use the bot.`,
                    mentions: [target]
                });
                return;
            }

            if (action === 'remove' || action === 'unban') {
                if (!target) {
                    await reply('Usage: Reply to a message or @mention a user.\n`.blacklist remove @user`');
                    return;
                }
                if (global.blacklistedUsers.delete(target)) {
                    await Blu3Bot.sendMessage(from, {
                        text: `✅ @${target.split('@')[0]} has been removed from the blacklist.`,
                        mentions: [target]
                    });
                } else {
                    await reply(`⚠️ That user is not in the blacklist.`);
                }
                return;
            }

            if (action === 'clear') {
                global.blacklistedUsers.clear();
                await reply('✅ Blacklist cleared — all users unblocked.');
                return;
            }

            await reply('Usage:\n`.blacklist add @user`\n`.blacklist remove @user`\n`.blacklist list`\n`.blacklist clear`');
        }
    ),
    ownerOnly: true,
    aliases: ['ban', 'unban', 'bl']
};
