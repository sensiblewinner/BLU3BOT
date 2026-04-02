// commands/opengroup.js
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
        'opengroup',
        'Reopen closed group',
        '.opengroup',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔓');
            
            try {
                await Blu3Bot.groupSettingUpdate(from, 'not_announcement');
                await reply('🔓 Group opened. All members can send messages now.');
            } catch (error) {
                await reply('❌ Failed to open group.');
            }
        }
    ),
    adminOnly: true,
    botAdminOnly: true,
    groupOnly: true
};