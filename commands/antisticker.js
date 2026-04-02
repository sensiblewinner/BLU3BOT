// commands/antisticker.js
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
        'antisticker',
        'Block stickers in group',
        '.antisticker [on/off]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🚫');
            
            const action = args[0]?.toLowerCase();

            if (!['on', 'off'].includes(action)) {
                await reply('Usage: .antisticker on/off');
                return;
            }

            if (!global.antiSticker) global.antiSticker = new Map();
            global.antiSticker.set(from, action === 'on');

            await reply(`✅ Anti-sticker ${action === 'on' ? 'enabled' : 'disabled'}.`);
        }
    ),
    adminOnly: true,
    groupOnly: true
};