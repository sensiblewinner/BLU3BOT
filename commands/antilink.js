// commands/antilink.js
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
        'antilink',
        'Toggle antilink protection in groups',
        '.antilink [on/off]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🛡️');
            
            const action = args[0]?.toLowerCase();
            
            if (!action || (action !== 'on' && action !== 'off')) {
                await reply(`🛡️ *ANTILINK SETTINGS*\n\nUsage: .antilink on/off\n\n*Current Status:* ${global.antilinkEnabled ? '🟢 ON' : '🔴 OFF'}`);
                return;
            }

            global.antilinkEnabled = action === 'on';
            
            const statusMessage = global.antilinkEnabled ? 
                '🟢 *Antilink Activated*\n\nLinks will be automatically deleted in groups where I am admin.' :
                '🔴 *Antilink Deactivated*\n\nLinks will no longer be automatically deleted.';
            
            await reply(statusMessage);
        }
    ),
    execute: async (reply, react, from, message, args, Blu3Bot, context) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot, context);
    }
};