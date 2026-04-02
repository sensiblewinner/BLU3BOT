// commands/delete.js
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
        'delete',
        'Delete bot messages',
        '.delete [reply to bot message]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🗑️');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo;
            
            if (!quoted) {
                await reply('Please reply to a bot message to delete it.');
                return;
            }

            try {
                await Blu3Bot.sendMessage(from, {
                    delete: quoted.stanzaId
                });
            } catch (error) {
                await reply('❌ Cannot delete this message.');
            }
        }
    )
};