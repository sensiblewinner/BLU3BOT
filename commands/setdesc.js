// commands/setdesc.js
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
        'setdesc',
        'Set or update the group description',
        '.setdesc [new description]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📝');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            const desc = args.join(' ').trim();
            if (!desc) {
                await reply('📝 *Set Group Description*\n\nUsage: `.setdesc [new description]`\n\nExample:\n`.setdesc Welcome to our group! No spam allowed.`');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be an admin to update the group description.');
                    return;
                }

                await Blu3Bot.groupUpdateDescription(from, desc);
                await reply(`✅ *Group description updated!*\n\n_${desc}_`);
            } catch (err) {
                console.error('Setdesc error:', err.message);
                await reply('❌ Failed to update description. Make sure I am an admin.');
            }
        }
    ),
    aliases: ['desc', 'groupdesc', 'description']
};
