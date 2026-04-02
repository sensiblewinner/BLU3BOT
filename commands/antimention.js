// commands/antimention.js
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
        'antimention',
        'Auto-delete messages that spam @mentions (5 or more in one message)',
        '.antimention [on/off] [limit]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔕');

            const action = args[0]?.toLowerCase();
            const limitArg = parseInt(args[1]);

            if (!action || !['on', 'off'].includes(action)) {
                const status = global.antimentionEnabled ? '🟢 ON' : '🔴 OFF';
                const limit = global.antimentionLimit || 5;
                await reply(`🔕 *Anti-Mention Spam*\n\nUsage: \`.antimention on/off [limit]\`\n\nCurrent Status: ${status}\nMention Limit: ${limit} per message\n\nExample:\n\`.antimention on 3\` — kick anyone who mentions 3+ people at once`);
                return;
            }

            global.antimentionEnabled = action === 'on';
            if (!isNaN(limitArg) && limitArg > 0) {
                global.antimentionLimit = limitArg;
            } else if (action === 'on' && !global.antimentionLimit) {
                global.antimentionLimit = 5;
            }

            const msg = global.antimentionEnabled
                ? `🟢 *Anti-Mention Spam ON*\n\nMessages with ${global.antimentionLimit}+ mentions will be automatically deleted and the sender warned.`
                : `🔴 *Anti-Mention Spam OFF*\n\nMention spam protection has been disabled.`;

            await reply(msg);
        }
    )
};
