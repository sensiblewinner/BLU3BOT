// commands/autoread.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Global variable to track auto-read status
global.autoReadEnabled = true;

module.exports = {
    command: new Command(
        'autoread',
        'Toggle auto-read messages on/off',
        '.autoread [on/off]',
        'settings',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const isOwner = context.sender === '254745469050@s.whatsapp.net' || context.sender === '236159347195979@lid';
            
            if (!isOwner) {
                await react("❌");
                return reply("❌ This command is for bot owner only!");
            }

            const action = args[0]?.toLowerCase();
            
            if (action === 'on' || action === 'enable' || action === 'true') {
                global.autoReadEnabled = true;
                await react("✅");
                await reply("✅ *Auto-Read ENABLED*\n\nMessages will be automatically marked as read");
            } else if (action === 'off' || action === 'disable' || action === 'false') {
                global.autoReadEnabled = false;
                await react("✅");
                await reply("✅ *Auto-Read DISABLED*\n\nMessages will NOT be marked as read");
            } else {
                // Show current status
                const status = global.autoReadEnabled ? "ENABLED ✅" : "DISABLED ❌";
                await react("📱");
                await reply(`📱 *Auto-Read Status*\n\nCurrent: ${status}\n\nUsage: ${context.prefix}autoread [on/off]`);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['read', 'autoreadstatus']
};