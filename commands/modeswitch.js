// commands/modeswitch.js
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
        'modeswitch',
        'Switch between public/private mode',
        '.modeswitch [public/private]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔒');
            
            const mode = args[0]?.toLowerCase();
            
            if (!['public', 'private'].includes(mode)) {
                await reply('Usage: .modeswitch public/private');
                return;
            }

            global.botMode = mode;
            await reply(`✅ Bot mode switched to: *${mode.toUpperCase()}*`);
        }
    ),
    ownerOnly: true
};