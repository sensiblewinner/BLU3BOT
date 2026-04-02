// commands/resetwarn.js
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
        'resetwarn',
        'Reset warnings for a user or clear all warnings in the group',
        '.resetwarn [@mention or reply | all]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔄');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            if (!global.warnings) global.warnings = new Map();

            const clearAll = args[0]?.toLowerCase() === 'all';
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned;

            if (clearAll) {
                global.warnings.set(from, new Map());
                await reply('✅ All warnings in this group have been cleared.');
                return;
            }

            if (!target) {
                await reply('🔄 *Reset Warnings*\n\nUsage:\n`.resetwarn @user` — clear one person\n`.resetwarn all` — clear everyone');
                return;
            }

            const groupWarns = global.warnings.get(from);
            if (!groupWarns || !groupWarns.has(target)) {
                await Blu3Bot.sendMessage(from, {
                    text: `⚠️ @${target.split('@')[0]} has no warnings to reset.`,
                    mentions: [target]
                });
                return;
            }

            groupWarns.delete(target);
            await Blu3Bot.sendMessage(from, {
                text: `✅ Warnings cleared for @${target.split('@')[0]}.`,
                mentions: [target]
            });
        }
    ),
    aliases: ['clearwarn', 'unwarn']
};
