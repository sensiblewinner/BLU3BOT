// commands/rename.js
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
        'rename',
        'Change the group subject (name)',
        '.rename [new group name]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📝');
            
            const newSubject = args.join(' ');
            if (!newSubject) {
                await reply('❗ Provide a new group name.');
                return;
            }

            try {
                await Blu3Bot.groupUpdateSubject(from, newSubject);
                await reply(`✅ Group name changed to: *${newSubject}*`);
            } catch {
                await reply('❌ Failed to change group name.');
            }
        }
    ),
    aliases: ['gname'],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true
};