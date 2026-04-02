// commands/add.js
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
        'add',
        'Add a user to the group',
        '.add [phone number]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('➕');
            
            if (!args[0]) {
                await reply('⚠️ Provide a number to add.');
                return;
            }

            const num = args[0].replace(/\D/g, '');
            const userJid = `${num}@s.whatsapp.net`;

            try {
                await Blu3Bot.groupParticipantsUpdate(from, [userJid], 'add');
                await reply(`✅ ${num} added to the group.`);
            } catch {
                await reply('❌ Failed to add user. They may have privacy restrictions.');
            }
        }
    ),
    groupOnly: true,
    adminOnly: true
};