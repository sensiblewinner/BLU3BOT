// commands/antidelete.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Store deleted messages
global.deletedMessages = new Map();

module.exports = {
    command: new Command(
        'antidelete',
        'Toggle anti-delete protection',
        '.antidelete [on/off]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🗑️');

            const action = args[0]?.toLowerCase();
            
            if (!action || (action !== 'on' && action !== 'off')) {
                await reply(`🗑️ *ANTI-DELETE SETTINGS*\n\nUsage: .antidelete on/off\n\n*Current Status:* ${global.antideleteEnabled ? '🟢 ON' : '🔴 OFF'}`);
                return;
            }

            global.antideleteEnabled = action === 'on';
            
            const statusMessage = global.antideleteEnabled ? 
                '🟢 *Anti-Delete Activated*\n\nDeleted messages will be forwarded to your DM.' :
                '🔴 *Anti-Delete Deactivated*\n\nDeleted messages will no longer be tracked.';
            
            await reply(statusMessage);
        }
    ),
    ownerOnly: true,
    stealth: true
};