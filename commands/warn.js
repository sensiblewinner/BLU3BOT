// commands/warn.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Global warning store: Map<groupJid, Map<userJid, count>>
if (!global.warnings) global.warnings = new Map();

const MAX_WARNINGS = 3;

module.exports = {
    command: new Command(
        'warn',
        'Warn a user — 3 warnings results in an automatic kick',
        '.warn [@mention or reply]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⚠️');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned;

            if (!target) {
                await reply('⚠️ *Warn User*\n\nUsage: Reply to a message or @mention someone.\n\nExample:\n`.warn @user`');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be a group admin to warn members.');
                    return;
                }

                if (!global.warnings.has(from)) global.warnings.set(from, new Map());
                const groupWarns = global.warnings.get(from);
                const current = (groupWarns.get(target) || 0) + 1;
                groupWarns.set(target, current);

                const targetNum = target.split('@')[0];

                if (current >= MAX_WARNINGS) {
                    await Blu3Bot.sendMessage(from, {
                        text: `⛔ @${targetNum} has reached *${MAX_WARNINGS} warnings* and has been removed from the group.`,
                        mentions: [target]
                    });
                    await Blu3Bot.groupParticipantsUpdate(from, [target], 'remove');
                    groupWarns.delete(target);
                } else {
                    const remaining = MAX_WARNINGS - current;
                    await Blu3Bot.sendMessage(from, {
                        text: `⚠️ *Warning ${current}/${MAX_WARNINGS}*\n\n@${targetNum}, you have been warned.\n\n_${remaining} more warning${remaining !== 1 ? 's' : ''} and you will be removed._`,
                        mentions: [target]
                    });
                }
            } catch (err) {
                console.error('Warn error:', err.message);
                await reply('❌ Failed to warn user. Make sure I am an admin and the user is in this group.');
            }
        }
    )
};
