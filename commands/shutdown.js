// commands/shutdown.js
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
        'shutdown',
        'Gracefully shut down the bot',
        '.shutdown [reason]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🛑');

            const reason = args.join(' ') || 'Manual shutdown by owner';

            await reply(
                `🛑 *BLU3BOT Shutting Down*\n\n` +
                `📝 Reason : ${reason}\n` +
                `👤 By     : Owner\n\n` +
                `_The bot is now offline. Restart the process manually to bring it back._`
            );

            setTimeout(() => {
                console.log(`🛑 Shutdown requested: ${reason}`);
                process.exit(0);
            }, 2000);
        }
    ),
    ownerOnly: true,
    aliases: ['halt', 'off', 'killbot']
};
