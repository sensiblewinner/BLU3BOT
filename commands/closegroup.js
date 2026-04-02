// commands/closegroup.js
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
        'closegroup',
        'Close group temporarily',
        '.closegroup',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔒');
            
            try {
                await Blu3Bot.groupSettingUpdate(from, 'announcement');
                await reply('🔒 Group closed. Only admins can send messages now.');
            } catch (error) {
                await reply('❌ Failed to close group.');
            }
        }
    ),
    adminOnly: true,
    botAdminOnly: true,
    groupOnly: true
};