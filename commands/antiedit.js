// commands/antiedit.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Store original messages for edit tracking
global.originalMessages = new Map();

module.exports = {
    command: new Command(
        'antiedit',
        'Toggle anti-edit protection',
        '.antiedit [on/off]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✏️');

            const action = args[0]?.toLowerCase();
            
            if (!action || (action !== 'on' && action !== 'off')) {
                await reply(`✏️ *ANTI-EDIT SETTINGS*\n\nUsage: .antiedit on/off\n\n*Current Status:* ${global.antieditEnabled ? '🟢 ON' : '🔴 OFF'}`);
                return;
            }

            global.antieditEnabled = action === 'on';
            
            const statusMessage = global.antieditEnabled ? 
                '🟢 *Anti-Edit Activated*\n\nEdited messages will show original content in your DM.' :
                '🔴 *Anti-Edit Deactivated*\n\nMessage edits will no longer be tracked.';
            
            await reply(statusMessage);
        }
    ),
    ownerOnly: true,
    stealth: true
};