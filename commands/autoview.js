// commands/autoview.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Global variable to track auto-view status
global.autoViewStatusEnabled = false;

module.exports = {
    command: new Command(
        'autoview',
        'Toggle auto-view status on/off',
        '.autoview [on/off]',
        'settings',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const action = args[0]?.toLowerCase();
            
            if (action === 'on' || action === 'enable' || action === 'true') {
                global.autoViewStatusEnabled = true;
                await react("✅");
                await reply("✅ *Auto-View Status ENABLED*\n\nStatus updates will be automatically viewed");
            } else if (action === 'off' || action === 'disable' || action === 'false') {
                global.autoViewStatusEnabled = false;
                await react("✅");
                await reply("✅ *Auto-View Status DISABLED*\n\nStatus updates will NOT be viewed");
            } else {
                // Show current status
                const status = global.autoViewStatusEnabled ? "ENABLED ✅" : "DISABLED ❌";
                await react("👁️");
                await reply(`👁️ *Auto-View Status*\n\nCurrent: ${status}\n\nUsage: ${context.prefix}autoview [on/off]`);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['viewstatus', 'statusview']
};