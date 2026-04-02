// commands/report.js
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
        'report',
        'Report users to admins',
        '.report [@mention or reply] [reason]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🚨');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned;
            const reason = args.slice(1).join(' ') || 'No reason provided';

            if (!target) {
                await reply('Please reply to a user or @mention them to report.');
                return;
            }

            const groupInfo = await Blu3Bot.groupMetadata(from);
            const admins = groupInfo.participants.filter(p => p.admin).map(p => p.id);

            await Blu3Bot.sendMessage(from, {
                text: `🚨 *USER REPORTED*\n\nReported: @${target.split('@')[0]}\nReason: ${reason}\nReporter: @${context.sender.split('@')[0]}\n\nAdmins have been notified.`,
                mentions: [target, context.sender, ...admins]
            }, { quoted: message });
        }
    ),
    groupOnly: true
};