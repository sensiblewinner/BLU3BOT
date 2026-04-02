// commands/leavegroup.js
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
        'leavegroup',
        'Bot leaves group',
        '.leavegroup',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👋');
            
            try {
                await reply('👋 Goodbye! Leaving group...');
                await Blu3Bot.groupLeave(from);
            } catch (error) {
                await reply('❌ Failed to leave group.');
            }
        }
    ),
    adminOnly: true,
    groupOnly: true
};