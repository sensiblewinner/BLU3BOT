// commands/grouplist.js
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
        'grouplist',
        'List all groups the bot is currently in',
        '.grouplist',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📋');

            try {
                const groups = await Blu3Bot.groupFetchAllParticipating();
                const entries = Object.values(groups);

                if (entries.length === 0) {
                    return reply('❌ Bot is not in any groups.');
                }

                let text = `📋 *BOT GROUP LIST*\n\n*Total:* ${entries.length} groups\n\n`;

                entries.slice(0, 30).forEach((g, i) => {
                    const memberCount = g.participants?.length || 0;
                    text += `${i + 1}. *${g.subject}*\n   👥 ${memberCount} members\n`;
                });

                if (entries.length > 30) {
                    text += `\n_...and ${entries.length - 30} more groups_`;
                }

                text += '\n\n*Powered by Blu3Bot*';

                await reply(text);
                await react('✅');
            } catch (error) {
                console.error('Grouplist error:', error);
                await react('❌');
                await reply(`❌ Failed to fetch groups: ${error.message}`);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['groups', 'listgroups']
};
