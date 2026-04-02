// commands/setprefix.js
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
        'setprefix',
        'Change bot command prefix',
        '.setprefix [new prefix]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⚙️');
            
            if (!args[0]) {
                await reply('Please provide a new prefix.\nExample: .setprefix !');
                return;
            }

            const newPrefix = args[0];
            if (newPrefix.length > 2) {
                await reply('Prefix must be 1-2 characters long.');
                return;
            }

            // Update prefix in config/database
            global.config.PREFIX = newPrefix;
            await reply(`✅ Bot prefix changed to: *${newPrefix}*`);
        }
    ),
    ownerOnly: true
};