// commands/warnlist.js
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
        'warnlist',
        'Show all current warnings in this group',
        '.warnlist',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📋');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            if (!global.warnings) global.warnings = new Map();
            const groupWarns = global.warnings.get(from);

            if (!groupWarns || groupWarns.size === 0) {
                await reply('✅ No active warnings in this group.');
                return;
            }

            let text = `⚠️ *Warning List*\n\n`;
            for (const [jid, count] of groupWarns.entries()) {
                text += `• @${jid.split('@')[0]}: *${count}/3* warning${count !== 1 ? 's' : ''}\n`;
            }

            const mentions = Array.from(groupWarns.keys());
            await Blu3Bot.sendMessage(from, { text, mentions }, { quoted: message });
        }
    ),
    aliases: ['warns', 'warnings']
};
