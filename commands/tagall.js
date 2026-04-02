// commands/tagall.js
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
        'tagall',
        'Mentions all members of the current group',
        '.tagall [message]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📢');
            
            try {
                const groupInfo = await Blu3Bot.groupMetadata(from);
                const participants = groupInfo.participants;

                if (!participants.length) {
                    await reply("⚠️ No participants found in this group.");
                    return;
                }

                const customText = args.length > 0 ? args.join(' ') : 'Hello everyone!';
                let mentionText = `*📣 ${customText}*\n\n`;
                participants.forEach((p, i) => {
                    mentionText += `${i + 1}. @${p.id.split('@')[0]}\n`;
                });

                await Blu3Bot.sendMessage(from, {
                    text: mentionText,
                    mentions: participants.map(p => p.id)
                }, { quoted: message });

            } catch (error) {
                await reply('❌ Something went wrong while tagging everyone.');
            }
        }
    ),
    aliases: ['mentionall'],
    groupOnly: true
};