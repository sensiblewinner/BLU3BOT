// commands/restart.js
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
        'restart',
        'Restart the bot process',
        '.restart',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔁');

            await reply(
                `🔁 *Restarting BLU3BOT...*\n\n` +
                `⏳ The bot will be back online in a few seconds.\n` +
                `_Goodbye!_`
            );

            // Give the message time to send, then exit
            // The workflow manager will restart the process automatically
            setTimeout(() => {
                console.log('🔁 Restart requested by owner. Exiting process...');
                process.exit(1);
            }, 2000);
        }
    ),
    ownerOnly: true
};
