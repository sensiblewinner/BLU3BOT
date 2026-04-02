// commands/kick.js
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
        'kick',
        'Remove a user from the group',
        '.kick [reply to user or @mention]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🚪');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const tagged = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || tagged;

            if (!target) {
                await reply('⚠️ Tag or reply to the user you want to remove.');
                return;
            }

            try {
                await Blu3Bot.groupParticipantsUpdate(from, [target], 'remove');
                await Blu3Bot.sendMessage(from, {
                    text: `✅ @${target.split('@')[0]} has been removed.`,
                    mentions: [target]
                }, { quoted: message });
            } catch {
                await reply('❌ Failed to remove user.');
            }
        }
    ),
    aliases: ['remove'],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true
};