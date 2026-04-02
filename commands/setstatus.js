// commands/setstatus.js
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
        'setstatus',
        "Set the bot's WhatsApp About/bio text",
        '.setstatus [text]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✍️');

            const statusText = args.join(' ');
            if (!statusText) {
                return reply('Please provide a status text.\nExample: .setstatus Powered by Blu3Bot 🤖');
            }

            try {
                await Blu3Bot.updateProfileStatus(statusText);
                await react('✅');
                await reply(`✅ *WhatsApp Status Updated*\n\n_${statusText}_`);
            } catch (error) {
                console.error('Setstatus error:', error);
                await react('❌');
                await reply(`❌ Failed to update status: ${error.message}`);
            }
        }
    ),
    ownerOnly: true
};
