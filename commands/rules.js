// commands/rules.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.groupRules) global.groupRules = new Map();

module.exports = {
    command: new Command(
        'rules',
        'Set or show group rules',
        '.rules | .rules set [text] | .rules clear',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📜');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            if (!global.groupRules) global.groupRules = new Map();

            const sub = args[0]?.toLowerCase();

            if (!sub || sub === 'show') {
                const rules = global.groupRules.get(from);
                if (!rules) {
                    await reply('📜 No rules have been set for this group yet.\n\nAdmins can set rules using:\n`.rules set [your rules text]`');
                } else {
                    try {
                        const meta = await Blu3Bot.groupMetadata(from);
                        await reply(`📜 *${meta.subject} — Rules*\n\n${rules}`);
                    } catch {
                        await reply(`📜 *Group Rules*\n\n${rules}`);
                    }
                }
                return;
            }

            if (sub === 'clear') {
                global.groupRules.delete(from);
                await reply('✅ Group rules cleared.');
                return;
            }

            if (sub === 'set') {
                const rulesText = args.slice(1).join(' ').trim();
                if (!rulesText) {
                    await reply('📜 *Set Group Rules*\n\nUsage: `.rules set [your rules text]`\n\nExample:\n`.rules set 1. No spam\n2. Be respectful\n3. No links`');
                    return;
                }
                global.groupRules.set(from, rulesText);
                await reply(`✅ Group rules updated!\n\nType \`.rules\` to show them.`);
                return;
            }

            // If no recognised sub, treat full message as the rules text (fallback)
            const rulesText = args.join(' ').trim();
            global.groupRules.set(from, rulesText);
            await reply('✅ Group rules saved! Type `.rules` to display them.');
        }
    )
};
